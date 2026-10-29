import { analytics, analyticsConsentVersion } from '../data/analytics';
import { analyticsPermitted, parseAnalyticsConsent } from '../lib/analytics-consent';

type MetrikaFunction = ((...args: unknown[]) => void) & { a?: unknown[][]; l?: number };
const w = window as Window & { dataLayer: unknown[]; gtag: (...args: unknown[]) => void; ym: MetrikaFunction };
const banner = document.getElementById('analytics-consent');
const storageKey = 'gorodickaya-analytics-consent';
let active = false;
let librariesAdded = false;
let currentChoice = storedChoice();

function storedChoice() {
  try { return parseAnalyticsConsent(localStorage.getItem(storageKey)); } catch { return null; }
}

function appendScript(id: string, src: string) {
  if (document.getElementById(id)) return;
  const script = document.createElement('script');
  script.id = id; script.async = true; script.src = src;
  document.head.append(script);
}

function activate() {
  if (active || !analyticsPermitted(location.hostname, currentChoice)) return;
  active = true;
  if (!librariesAdded) {
    w.dataLayer = w.dataLayer || [];
    w.gtag = w.gtag || function () { w.dataLayer.push(arguments); };
    if (!w.ym) {
      const queue: MetrikaFunction = (...args) => { queue.a!.push(args); };
      queue.a = []; queue.l = Date.now(); w.ym = queue;
    }
    if (analytics.googleId) {
      w.gtag('consent', 'default', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
      w.gtag('js', new Date());
      appendScript('google-site-analytics', 'https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(analytics.googleId));
    }
    if (analytics.metrikaId) appendScript('yandex-site-analytics', 'https://mc.yandex.ru/metrika/tag.js');
    librariesAdded = true;
  }
  if (analytics.googleId) {
    (w as unknown as Record<string, unknown>)['ga-disable-'+analytics.googleId] = false;
    w.gtag('consent', 'update', { analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
    w.gtag('config', analytics.googleId, { allow_google_signals: false, allow_ad_personalization_signals: false, page_location: location.origin+location.pathname, page_referrer: document.referrer ? new URL(document.referrer).origin : '' });
  }
  if (analytics.metrikaId) w.ym(analytics.metrikaId, 'init', { clickmap: false, trackLinks: true, accurateTrackBounce: true, webvisor: false, trackHash: false, url: location.origin+location.pathname, referer: document.referrer ? new URL(document.referrer).origin : '' });
}

function deactivate() {
  if (analytics.googleId) {
    (w as unknown as Record<string, unknown>)['ga-disable-'+analytics.googleId] = true;
    if (w.gtag) w.gtag('consent', 'update', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
  }
  if (active && analytics.metrikaId && w.ym) w.ym(analytics.metrikaId, 'destruct');
  active = false;
  for (const item of document.cookie.split(';')) {
    const name = item.split('=')[0].trim();
    if (!/^(?:_ga(?:_|$)|_gid$|_gat(?:_|$)|_ym_)/.test(name)) continue;
    for (const domain of ['', location.hostname, '.'+location.hostname]) document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax${domain?'; Domain='+domain:''}`;
  }
}

function choose(allowed: boolean) {
  currentChoice = allowed;
  try { localStorage.setItem(storageKey, JSON.stringify({ allowed, version: analyticsConsentVersion })); } catch { /* Storage can be disabled by the visitor. */ }
  if (allowed) activate(); else deactivate();
  if (banner) banner.hidden = true;
}

if (banner) {
  banner.querySelector('[data-analytics-allow]')?.addEventListener('click', () => choose(true));
  banner.querySelector('[data-analytics-deny]')?.addEventListener('click', () => choose(false));
  document.querySelectorAll('[data-analytics-settings]').forEach(button => button.addEventListener('click', () => { banner.hidden = false; }));
  if (analyticsPermitted(location.hostname, currentChoice)) activate();
  else if (currentChoice === null && location.hostname === analytics.primaryHostname) banner.hidden = false;
  window.addEventListener('storage', event => {
    if (event.key !== storageKey) return;
    currentChoice = storedChoice();
    if (analyticsPermitted(location.hostname, currentChoice)) activate(); else deactivate();
    banner.hidden = currentChoice !== null || location.hostname !== analytics.primaryHostname;
  });
}

document.addEventListener('site:lead-success', event => {
  if (!active) return;
  const kind = (event as CustomEvent).detail?.kind;
  if (kind !== 'consultation' && kind !== 'templates') return;
  if (analytics.metrikaId) w.ym(analytics.metrikaId, 'reachGoal', 'lead_success', { lead_type: kind });
  if (analytics.googleId) w.gtag('event', 'generate_lead', { lead_type: kind });
});

document.addEventListener('click', event => {
  if (!active || !(event.target instanceof Element)) return;
  const link = event.target.closest<HTMLAnchorElement>('a[href]');
  if (!link) return;
  const href = link.getAttribute('href') ?? '';
  const channel = href.startsWith('tel:') ? 'phone' : href.startsWith('mailto:') ? 'email' : /^https:\/\/(?:t\.me|wa\.me|max\.ru)\//.test(href) ? 'messenger' : '';
  if (!channel) return;
  if (analytics.metrikaId) w.ym(analytics.metrikaId, 'reachGoal', 'contact_'+channel);
  if (analytics.googleId) w.gtag('event', 'contact_click', { contact_channel: channel });
});
