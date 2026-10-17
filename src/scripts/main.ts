import { questions } from '../data/site';

function selectTab(group: HTMLElement, value: string, focus = false) {
  group.querySelectorAll<HTMLButtonElement>('[role="tab"]').forEach(tab => {
    if (tab.closest('[data-tabs]') !== group) return;
    const selected = tab.dataset.tab === value;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
    if (selected && focus) tab.focus();
  });
  group.querySelectorAll<HTMLElement>('[data-panel]').forEach(panel => {
    if (panel.closest('[data-tabs]') === group) panel.hidden = panel.dataset.panel !== value;
  });
}

document.querySelectorAll<HTMLElement>('[data-tabs]').forEach(group => {
  const tabs = [...group.querySelectorAll<HTMLButtonElement>('[role="tab"]')].filter(tab => tab.closest('[data-tabs]') === group);
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectTab(group, tab.dataset.tab!));
    tab.addEventListener('keydown', event => {
      let next = index;
      if (['ArrowRight', 'ArrowDown'].includes(event.key)) next = (index + 1) % tabs.length;
      else if (['ArrowLeft', 'ArrowUp'].includes(event.key)) next = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      else return;
      event.preventDefault();
      selectTab(group, tabs[next].dataset.tab!, true);
    });
  });
});

const questionSelect = document.querySelector<HTMLSelectElement>('[data-question-select]');
const moreQuestions = document.querySelector<HTMLDetailsElement>('.needs-more');
function closeMoreQuestions(restoreFocus = false) {
  if (!moreQuestions?.open) return;
  moreQuestions.open = false;
  if (restoreFocus) moreQuestions.querySelector('summary')?.focus({ preventScroll: true });
}
function selectQuestion(index: number) {
  const question = questions[index];
  if (!question) return;
  closeMoreQuestions(!!moreQuestions?.contains(document.activeElement));
  document.querySelectorAll<HTMLElement>('[data-question]').forEach(item => item.setAttribute('aria-pressed', String(Number(item.dataset.question) === index)));
  if (questionSelect) questionSelect.value = String(index);
  document.querySelector('[data-selected-question]')!.textContent = question.title;
  document.querySelectorAll<HTMLElement>('[data-question-icon]').forEach(icon => { icon.hidden = Number(icon.dataset.questionIcon) !== index; });
  document.querySelector('[data-iceberg-headline]')!.textContent = question.headline;
  document.querySelectorAll<HTMLElement>('[data-iceberg-check]').forEach((item, i) => { item.textContent = question.checks[i]; });
  document.querySelector('[data-iceberg-explanation]')!.textContent = question.explanation;
  const contact = document.querySelector<HTMLElement>('[data-iceberg-contact]');
  if (contact) contact.dataset.task = question.title;
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll<HTMLElement>('.needs-surface h3, .needs-check-list').forEach(item => item.animate([{ opacity: .5, transform: 'translateY(3px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 220, easing: 'cubic-bezier(.22,1,.36,1)' }));
  }
}
document.querySelectorAll<HTMLButtonElement>('[data-question]').forEach(button => button.addEventListener('click', () => selectQuestion(Number(button.dataset.question))));
questionSelect?.addEventListener('change', () => selectQuestion(Number(questionSelect.value)));
document.addEventListener('pointerdown', event => {
  if (!moreQuestions?.contains(event.target as Node)) closeMoreQuestions();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && moreQuestions?.open) closeMoreQuestions(true);
});
document.addEventListener('focusin', event => {
  if (!moreQuestions?.contains(event.target as Node)) closeMoreQuestions();
});
window.matchMedia('(max-width: 760px)').addEventListener('change', () => closeMoreQuestions());

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
  const open = menuToggle.getAttribute('aria-expanded') !== 'true';
  if (!open) { closeMenu(); return; }
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  if (mobileNav) mobileNav.hidden = !open;
  if (menuScrim) menuScrim.hidden = !open;
  masthead?.setAttribute('data-menu-open', '');
});
mobileNav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeMenu()));
masthead?.querySelector('.identity')?.addEventListener('click', () => closeMenu());
menuScrim?.addEventListener('click', () => closeMenu(true));
document.addEventListener('keydown', event => { if (event.key === 'Escape' && menuToggle?.getAttribute('aria-expanded') === 'true') closeMenu(true); });
document.addEventListener('focusin', event => {
  if (menuToggle?.getAttribute('aria-expanded') === 'true' && !masthead?.contains(event.target as Node)) closeMenu();
});
window.matchMedia('(min-width: 1281px)').addEventListener('change', () => closeMenu());

