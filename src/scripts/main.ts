import { questions, questionCheckIcons } from '../data/site';
import { transitionContent } from './content-motion';

function selectTab(group: HTMLElement, value: string, focus = false) {
  const selectedTab = group.querySelector<HTMLButtonElement>(`[role="tab"][data-tab="${value}"]`);
  if (selectedTab?.getAttribute('aria-selected') === 'true') {
    if (focus) selectedTab.focus();
    return;
  }
  group.querySelectorAll<HTMLButtonElement>('[role="tab"]').forEach(tab => {
    if (tab.closest('[data-tabs]') !== group) return;
    const selected = tab.dataset.tab === value;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
    if (selected && focus) tab.focus();
  });
  const surfaces = [...group.querySelectorAll<HTMLElement>('[data-tab-surface]')];
  void transitionContent(surfaces, () => {
    group.querySelectorAll<HTMLElement>('[data-panel]').forEach(panel => {
      if (panel.closest('[data-tabs]') === group) panel.hidden = panel.dataset.panel !== value;
    });
  }, true);
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
let currentQuestion = 0;
function selectQuestion(index: number) {
  const question = questions[index];
  if (!question) return;
  closeMoreQuestions(!!moreQuestions?.contains(document.activeElement));
  if (index === currentQuestion) return;
  currentQuestion = index;
  document.querySelectorAll<HTMLElement>('[data-question]').forEach(item => item.setAttribute('aria-pressed', String(Number(item.dataset.question) === index)));
  if (questionSelect) questionSelect.value = String(index);
  document.querySelector('[data-selected-question]')!.textContent = question.title;
  document.querySelectorAll<HTMLElement>('[data-question-icon]').forEach(icon => { icon.hidden = Number(icon.dataset.questionIcon) !== index; });
  void transitionContent([...document.querySelectorAll<HTMLElement>('.needs-surface, .needs-depth')], () => {
    document.querySelector('[data-iceberg-headline]')!.textContent = question.headline;
    document.querySelectorAll<HTMLElement>('[data-iceberg-check]').forEach((item, i) => { item.textContent = question.checks[i]; });
    document.querySelectorAll<HTMLElement>('[data-check-art]').forEach(item => { item.hidden = item.dataset.checkArt !== questionCheckIcons[index][Number(item.dataset.checkPosition)]; });
    document.querySelector('[data-iceberg-explanation]')!.textContent = question.explanation;
  });
  const contact = document.querySelector<HTMLElement>('[data-iceberg-contact]');
  if (contact) contact.dataset.task = question.title;
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

document.addEventListener('click', event => {
  const link = (event.target as Element).closest<HTMLElement>('[data-dialog-contact], [data-task]');
  if (!link) return;
  document.querySelectorAll<HTMLDialogElement>('dialog[open]').forEach(dialog => dialog.close());
  const field = document.querySelector<HTMLTextAreaElement>('#contact-form [name="message"]');
  if (field && !field.value.trim()) field.value = link.dataset.dialogContact ?? link.dataset.task ?? '';
});
