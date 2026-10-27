import assert from 'node:assert/strict';
import { readFile,readdir,stat,writeFile,mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { services } from '../src/data/services.ts';
import { caseStudies,caseHref } from '../src/data/cases.ts';
import { primaryOrigin,searchIndexingEnabled } from '../src/data/seo.ts';
import { legalAvailable,legalDocuments } from '../src/data/legal.ts';

async function files(directory){
  const entries=await readdir(directory,{withFileTypes:true});
  const nested=await Promise.all(entries.map(entry=>entry.isDirectory()?files(join(directory,entry.name)):[join(directory,entry.name)]));
  return nested.flat();
}
const htmlFiles=(await files('dist')).filter(path=>path.endsWith('.html'));
const pages=new Map();
const titles=new Set();
const descriptions=new Set();
for(const file of htmlFiles){
  const path='/'+file.replaceAll('\\','/').replace(/^dist\//,'').replace(/index\.html$/,'');
  const html=await readFile(file,'utf8');
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);
  assert.equal(ids.length,new Set(ids).size,`Duplicate IDs: ${path}`);
  const legalPage=path.startsWith('/dokumenty/');
  assert.equal([...html.matchAll(/<form\b[^>]*id="contact-form"/g)].length,legalPage?0:1,`Enquiry form on service/content pages only: ${path}`);
  if(path!=='/'&&!legalPage)assert(ids.includes('request'),`Local enquiry section: ${path}`);
  assert.equal([...html.matchAll(/<h1\b/g)].length,1,`One H1: ${path}`);
  const title=html.match(/<title>(.*?)<\/title>/s)?.[1];
  assert(title&&!titles.has(title),`Unique title: ${path}`);titles.add(title);
  const description=html.match(/<meta name="description" content="([^"]+)"/)?.[1];
  assert(description&&!descriptions.has(description),`Unique description: ${path}`);descriptions.add(description);
  const canonical=html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  assert.equal(canonical,path==='/404.html'?undefined:primaryOrigin+path,`Canonical: ${path}`);
  assert(!/data-faq-toggle|FAQPage|Лично веду|Обсудить (?:ваш )?проект|первые шаги/.test(html),`Removed sections or copy: ${path}`);
  const robots=path==='/404.html'||!searchIndexingEnabled?'noindex, nofollow':'index, follow';
  assert(html.includes(`name="robots" content="${robots}"`),`Index setting: ${path}`);
  for(const match of html.matchAll(/<script type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs))JSON.parse(match[1]);
  const sources=[...html.matchAll(/\b(?:src|href)="(\/[^"#]+)"/g)].map(match=>match[1]);
  for(const match of html.matchAll(/\bsrcset="([^"]+)"/g))for(const item of match[1].split(','))sources.push(item.trim().split(/\s+/)[0]);
  for(const source of sources.filter(source=>source.startsWith('/')&&/\.[a-z0-9]+(?:\?|$)/i.test(source))){
    assert((await stat(join('dist',new URL(source,primaryOrigin).pathname))).isFile(),`Missing file ${source} on ${path}`);
  }
  assert(!/Демонстрация|условные данные|отправка не подключена|данные ещё не отправлены|Или скачать комплект сразу|financial-templates\.xlsx|Технор[эе]д|С 1996/i.test(html),`Removed copy or ungated download: ${path}`);
  pages.set(path,{html,ids:new Set(ids),links:[...html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/g)].map(match=>match[1].replaceAll('&amp;','&'))});
}
assert.equal(pages.size,25+caseStudies.length+(legalAvailable?legalDocuments.length:0),'Expected content, legal documents and 404');
let checkedLinks=0;
const graph=new Map();
for(const [path,page] of pages){
  const destinations=[];
  for(const href of page.links){
    if(/^(mailto:|tel:|javascript:)/.test(href))continue;
    const url=new URL(href,primaryOrigin+path);
    if(url.origin!==primaryOrigin)continue;
    const destination=pages.get(url.pathname);
    if(!destination){assert((await stat(join('dist',url.pathname))).isFile(),`Broken link ${href} on ${path}`);continue;}
    checkedLinks++;
    if(url.hash)assert(destination.ids.has(decodeURIComponent(url.hash.slice(1))),`Broken anchor ${href} on ${path}`);
    destinations.push(url.pathname);
  }
  for(const match of page.html.matchAll(/\baria-controls="([^"]+)"/g))assert(page.ids.has(match[1]),`Missing control ${match[1]} on ${path}`);
  graph.set(path,destinations);
}
const reachable=new Set(['/']);
const queue=['/'];
for(const path of queue)for(const next of graph.get(path)??[])if(!reachable.has(next)){reachable.add(next);queue.push(next);}
for(const path of pages.keys())if(path!=='/404.html')assert(reachable.has(path),`Orphan page: ${path}`);
for(const service of services){
  const page=pages.get(`/uslugi/${service.slug}/`);
  assert(page,`Missing service ${service.slug}`);
  assert(!pages.has(`/${service.slug}/`),`Service must be nested under /uslugi/: ${service.slug}`);
  assert(page.html.includes('application/ld+json')&&page.html.includes('BreadcrumbList'),`Missing service/breadcrumb schema: ${service.slug}`);
  const relevant=caseStudies.filter(study=>study.services.includes(service.slug));
  assert(relevant.length>0,`Every service has relevant practical experience: ${service.slug}`);
  assert(relevant.some(study=>page.html.includes(`href="${caseHref(study.slug)}"`)),`Service links to a relevant case: ${service.slug}`);
}
for(const study of caseStudies){
  const page=pages.get(caseHref(study.slug));
  assert(page,`Missing case: ${study.slug}`);
  for(const slug of study.services)assert(page.html.includes(`/uslugi/${slug}/`),`Case links back to service ${slug}: ${study.slug}`);
}
for(const path of ['/','/kontakty/','/materialy/']){
  const html=pages.get(path).html;
  const phone=path==='/materialy/'?'templates-phone':'contact-phone';
  assert(new RegExp(`<input[^>]+id="${phone}"[^>]+required`).test(html),`Required phone: ${path}`);
}
const sitemap=await readFile('dist/sitemap.xml','utf8');
const sitemapUrls=[...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match=>match[1]);
assert.equal(new Set(sitemapUrls).size,pages.size-1,'Sitemap covers every content page exactly once');
for(const path of reachable)assert(sitemapUrls.includes(primaryOrigin+path),`Missing sitemap URL: ${path}`);
const robots=await readFile('dist/robots.txt','utf8');
assert(robots.includes('Allow: /'),'Crawlers can read the page indexing directive');
assert.equal(robots.includes('Sitemap:'),searchIndexingEnabled,'Advertise sitemap only after indexing is enabled');
await mkdir('research/internal-pages-2026-10-19',{recursive:true});
await writeFile('research/internal-pages-2026-10-19/build-check.json',JSON.stringify({pages:pages.size,internalPages:pages.size-2,checkedLinks,reachableContentPages:reachable.size,indexing:searchIndexingEnabled,origin:primaryOrigin,sitemapUrls},null,2));
console.log(`Page check passed: ${pages.size} HTML pages, ${checkedLinks} internal links, ${reachable.size} reachable content pages, unique metadata and valid assets.`);
const server=process.argv.find(arg=>arg.startsWith('--url='))?.slice(6);
if(server){
  const responses=await Promise.all([...reachable].map(async path=>{
    const response=await fetch(new URL(path,server));
    assert.equal(response.status,200,`HTTP ${path}`);
    const html=await response.text();
    assert(html.includes(`<link rel="canonical" href="${primaryOrigin+path}"`),`Live canonical/content mismatch: ${path}`);
    return {path,status:response.status};
  }));
  const missing=await fetch(new URL('/page-that-does-not-exist-20261019/',server));
  assert.equal(missing.status,404,'Unknown URLs must return 404');
  await Promise.all(services.map(async service=>{
    const old=await fetch(new URL(`/${service.slug}/`,server),{redirect:'manual'});
    assert.equal(old.status,404,`Old service URL must be removed without a redirect: ${service.slug}`);
  }));
  await mkdir('.sites-runtime',{recursive:true});
  await writeFile('.sites-runtime/http-check.json',JSON.stringify({server,responses,missingStatus:missing.status},null,2));
  console.log(`HTTP check passed: ${responses.length} content pages return 200; unknown URL returns 404.`);
}
