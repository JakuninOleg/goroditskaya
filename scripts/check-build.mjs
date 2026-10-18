import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';

const html = await readFile('dist/index.html', 'utf8');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
assert.equal(ids.length, new Set(ids).size, 'Duplicate HTML IDs');
for (const match of html.matchAll(/\b(?:href="#|aria-controls=")([^"\s]+)"/g)) {
  assert(ids.includes(match[1]), 'Missing target: ' + match[1]);
}
const assets = new Set([...html.matchAll(/\b(?:src|href)="(\/[^"#]+)"/g)].map(match => match[1]));
for (const match of html.matchAll(/\bsrcset="([^"]+)"/g)) {
  for (const item of match[1].split(',')) {
    const path = item.trim().split(/\s+/)[0];
    if (path.startsWith('/')) assets.add(path);
  }
}
for (const path of assets) assert((await stat(join('dist', path))).isFile(), 'Missing asset: ' + path);
assert.equal([...html.matchAll(/<h1\b/g)].length, 1);
assert(html.includes('noindex, nofollow'), 'Preserve draft indexing settings');
assert(!/Технор[эе]д|С 1996|Данные проекта предоставлены/i.test(html), 'Outdated or removed case copy');
for (const contour of ['accounting', 'capital', 'requirements']) {
  assert(html.includes('aria-controls="contour-panel-' + contour + '"'), 'Missing contour control');
  assert(html.includes('aria-labelledby="contour-tab-' + contour + '"'), 'Missing contour label');
}
assert(html.includes('Данные ещё не отправлены.'), 'Mail preparation must not imply delivery');
assert.equal((await readFile('dist/downloads/financial-templates.xlsx')).subarray(0, 2).toString(), 'PK', 'Invalid workbook');
console.log(`Build check passed: ${ids.length} unique IDs, ${assets.size} local assets, all controls and anchors resolved.`);
