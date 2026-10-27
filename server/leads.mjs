import { createHash } from 'node:crypto';
import { renderLeadEmail } from './email-template.mjs';

const recipient = 'Gorodickaya@yandex.ru';
const consentVersion = '2026-10-28';
const origins = new Set([
  'https://gorodickaya.ru',
  'https://jakuninoleg-goroditskaya-8680.twc1.net',
  'https://goroditskaya.vercel.app',
  'https://natalia-goroditskaya-finance.ideal-morel-9819.chatgpt.site',
]);
const emailPattern = /^[^\s@<>\r\n]+@[^\s@<>\r\n]+\.[^\s@<>\r\n]+$/;
const maxBody = 16_000;
const retention = 15 * 60_000;

export function createLeadHandler({ env = process.env, transport = fetch, logger = console } = {}) {
  const hits = new Map();
  const submissions = new Map();

  const reply = (origin, status, body) => Response.json(body, { status, headers: {
    ...(origin ? { 'Access-Control-Allow-Origin': origin } : {}),
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400', 'Cache-Control': 'no-store', Vary: 'Origin',
  } });

  async function deliver(lead, origin) {
    const title = lead.kind === 'templates' ? 'Запрос финансовых форм' : 'Заявка на консультацию';
    const time = new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' });
    const text = [title, `Номер: ${lead.requestId}`, `Время (МСК): ${time}`, '',
      ...(lead.name ? [`Имя: ${lead.name}`] : []),
      ...(lead.phone ? [`Телефон: +${lead.phone}`] : []),
      ...(lead.email ? [`Почта: ${lead.email}`] : []),
      ...(lead.service ? [`Услуга: ${lead.service}`] : []),
      `Страница: ${origin}${lead.page}`, '',
      lead.kind === 'templates' ? 'Запрошены: ДДС на 13 недель, прибыль по проектам, план-факт бюджета.' : (lead.message || 'Запрос на консультацию.'),
      '', 'Согласие на обработку данных: предоставлено.', `Редакция: ${consentVersion}`,
      `Документ: ${origin}/dokumenty/soglasie-na-obrabotku-dannyh/`,
    ].join('\n');
    const { html, attachments } = renderLeadEmail(lead, origin, { consentVersion });

    const from = env.NATALIA_FROM_EMAIL || env.CONTACT_FROM_EMAIL || '';
    const address = from.match(/<([^<>]+)>/)?.[1] || from;
    const mailReady = Boolean(env.RESEND_API_KEY && emailPattern.test(address));
    const telegramReady = Boolean(env.NATALIA_TELEGRAM_BOT_TOKEN && /^-?\d+$/.test(env.NATALIA_TELEGRAM_CHAT_ID || ''));
    const previous = submissions.get(lead.requestId);

    const send = async (channel, url, options, accepted) => {
      try {
        const response = await transport(url, { ...options, signal: AbortSignal.timeout(10_000) });
        const data = await response.json();
        if (response.ok && accepted(data)) return true;
        logger.error('natalia_delivery_failed', { channel, status: response.status, requestId: lead.requestId });
      } catch {
        logger.error('natalia_delivery_failed', { channel, requestId: lead.requestId });
      }
      return false;
    };

    const [email, telegram] = await Promise.all([
      previous?.email || (mailReady && send('email', 'https://api.resend.com/emails', {
        method: 'POST', headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json', 'Idempotency-Key': `natalia-${lead.requestId}` },
        body: JSON.stringify({ from: `Городицкая и партнёры <${address}>`, to: [recipient], subject: title,
          ...(lead.email ? { reply_to: lead.email } : {}), text, html, attachments }),
      }, data => typeof data.id === 'string')),
      previous?.telegram || (telegramReady && send('telegram', `https://api.telegram.org/bot${env.NATALIA_TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: env.NATALIA_TELEGRAM_CHAT_ID, text: text.slice(0, 4096), link_preview_options: { is_disabled: true } }),
      }, data => data.ok === true && Number.isInteger(data.result?.message_id))),
    ]);
    if (!mailReady) logger.error('natalia_delivery_not_configured', { channel: 'email' });
    if (!telegramReady && env.NATALIA_TELEGRAM_CHAT_ID) logger.error('natalia_delivery_not_configured', { channel: 'telegram' });
    return { email: Boolean(email), telegram: Boolean(telegram) };
  }

  return async function handle(request) {
    const origin = request.headers.get('origin') || '';
    const devOrigin = env.NODE_ENV !== 'production' && /^http:\/\/127\.0\.0\.1:\d+$/.test(origin);
    if (!origins.has(origin) && !devOrigin) return reply('', 403, { ok: false, error: 'forbidden_origin' });
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: reply(origin, 200, {}).headers });
    if (request.method !== 'POST') return reply(origin, 405, { ok: false, error: 'method_not_allowed' });
    if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) return reply(origin, 415, { ok: false, error: 'invalid_content_type' });

    const now = Date.now();
    for (const [key, times] of hits) if (times.at(-1) < now - 60_000) hits.delete(key);
    for (const [key, entry] of submissions) if (!entry.pending && entry.time < now - retention) submissions.delete(key);
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
    const recent = (hits.get(ip) || []).filter(time => time > now - 60_000);
    if (recent.length >= 5 || hits.size >= 10_000 || submissions.size >= 5_000) return reply(origin, 429, { ok: false, error: 'rate_limited' });
    hits.set(ip, [...recent, now]);

    let data;
    try {
      if (Number(request.headers.get('content-length')) > maxBody) return reply(origin, 413, { ok: false, error: 'payload_too_large' });
      const reader = request.body?.getReader();
      if (!reader) return reply(origin, 400, { ok: false, error: 'invalid_body' });
      const chunks = []; let size = 0;
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > maxBody) { await reader.cancel(); return reply(origin, 413, { ok: false, error: 'payload_too_large' }); }
        chunks.push(value);
      }
      data = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    } catch { return reply(origin, 400, { ok: false, error: 'invalid_json' }); }
    if (!data || typeof data !== 'object' || Array.isArray(data)) return reply(origin, 400, { ok: false, error: 'validation' });
    if (data.website) return reply(origin, 400, { ok: false, error: 'validation' });
    const textField = (key, max) => data[key] === undefined ? '' : (typeof data[key] === 'string' && data[key].length <= max ? data[key].trim() : null);
    const lead = { requestId: textField('requestId', 80), kind: data.kind, name: textField('name', 100),
      email: textField('email', 254), phone: textField('phone', 11), message: textField('message', 3000),
      service: textField('service', 180), page: textField('page', 300) };
    if (Object.values(lead).some(value => value === null)
      || !/^[a-zA-Z0-9_-]{16,80}$/.test(lead.requestId || '')
      || !['consultation', 'templates'].includes(lead.kind)
      || /[\r\n\x00-\x1f]/.test(lead.name + lead.service)
      || (lead.email && !emailPattern.test(lead.email))
      || (lead.phone && !/^7[3-9]\d{9}$/.test(lead.phone))
      || (!lead.email && !lead.phone)
      || (lead.kind === 'templates' && (!lead.email || !lead.phone))
      || !/^\/(?!\/)[^?#\s\\]*$/.test(lead.page)
      || data.consent !== true || data.consentVersion !== consentVersion) {
      return reply(origin, 400, { ok: false, error: 'validation' });
    }
    // A browser retry keeps the same key. Never send already accepted channels twice.
    const fingerprint = createHash('sha256').update(JSON.stringify({ ...lead, origin })).digest('hex');
    const existing = submissions.get(lead.requestId);
    if (existing && existing.fingerprint !== fingerprint) return reply(origin, 409, { ok: false, error: 'request_changed' });
    if (existing?.accepted) return reply(origin, 200, { ok: true, id: lead.requestId });
    const entry = existing || { fingerprint, time: now };
    if (!entry.pending) {
      submissions.set(lead.requestId, entry);
      entry.pending = deliver(lead, origin).then(channels => {
        Object.assign(entry, channels, { accepted: channels.email || channels.telegram });
        return entry.accepted;
      }).finally(() => { entry.pending = null; });
    }
    const accepted = await entry.pending;
    return reply(origin, accepted ? 200 : 502, accepted ? { ok: true, id: lead.requestId } : { ok: false, error: 'send_failed' });
  };
}
