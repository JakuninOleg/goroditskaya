const menuToggle = document.querySelector<HTMLButtonElement>('.menu-toggle');
const mobileNav = document.getElementById('mobile-nav');
const menuScrim = document.querySelector<HTMLElement>('.masthead-scrim');
const masthead = document.querySelector<HTMLElement>('.masthead');
const closeMenu = (restoreFocus = false) => {
  menuToggle?.setAttribute('aria-expanded', 'false');
  menuToggle?.setAttribute('aria-label', 'Открыть меню');
  if (mobileNav) mobileNav.hidden = true;
  if (menuScrim) menuScrim.hidden = true;
  masthead?.removeAttribute('data-menu-open');
  if (restoreFocus) menuToggle?.focus();
};
menuToggle?.addEventListener('click', () => {
  if (menuToggle.getAttribute('aria-expanded') === 'true') { closeMenu(); return; }
  menuToggle.setAttribute('aria-expanded', 'true');
  menuToggle.setAttribute('aria-label', 'Закрыть меню');
  if (mobileNav) mobileNav.hidden = false;
  if (menuScrim) menuScrim.hidden = false;
  masthead?.setAttribute('data-menu-open', '');
});
mobileNav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeMenu()));
masthead?.querySelector('.identity')?.addEventListener('click', () => closeMenu());
menuScrim?.addEventListener('click', () => closeMenu(true));
document.addEventListener('keydown', event => { if (event.key === 'Escape' && menuToggle?.getAttribute('aria-expanded') === 'true') closeMenu(true); });
document.addEventListener('focusin', event => { if (menuToggle?.getAttribute('aria-expanded') === 'true' && !masthead?.contains(event.target as Node)) closeMenu(); });
window.matchMedia('(min-width: 1281px)').addEventListener('change', () => closeMenu());