const productDialog = document.getElementById('product-dialog') as HTMLDialogElement;
document.querySelectorAll<HTMLButtonElement>('[data-product]').forEach(button => button.addEventListener('click', () => {
  selectTab(productDialog.querySelector('[data-tabs]')!, button.dataset.product!);
  productDialog.showModal();
}));
document.querySelectorAll<HTMLDialogElement>('dialog').forEach(dialog => {
  dialog.querySelector('.dialog-close')?.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
});
const infoDialog = document.getElementById('info-dialog') as HTMLDialogElement;
document.querySelectorAll<HTMLButtonElement>('[data-info]').forEach(button => button.addEventListener('click', () => {
  const source = document.getElementById('info-' + button.dataset.info);
  if (!source) return;
  document.getElementById('info-heading')!.textContent = source.querySelector('h3')!.textContent;
  document.getElementById('info-content')!.replaceChildren(...[...source.children].filter(item => item.tagName !== 'H3').map(item => item.cloneNode(true)));
  infoDialog.showModal();
}));

document.addEventListener('click', event => {
  const link = (event.target as Element).closest<HTMLElement>('[data-dialog-contact], [data-task]');
  if (!link) return;
  document.querySelectorAll<HTMLDialogElement>('dialog[open]').forEach(dialog => dialog.close());
  const field = document.querySelector<HTMLTextAreaElement>('#contact-form [name="message"]');
  if (field && !field.value.trim()) field.value = link.dataset.dialogContact ?? link.dataset.task ?? '';
});

const form = document.getElementById('contact-form') as HTMLFormElement;
form.addEventListener('submit', event => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const name = String(data.get('name') ?? '').trim();
  const company = String(data.get('company') ?? '').trim();
  const email = String(data.get('email') ?? '').trim();
  const message = String(data.get('message') ?? '').trim();
  const body = ['Наталья, добрый день!', '', 'Меня зовут ' + name + '.', 'Компания: ' + (company || 'не указана'), 'Рабочая почта: ' + email, '', 'Задача:', message || 'Хочу обсудить финансовую задачу бизнеса.', '', 'Прошу предложить возможный состав работ и формат сотрудничества.'].join('\n');
  const prepared = document.getElementById('prepared-message')!;
  const field = document.getElementById('prepared-text') as HTMLTextAreaElement;
  field.value = body;
  const link = document.getElementById('send-email') as HTMLAnchorElement;
  link.href = 'mailto:gorodickaya@yandex.ru?subject=' + encodeURIComponent('Обсуждение проекта' + (company ? ': ' + company : '')) + '&body=' + encodeURIComponent(body);
  prepared.hidden = false;
  document.getElementById('form-note')!.textContent = 'Письмо подготовлено. Для отправки откройте его в почте или скопируйте текст.';
  field.focus({ preventScroll: true });
  prepared.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'nearest' });
});
document.getElementById('copy-email')?.addEventListener('click', async () => {
  const field = document.getElementById('prepared-text') as HTMLTextAreaElement;
  try {
    await navigator.clipboard.writeText(field.value);
    document.getElementById('form-note')!.textContent = 'Текст скопирован. Отправьте его Наталье из своей почты.';
  } catch {
    field.focus(); field.select();
    document.getElementById('form-note')!.textContent = 'Выделенный текст можно скопировать вручную.';
  }
});
