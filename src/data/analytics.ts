export const analyticsConsentVersion = '2026-10-29';
export const analytics = {
  primaryHostname: 'gorodickaya.ru',
  metrikaId: 113895018 as number | null,
  googleId: 'G-TZ4VGF9XZ1',
};
export const yandexVerification = '760bf8a787d66007';
export const analyticsConfigured = Boolean(analytics.metrikaId || analytics.googleId);
