import { services,serviceHref } from '../data/services';
import { primaryOrigin } from '../data/seo';
export function GET(){
  const paths=['/','/uslugi/','/o-natale/','/kejsy/','/kejsy/niokr-62-mln/','/kontakty/','/materialy/',...services.map(s=>serviceHref(s.slug))];
  return new Response('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+paths.map(path=>`<url><loc>${primaryOrigin}${path}</loc></url>`).join('')+'</urlset>',{headers:{'Content-Type':'application/xml; charset=utf-8'}});
}
