import { emailAssets } from './email-assets.mjs';

const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
const font = 'Arial,Helvetica,sans-serif';
const green = '#153d3a';
const paper = '#f5f2e9';
const sage = '#e6ece5';
const muted = '#496354';

export function renderLeadEmail(lead, origin, { now = new Date(), consentVersion = '2026-10-28' } = {}) {
  const templates = lead.kind === 'templates';
  const heading = templates ? 'Запрос финансовых форм' : 'Новая заявка';
  const date = new Intl.DateTimeFormat('ru-RU', { timeZone: 'Europe/Moscow', day: 'numeric', month: 'long', year: 'numeric' }).format(now).replace(/\s*г\.$/, '');
  const time = new Intl.DateTimeFormat('ru-RU', { timeZone: 'Europe/Moscow', hour: '2-digit', minute: '2-digit' }).format(now);
  const phone = lead.phone ? lead.phone.replace(/^7(\d{3})(\d{3})(\d{2})(\d{2})$/, '+7 ($1) $2-$3-$4') : '';
  const emailHref = lead.email ? `mailto:${encodeURIComponent(lead.email).replace('%40', '@')}` : '';
  const actionHref = lead.phone ? `tel:+${lead.phone}` : emailHref;
  const actionLabel = lead.phone ? 'Позвонить клиенту' : 'Ответить клиенту';
  const actionIcon = lead.phone ? emailAssets.phone : emailAssets.mail;
  const pageUrl = new URL(lead.page, origin).href;
  const pageLabel = lead.page.startsWith('/uslugi/') ? 'Открыть страницу услуги' : 'Открыть страницу обращения';
  const service = lead.service || (templates ? 'Финансовые формы' : 'Консультация');
  const message = templates ? 'ДДС на 13 недель\nПрибыль по проектам\nПлан-факт бюджета' : (lead.message || 'Клиент оставил контакт для консультации.');
  const paragraph = escape(message).replace(/\r\n?|\n/g, '<br>');
  const logo = `<img src="cid:natalia-logo" width="280" height="100" alt="Городицкая и партнёры" style="display:block;width:280px;max-width:100%;height:auto;border:0;color:${green};font:600 23px/1.2 ${font};">`;
  const primaryContact = lead.phone
    ? `<p style="margin:0 0 7px;color:${muted};font-size:16px;line-height:24px;">Телефон</p><a href="${escape(actionHref)}" style="font-size:28px;line-height:36px;font-weight:700;color:${green};text-decoration:none;white-space:nowrap;">${escape(phone)}</a>`
    : `<p style="margin:0 0 7px;color:${muted};font-size:16px;line-height:24px;">Почта</p><a href="${escape(emailHref)}" style="font-size:23px;line-height:32px;font-weight:600;color:${green};text-decoration:none;word-break:break-all;">${escape(lead.email)}</a>`;

  const html = `<!doctype html>
<html lang="ru" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="x-apple-disable-message-reformatting"><meta name="format-detection" content="telephone=no,address=no,email=no,date=no"><meta name="color-scheme" content="light"><meta name="supported-color-schemes" content="light"><title>${heading}</title>
<style>
body,table,td,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}table,td{mso-table-lspace:0;mso-table-rspace:0}table{border-collapse:collapse}img{-ms-interpolation-mode:bicubic}body{margin:0!important;padding:0!important;width:100%!important}a[x-apple-data-detectors]{color:inherit!important;text-decoration:none!important}
@media only screen and (max-width:620px){.email-shell{padding:0!important}.email-pad{padding-left:24px!important;padding-right:24px!important}.email-title{font-size:30px!important;line-height:36px!important}.email-name{font-size:26px!important;line-height:34px!important}.email-cta{width:100%!important;max-width:none!important}.email-top{padding-top:28px!important}.email-footer{padding:22px 24px!important}}
@media only screen and (max-width:360px){.email-pad{padding-left:20px!important;padding-right:20px!important}.email-title{font-size:28px!important;line-height:34px!important}.email-date{font-size:14px!important}}
</style>
<!--[if mso]><xml><o:OfficeDocumentSettings xmlns:o="urn:schemas-microsoft-com:office:office"><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]-->
</head>
<body style="margin:0;padding:0;background-color:${sage};color:${green};font-family:${font};">
<div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">${escape(lead.name || 'Контакт клиента')} · ${escape(phone || lead.email)} · ${escape(service)}</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="${sage}" style="width:100%;background-color:${sage};"><tr><td class="email-shell" align="center" style="padding:32px 12px;">
<!--[if mso]><table role="presentation" width="640" align="center" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
<table role="presentation" width="640" cellspacing="0" cellpadding="0" border="0" bgcolor="${paper}" style="width:100%;max-width:640px;background-color:${paper};color:${green};font-family:${font};">
<tr><td class="email-pad email-top" style="padding:32px 38px 0;">${logo}</td></tr>
<tr><td class="email-pad" style="padding:25px 38px 0;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr><td height="1" bgcolor="#bd9e55" style="height:1px;font-size:1px;line-height:1px;background-color:#bd9e55;">&nbsp;</td></tr></table></td></tr>
<tr><td class="email-pad" style="padding:32px 38px 0;"><h1 class="email-title" style="margin:0;color:${green};font:700 38px/44px ${font};letter-spacing:-1px;">${heading}</h1><p class="email-date" style="margin:13px 0 0;color:${muted};font-size:16px;line-height:24px;">${escape(date)} &middot; ${time} МСК</p></td></tr>
<tr><td class="email-pad" style="padding:31px 38px 0;"><h2 class="email-name" style="margin:0 0 16px;color:${green};font:700 28px/36px ${font};">${escape(lead.name || 'Контакт клиента')}</h2>${primaryContact}${lead.phone && lead.email ? `<p style="margin:13px 0 0;font-size:17px;line-height:26px;"><a href="${escape(emailHref)}" style="color:${green};text-decoration:underline;word-break:break-all;">${escape(lead.email)}</a></p>` : ''}</td></tr>
<tr><td class="email-pad" style="padding:22px 38px 0;">
<!--[if mso]><v:roundrect href="${escape(actionHref)}" style="height:56px;v-text-anchor:middle;width:320px;" arcsize="50%" stroked="f" fillcolor="#e8c74f"><w:anchorlock/><center style="color:${green};font-family:${font};font-size:18px;font-weight:bold;">${actionLabel}</center></v:roundrect><![endif]-->
<!--[if !mso]><!--><table class="email-cta" role="presentation" width="320" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:320px;"><tr><td align="center" bgcolor="#e8c74f" style="background-color:#e8c74f;border-radius:32px;"><a href="${escape(actionHref)}" style="display:block;padding:17px 18px;color:${green};font-size:18px;line-height:24px;font-weight:700;text-align:center;text-decoration:none;border-radius:32px;"><img src="cid:${actionIcon.content_id}" width="22" height="22" alt="" style="display:inline-block;width:22px;height:22px;margin-right:10px;vertical-align:middle;border:0;">${actionLabel}</a></td></tr></table><!--<![endif]-->
</td></tr>
<tr><td class="email-pad" style="padding:32px 38px 0;"><h2 style="margin:0 0 13px;color:${green};font:700 21px/28px ${font};">${templates ? 'Какие материалы запросили' : 'Что нужно клиенту'}</h2><p style="margin:0;color:#242b2a;font-size:17px;line-height:28px;word-break:break-word;">${paragraph}</p></td></tr>
<tr><td class="email-pad" style="padding:26px 38px 0;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr><td height="1" bgcolor="#c3d0c3" style="height:1px;font-size:1px;line-height:1px;background-color:#c3d0c3;">&nbsp;</td></tr></table></td></tr>
<tr><td class="email-pad" style="padding:19px 38px 30px;"><p style="margin:0 0 6px;color:${muted};font-size:15px;line-height:24px;">${templates ? 'Материалы' : 'Услуга'}</p><p style="margin:0 0 17px;color:${green};font-size:19px;line-height:28px;">${escape(service)}</p><a href="${escape(pageUrl)}" style="color:${green};font-size:16px;line-height:26px;text-decoration:underline;">${pageLabel}&nbsp;&nbsp;→</a></td></tr>
<tr><td class="email-footer" bgcolor="${sage}" style="padding:22px 38px;background-color:${sage};color:${muted};font-size:13px;line-height:22px;"><p style="margin:0 0 3px;"><a href="${escape(origin)}/dokumenty/soglasie-na-obrabotku-dannyh/" style="color:${muted};text-decoration:none;">Согласие на обработку данных получено</a></p><p style="margin:0 0 9px;">Городицкая и партнёры</p><p style="margin:0;font-size:11px;line-height:18px;word-break:break-all;">Заявка ${escape(lead.requestId)}<br>Редакция согласия: ${escape(consentVersion)}</p></td></tr>
</table>
<!--[if mso]></td></tr></table><![endif]-->
</td></tr></table>
</body></html>`;
  return { html, attachments: [emailAssets.logo, actionIcon] };
}
