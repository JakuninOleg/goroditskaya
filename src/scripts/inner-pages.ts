const page = document.querySelector<HTMLElement>('.inner-page');
if (page && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const intro = page.querySelector<HTMLElement>('.inner-hero-grid>div:first-child, .catalog-intro, .article-heading, .article-index-intro, .contact-page-grid>div:first-child, .error-page');
  const visual = page.querySelector<HTMLElement>('.hero-artwork, .inner-hero .inner-portrait');
  intro?.animate([{ transform: 'translateY(8px)' }, { transform: 'translateY(0)' }],
    { duration: 520, easing: 'cubic-bezier(.22,1,.36,1)' });
  visual?.animate([{ transform: 'translateY(14px)' }, { transform: 'translateY(0)' }],
    { duration: 680, easing: 'cubic-bezier(.22,1,.36,1)' });
  visual?.querySelectorAll<SVGPathElement>('svg path[stroke][fill="none"]').forEach(path => {
    const length = path.getTotalLength();
    if (!length) return;
    path.animate([{ strokeDasharray: String(length), strokeDashoffset: String(length) }, { strokeDasharray: String(length), strokeDashoffset: '0' }],
      { duration: 900, easing: 'cubic-bezier(.22,1,.36,1)' });
  });
}
