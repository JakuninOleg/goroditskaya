import { services,serviceHref } from '../data/services';
import { primaryOrigin } from '../data/seo';
import { articles,articleHref } from '../data/articles';
export function GET(){
  const paths=['/','/uslugi/','/o-natale/','/kejsy/','/kejsy/niokr-62-mln/','/kontakty/','/materialy/','/stati/',...services.map(s=>serviceHref(s.slug)),...articles.map(article=>articleHref(article.slug))];
  return new Response('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+paths.map(path=>`<url><loc>${primaryOrigin}${path}</loc></url>`).join('')+'</urlset>',{headers:{'Content-Type':'application/xml; charset=utf-8'}});
}
