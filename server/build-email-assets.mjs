import { readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const logo = await sharp(await readFile(new URL('../public/brand/natalia-logo.png', import.meta.url)))
  .resize(560, 200, { fit: 'contain', background: '#f5f2e9' })
  .flatten({ background: '#f5f2e9' }).png({ palette: true, compressionLevel: 9 }).toBuffer();
const icon = async content => sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#153d3a" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${content}</svg>`)).png().toBuffer();
const phone = await icon('<path d="m7 3 3 5-3 3c2 3 3 4 6 6l3-3 5 3-2 4C9 22 2 15 3 5z"/>');
const mail = await icon('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/>');
const assets = Object.fromEntries(Object.entries({ logo, phone, mail }).map(([key, content]) => [key, {
  filename: `natalia-${key}.png`, content_type: 'image/png', content_id: `natalia-${key}`, content: content.toString('base64'),
}]));
await writeFile(new URL('./email-assets.mjs', import.meta.url), '// Generated from the approved logo and existing Icon.astro paths.\nexport const emailAssets = ' + JSON.stringify(assets) + ';\n');
console.log(`Email assets generated: ${logo.length + phone.length + mail.length} bytes.`);
