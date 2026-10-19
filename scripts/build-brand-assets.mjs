import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import sharp from 'sharp';
import { create } from 'fontkitten';

const directory = 'public/brand';
await mkdir(directory, { recursive: true });
const master = await readFile(`${directory}/natalia-mark.svg`, 'utf8');
const paths = master.slice(master.indexOf('<path'), master.lastIndexOf('</svg>'));
const reversed = paths.replaceAll('#0f3d33', '#f5f2e8').replaceAll('#527464', '#c9d5c9').replaceAll('#92a39a', '#dce4d9');
const monochrome = paths.replace(/fill="#[a-f0-9]+"/g, 'fill="currentColor"');
const svg = (content, box = '0 0 210 210') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${box}" fill="none">${content}</svg>`;
await writeFile(`${directory}/natalia-mark-reversed.svg`, svg(reversed));
await writeFile(`${directory}/natalia-mark-mono.svg`, svg(monochrome));

// Outlined lettering keeps the downloadable lockup independent of installed fonts.
const serif = create(await readFile('node_modules/@fontsource/prata/files/prata-cyrillic-400-normal.woff'));
const sans = create(await readFile('node_modules/@fontsource/manrope/files/manrope-cyrillic-500-normal.woff'));
function lettering(text, font, size, x, y, spacing = 0, color = '#0f3d33') {
  const scale = size / font.unitsPerEm;
  let cursor = x;
  return [...text].map(character => {
    assert(font.hasGlyphForCodePoint(character.codePointAt(0)), `Missing logo glyph: ${character}`);
    const glyph = font.glyphForCodePoint(character.codePointAt(0));
    const path = `<path fill="${color}" d="${glyph.path.toSVG()}" transform="translate(${cursor.toFixed(3)} ${y}) scale(${scale} ${-scale})"/>`;
    cursor += glyph.advanceWidth * scale + spacing;
    return path;
  }).join('');
}
const wordmark = lettering('Наталья', serif, 56, 195, 70, -1.8)
  + lettering('Городицкая', serif, 56, 195, 133, -1.8)
  + lettering('ФИНАНСОВЫЙ ДИРЕКТОР', sans, 13, 197, 170, 2.2)
  + lettering('НА АУТСОРСЕ', sans, 13, 197, 195, 2.2);
const lockup = svg(`<g transform="translate(0 6) scale(.82)">${paths}</g>${wordmark}`, '0 0 620 222');
await writeFile(`${directory}/natalia-logo.svg`, lockup);
await writeFile(`${directory}/natalia-logo-reversed.svg`, lockup.replaceAll('#0f3d33', '#f5f2e8').replaceAll('#527464', '#c9d5c9').replaceAll('#92a39a', '#dce4d9'));
await sharp(Buffer.from(lockup)).resize({ width: 1860 }).png().toFile(`${directory}/natalia-logo.png`);
await sharp(Buffer.from(master)).resize(840, 840).png().toFile(`${directory}/natalia-mark.png`);

// Optical small-size version: two solid stems, one unbroken ribbon, one gold tip.
const icon = svg(`<rect width="64" height="64" rx="15" fill="#0f3d33"/><path fill="#f5f2e8" d="M14 13h4c5 0 8 3 8 8v18c0 7-4 12-11 13V20c0-3 0-5-1-7Zm25 39V29l10-6v29H39Z"/><path fill="#f5f2e8" d="M15 52c7-5 8-11 10-18 2-6 6-9 13-11 5-1 7-4 9-8-1 9-5 13-12 16-6 3-7 6-9 12-2 6-5 9-11 9Z"/><path fill="#d1ad64" d="M39 24v-7c0-5 7-7 15-7-2 6-6 9-11 11l-4 3Z"/>`, '0 0 64 64');
await writeFile('public/favicon.svg', icon);
await writeFile(`${directory}/natalia-avatar.svg`, icon);
for (const size of [16, 32, 48, 180, 512]) {
  const output = size === 180 ? 'public/apple-touch-icon.png' : size === 512 ? `${directory}/natalia-avatar.png` : `public/favicon-${size}.png`;
  await sharp(Buffer.from(icon)).resize(size, size).png().toFile(output);
}
const images = await Promise.all([16, 32, 48].map(size => readFile(`public/favicon-${size}.png`)));
const header = Buffer.alloc(6 + images.length * 16);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(images.length, 4);
let offset = header.length;
images.forEach((bytes, index) => {
  const size = [16, 32, 48][index];
  const entry = 6 + index * 16;
  header[entry] = size;
  header[entry + 1] = size;
  header.writeUInt16LE(1, entry + 4);
  header.writeUInt16LE(32, entry + 6);
  header.writeUInt32LE(bytes.length, entry + 8);
  header.writeUInt32LE(offset, entry + 12);
  offset += bytes.length;
});
await writeFile('public/favicon.ico', Buffer.concat([header, ...images]));
await mkdir('research/brand-2026-10-19', { recursive: true });
const presentation = svg(`<rect width="1400" height="660" fill="#f5f2e8"/><rect x="1000" width="400" height="660" fill="#0f3d33"/>`
  + lettering('ЗНАК И ЛОГОТИП', sans, 15, 60, 64, 2)
  + `<g transform="translate(60 171) scale(1.4)">${lockup.slice(lockup.indexOf('<g'), lockup.lastIndexOf('</svg>'))}</g>`
  + `<g transform="translate(1080 92) scale(1.2)">${reversed}</g>`
  + `<g transform="translate(1092 444)">${icon.slice(icon.indexOf('<rect'), icon.lastIndexOf('</svg>'))}</g>`
  + `<g transform="translate(1190 460) scale(.5)">${icon.slice(icon.indexOf('<rect'), icon.lastIndexOf('</svg>'))}</g>`
  + `<g transform="translate(1260 468) scale(.25)">${icon.slice(icon.indexOf('<rect'), icon.lastIndexOf('</svg>'))}</g>`, '0 0 1400 660');
await writeFile('research/brand-2026-10-19/brand-preview.svg', presentation);
await sharp(Buffer.from(presentation)).png().toFile('research/brand-2026-10-19/brand-preview.png');
for (const file of ['public/favicon-16.png', 'public/apple-touch-icon.png', `${directory}/natalia-logo.png`]) {
  const { channels } = await sharp(file).stats();
  assert(channels.some(channel => channel.stdev > 0), `Empty brand asset: ${file}`);
}
console.log('Brand assets ready: outlined logos, mark variants, avatars, favicon and touch icon.');
