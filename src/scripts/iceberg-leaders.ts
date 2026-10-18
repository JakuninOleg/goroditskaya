type Rect = { left: number; top: number; width: number; height: number };

/** Convert a point in the source photo to the displayed object-fit: cover frame. */
export function projectCoverPoint(frame: Rect, image: { width: number; height: number }, point: { x: number; y: number }) {
  const scale = Math.max(frame.width / image.width, frame.height / image.height);
  const width = image.width * scale;
  const height = image.height * scale;
  return {
    x: frame.left + (frame.width - width) * .52 + point.x * width,
    y: frame.top + (frame.height - height) * .5 + point.y * height,
  };
}

if (typeof document !== 'undefined') {
  const section = document.getElementById('tasks');
  const leaders = section?.querySelector<SVGSVGElement>('.needs-leaders');
  const surface = section?.querySelector<HTMLElement>('.needs-surface');
  const depth = section?.querySelector<HTMLElement>('.needs-depth');
  const images = [...section?.querySelectorAll<HTMLImageElement>('.needs-background img, .needs-scene img') ?? []];
  if (section && leaders && surface && depth) {
    let frame = 0;
    const update = () => {
      const image = images.find(image => image.getBoundingClientRect().width > 0);
      if (!image?.naturalWidth) return;
      const bounds = section.getBoundingClientRect();
      const photo = image.getBoundingClientRect();
      const mobile = window.matchMedia('(max-width:640px)').matches;
      const source = { width: image.naturalWidth, height: image.naturalHeight };
      const photoFrame = { left: photo.left - bounds.left, top: photo.top - bounds.top, width: photo.width, height: photo.height };
      leaders.setAttribute('viewBox', `0 0 ${bounds.width} ${bounds.height}`);
      const connect = (name: 'surface' | 'depth', point: { x: number; y: number }, panel: HTMLElement) => {
        const start = projectCoverPoint(photoFrame, source, point);
        const box = panel.getBoundingClientRect();
        const end = mobile
          ? { x: box.left - bounds.left + (name === 'depth' ? box.width / 2 : 22), y: (name === 'depth' ? box.top : box.bottom) - bounds.top }
          : { x: box.left - bounds.left, y: box.top - bounds.top + (name === 'depth' ? box.height * .55 : 31) };
        const path = leaders.querySelector(`[data-${name}-leader]`)!;
        const dot = leaders.querySelector(`[data-${name}-dot]`)!;
        if (mobile) {
          const mid = (start.y + end.y) / 2;
          path.setAttribute('d', `M${start.x} ${start.y}C${start.x} ${mid} ${end.x} ${mid} ${end.x} ${end.y}`);
        } else {
          const gap = end.x - start.x;
          const lead = Math.min(70, Math.max(0, gap * .3));
          path.setAttribute('d', `M${start.x} ${start.y}H${start.x + lead}L${end.x - lead} ${end.y}H${end.x}`);
        }
        dot.setAttribute('cx', String(start.x));
        dot.setAttribute('cy', String(start.y));
        if (name === 'depth') leaders.querySelector('[data-depth-arrow]')!.setAttribute('d', mobile ? `M${end.x - 6} ${end.y - 8}l6 8 6-8` : '');
      };
      connect('surface', { x: .56, y: .26 }, surface);
      connect('depth', { x: .52, y: mobile ? .91 : .65 }, depth);
      leaders.removeAttribute('hidden');
    };
    const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(update); };
    const observer = new ResizeObserver(schedule);
    [section, surface, depth, ...images].forEach(element => observer.observe(element));
    images.forEach(image => image.addEventListener('load', schedule));
    schedule();
  }
}
