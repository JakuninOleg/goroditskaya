import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { Readable } from 'node:stream';
import { createLeadHandler } from './leads.mjs';

const origin = 'https://jakuninoleg-goroditskaya-8680.twc1.net';
const lead = () => ({ requestId: crypto.randomUUID(), kind: 'consultation', name: 'Проверка',
  email: 'visitor@example.test', phone: '79181234567', message: 'Нужна финансовая диагностика.',
  service: 'Финансовая диагностика', page: '/uslugi/finansovaya-diagnostika/',
  consent: true, consentVersion: '2026-10-28', website: '' });

async function harness(t, { emailStatus = 200, telegramStatus = 200, configured = true } = {}) {
  const received = [];
  const listen = async server => {
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    t.after(() => new Promise(resolve => { server.closeAllConnections(); server.close(resolve); }));
    return `http://127.0.0.1:${server.address().port}`;
  };
  const provider = await listen(createServer(async (req, res) => {
    const chunks = []; for await (const chunk of req) chunks.push(chunk);
    received.push({ path: req.url, body: JSON.parse(Buffer.concat(chunks)), key: req.headers['idempotency-key'] });
    res.setHeader('Content-Type', 'application/json');
    if (req.url === '/emails') { res.statusCode = emailStatus; res.end(JSON.stringify({ id: 'mail-confirmation' })); }
    else { res.statusCode = telegramStatus; res.end(JSON.stringify({ ok: telegramStatus === 200, result: { message_id: 123 } })); }
  }));
  const handler = createLeadHandler({
    env: configured ? { NODE_ENV: 'production', RESEND_API_KEY: 'test-only', CONTACT_FROM_EMAIL: 'Existing sender <mail@example.test>', NATALIA_TELEGRAM_BOT_TOKEN: 'test-bot', NATALIA_TELEGRAM_CHAT_ID: '12345' } : { NODE_ENV: 'production' },
    transport: (url, options) => fetch(provider + new URL(url).pathname, options), logger: { error() {} },
  });
  const api = await listen(createServer(async (req, res) => {
    const request = new Request(`http://localhost${req.url}`, { method: req.method, headers: req.headers,
      ...(['POST', 'PUT'].includes(req.method) ? { body: Readable.toWeb(req), duplex: 'half' } : {}) });
    const response = await handler(request);
    res.writeHead(response.status, Object.fromEntries(response.headers)); res.end(await response.text());
  }));
  const post = (body, requestOrigin = origin) => fetch(api, { method: 'POST', headers: { Origin: requestOrigin, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  return { received, post, api };
}

test('заявка доходит в оба канала, получатель фиксирован, согласие и источник сохранены', async t => {
  const { post, received } = await harness(t);
  const response = await post({ ...lead(), to: 'attacker@example.test', chat_id: '999' });
  assert.equal(response.status, 200); assert.equal((await response.json()).ok, true);
  const email = received.find(item => item.path === '/emails');
  assert.deepEqual(email.body.to, ['Gorodickaya@yandex.ru']);
  assert.equal(email.body.reply_to, 'visitor@example.test');
  assert.match(email.body.text, /Телефон: \+79181234567/);
  assert.match(email.body.text, /Редакция: 2026-10-28/);
  assert.match(email.body.text, /Время \(МСК\):/);
  assert.match(email.body.text, /\/uslugi\/finansovaya-diagnostika\//);
  assert.equal(received.find(item => item.path.includes('sendMessage')).body.chat_id, '12345');
});

test('чужой origin, отсутствие согласия и неверные контакты не вызывают доставку', async t => {
  const { post, received } = await harness(t);
  assert.equal((await post(lead(), 'https://attacker.example')).status, 403);
  assert.equal((await post({ ...lead(), consent: false })).status, 400);
  assert.equal((await post({ ...lead(), email: '', phone: '123' })).status, 400);
  assert.equal((await post({ ...lead(), consentVersion: 'old' })).status, 400);
  assert.equal(received.length, 0);
});

test('формы требуют оба контакта; спам-ловушка и размер запроса проверяются сервером', async t => {
  const { post, received } = await harness(t);
  assert.equal((await post({ ...lead(), kind: 'templates', phone: '' })).status, 400);
  assert.equal((await post({ ...lead(), website: 'spam' })).status, 400);
  assert.equal((await post({ ...lead(), message: 'a'.repeat(17_000) })).status, 413);
  assert.equal(received.length, 0);
  assert.equal((await post({ ...lead(), kind: 'templates' })).status, 200);
  assert.match(received.find(item => item.path === '/emails').body.text, /Запрошены: ДДС/);
});

test('одновременный двойной клик и повтор не создают дубли; другой текст с тем же ключом отклоняется', async t => {
  const { post, received } = await harness(t); const data = lead();
  const responses = await Promise.all([post(data), post(data)]);
  assert.deepEqual(responses.map(response => response.status), [200, 200]);
  assert.equal((await post(data)).status, 200);
  assert.equal(received.length, 2);
  assert.equal((await post({ ...data, message: 'Другой запрос' })).status, 409);
});

test('при отказе обоих провайдеров нет ложного успеха; при отказе Telegram почта остаётся рабочей', async t => {
  const failed = await harness(t, { emailStatus: 503, telegramStatus: 503 });
  const failure = await failed.post(lead());
  assert.equal(failure.status, 502); assert.equal((await failure.json()).ok, false);
  const partial = await harness(t, { telegramStatus: 503 });
  assert.equal((await partial.post(lead())).status, 200);
  const missing = await harness(t, { configured: false });
  assert.equal((await missing.post(lead())).status, 502); assert.equal(missing.received.length, 0);
});

test('CORS preflight и ограничение частоты не отправляют лишние сообщения', async t => {
  const { api, post, received } = await harness(t);
  const preflight = await fetch(api, { method: 'OPTIONS', headers: { Origin: origin } });
  assert.equal(preflight.status, 204); assert.equal(preflight.headers.get('access-control-allow-origin'), origin);
  for (let count = 0; count < 5; count++) assert.equal((await post({ ...lead(), consent: false })).status, 400);
  assert.equal((await post(lead())).status, 429); assert.equal(received.length, 0);
});
