import { primaryOrigin,searchIndexingEnabled } from '../data/seo';
export function GET(){
  // Crawlers must be able to read the noindex directive in HTML and HTTP headers.
  return new Response(`User-agent: *\nAllow: /\n${searchIndexingEnabled?`Sitemap: ${primaryOrigin}/sitemap.xml\n`:''}`,{headers:{'Content-Type':'text/plain; charset=utf-8'}});
}
