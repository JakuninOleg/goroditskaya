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

document.addEventListener('click', event => {
  const link = (event.target as Element).closest<HTMLElement>('[data-dialog-contact], [data-task]');
  if (!link) return;
  document.querySelectorAll<HTMLDialogElement>('dialog[open]').forEach(dialog => dialog.close());
  const field = document.querySelector<HTMLTextAreaElement>('#contact-form [name="message"]');
  if (field && !field.value.trim()) field.value = link.dataset.dialogContact ?? link.dataset.task ?? '';
});
