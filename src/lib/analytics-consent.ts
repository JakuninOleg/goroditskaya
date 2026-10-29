import { analyticsConsentVersion, analytics } from '../data/analytics.ts';

export function parseAnalyticsConsent(raw: string | null): boolean | null {
  try {
    const saved = JSON.parse(raw ?? 'null');
    return saved?.version === analyticsConsentVersion && typeof saved.allowed === 'boolean' ? saved.allowed : null;
  } catch { return null; }
}

export function analyticsPermitted(hostname: string, allowed: boolean | null): boolean {
  return hostname === analytics.primaryHostname && allowed === true;
}
