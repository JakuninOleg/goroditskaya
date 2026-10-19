type Rect = { left: number; top: number; width: number; height: number };
type Point = { x: number; y: number };

export function leaderPath(start: Point, end: Point, direction: 'horizontal' | 'up' | 'down') {
  if (direction === 'horizontal') {
    const reach = (end.x - start.x) * .45;
    return `M${start.x} ${start.y}C${start.x + reach} ${start.y} ${end.x - reach} ${end.y} ${end.x} ${end.y}`;
  }
  const reach = Math.min(40, Math.abs(end.y - start.y) * .45);
  const sign = direction === 'down' ? 1 : -1;
  return `M${start.x} ${start.y}C${start.x + (direction === 'down' ? 28 : 0)} ${start.y + reach * sign} ${end.x} ${end.y - reach * sign} ${end.x} ${end.y}`;
}

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
          ? { x: box.left - bounds.left + (name === 'depth' ? box.width / 2 : 25), y: (name === 'depth' ? box.top - 10 : box.bottom + 6) - bounds.top }
          : { x: box.left - bounds.left, y: box.top - bounds.top + (name === 'depth' ? box.height * .55 : 31) };
        const path = leaders.querySelector(`[data-${name}-leader]`)!;
        path.setAttribute('d', leaderPath(start, end, mobile ? (name === 'depth' ? 'down' : 'up') : 'horizontal'));
        leaders.querySelectorAll(`[data-${name}-dot], [data-${name}-ring]`).forEach(dot => {
          dot.setAttribute('cx', String(start.x));
          dot.setAttribute('cy', String(start.y));
        });
        if (name === 'depth') leaders.querySelector('[data-depth-arrow]')!.setAttribute('d', mobile ? `M${end.x - 4.25} ${end.y - 5.5}l4.25 5.5 4.25-5.5` : '');
      };
      connect('surface', { x: .56, y: .26 }, surface);
      connect('depth', { x: .52, y: mobile ? .83 : .65 }, depth);
      leaders.removeAttribute('hidden');
    };
    const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(update); };
    const observer = new ResizeObserver(schedule);
    [section, surface, depth, ...images].forEach(element => observer.observe(element));
    images.forEach(image => image.addEventListener('load', schedule));
    schedule();
  }
}
