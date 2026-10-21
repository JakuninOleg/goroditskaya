const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
type Swap = { animations: Animation[] };
const swaps = new WeakMap<HTMLElement, Swap>();

/** Cancel the previous swap so rapid selections always finish on the latest content. */
export async function transitionContent(elements: HTMLElement[], update: () => void, resize = false) {
  const key = elements[0];
  if (!key) { update(); return; }
  const opacity = elements.map(element => getComputedStyle(element).opacity);
  const heights = resize ? elements.map(element => element.getBoundingClientRect().height) : [];
  swaps.get(key)?.animations.forEach(animation => animation.cancel());
  const state: Swap = { animations: [] };
  swaps.set(key, state);
  elements.forEach((element, index) => {
    if (resize) element.style.height = heights[index] + 'px';
    element.setAttribute('aria-busy', 'true');
  });
  const wait = () => Promise.all(state.animations.map(animation => animation.finished.catch(() => undefined)));
  try {
    if (!reducedMotion.matches) {
      state.animations = elements.map((element, index) => element.animate(
        [{ opacity: opacity[index] }, { opacity: 0 }],
        { duration: 150, easing: 'ease-out', fill: 'forwards' }
      ));
      await wait();
      if (swaps.get(key) !== state) return;
    }
    const from = resize ? elements.map(element => element.getBoundingClientRect().height) : [];
    update();
    if (resize) elements.forEach(element => element.style.removeProperty('height'));
    const to = resize ? elements.map(element => element.getBoundingClientRect().height) : [];
    state.animations.forEach(animation => animation.cancel());
    state.animations = [];
    if (!reducedMotion.matches) {
      elements.forEach((element, index) => {
        state.animations.push(element.animate([{ opacity: 0 }, { opacity: 1 }],
          { duration: 320, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'forwards' }));
        if (resize && Math.abs(from[index] - to[index]) > 1) {
          element.style.height = from[index] + 'px';
          state.animations.push(element.animate([{ height: from[index] + 'px' }, { height: to[index] + 'px' }],
            { duration: 320, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'forwards' }));
        }
      });
      await wait();
    }
  } finally {
    if (swaps.get(key) === state) {
      state.animations.forEach(animation => animation.cancel());
      elements.forEach(element => { element.style.removeProperty('height'); element.removeAttribute('aria-busy'); });
      swaps.delete(key);
    }
  }
}
