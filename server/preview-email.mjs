import { mkdir, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { renderLeadEmail } from './email-template.mjs';

const option = name => process.argv[process.argv.indexOf(name) + 1];
const origin = 'https://jakuninoleg-goroditskaya-8680.twc1.net';
const lead = { requestId: crypto.randomUUID(), kind: 'consultation', name: 'Александр',
  phone: '79991234567', email: '', service: 'Управленческий учёт',
  page: '/uslugi/upravlencheskiy-uchet-proizvodstva/',
  message: 'Нужно наладить управленческий учёт на производстве. Сейчас отчёты собираем в Excel, а прибыль по заказам не видим.' };
const output = process.argv.includes('--out-dir') ? resolve(option('--out-dir')) : resolve('../research/email-design-2026-10-28');
await mkdir(output, { recursive: true });
const mail = renderLeadEmail(lead, origin);
for (const [name, rendered] of [
  ['phone', mail],
  ['email', renderLeadEmail({ ...lead, phone: '', email: 'alexander@example.test' }, origin)],
  ['materials', renderLeadEmail({ ...lead, kind: 'templates', email: 'alexander@example.test', service: '', page: '/materialy/' }, origin)],
]) {
  let browserHtml = rendered.html;
  for (const image of rendered.attachments) browserHtml = browserHtml.replaceAll('cid:' + image.content_id, `data:${image.content_type};base64,${image.content}`);
  await writeFile(join(output, `email-${name}.html`), browserHtml);
}
console.log('Email previews saved: ' + output);

if (process.argv.includes('--send')) {
  const to = process.argv.includes('--to') ? option('--to') : '';
  if (!/^[^\s@<>\r\n]+@[^\s@<>\r\n]+\.[^\s@<>\r\n]+$/.test(to)) throw new Error('Specify the authorised recipient with --to.');
  if (!process.env.RESEND_API_KEY) throw new Error('RESEND_API_KEY is required in the local environment.');
  const payload = { from: 'Городицкая и партнёры <forms@jakuninoleg.dev>', to: [to],
    subject: 'Макет заявки — Городицкая и партнёры', ...mail,
    text: `Письмо для проверки оформления.\n\nАлександр\nТелефон: +7 (999) 123-45-67\n\n${lead.message}\n\n${origin}${lead.page}` };
  const response = await fetch('https://api.resend.com/emails', { method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json', 'Idempotency-Key': `natalia-email-preview-${lead.requestId}` },
    body: JSON.stringify(payload), signal: AbortSignal.timeout(20_000) });
  const result = await response.json();
  if (!response.ok || !result.id) throw new Error(`Email preview was not accepted (HTTP ${response.status}).`);
  const receipt = { to, id: result.id, subject: payload.subject, acceptedAt: new Date().toISOString(), htmlBytes: Buffer.byteLength(mail.html) };
  await writeFile(join(output, 'send-receipt.json'), JSON.stringify(receipt, null, 2));
  console.log(JSON.stringify(receipt));
}
