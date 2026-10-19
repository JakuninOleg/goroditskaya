import { primaryOrigin,searchIndexingEnabled } from '../data/seo';
export function GET(){
  return new Response(`User-agent: *\n${searchIndexingEnabled?'Allow: /':'Disallow: /'}\nSitemap: ${primaryOrigin}/sitemap.xml\n`,{headers:{'Content-Type':'text/plain; charset=utf-8'}});
}
