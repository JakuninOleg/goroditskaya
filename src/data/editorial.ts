import type { Article } from './articles';
import type { CaseStudy } from './cases';

export type ArtKind = 'cash'|'ledger'|'connections'|'tax'|'model'|'review'|'planning'|'asset'|'contracts'|'guarantee'|'research';
const caseArt:Record<string,ArtKind>={
  'niokr-62-mln':'research','erp-proektnyy-uchet':'connections',
  'vosstanovlenie-ucheta-it-gruppy':'ledger','finansovaya-model-proizvodstva':'model',
  'podgotovka-k-proverke-investora':'review','kontrol-zatrat-stroitelstva':'planning',
  'kapitalnye-zatraty-proizvodstva':'asset','dogovory-i-proektnyy-uchet-it':'contracts',
  'bankovskie-garantii-proizvodstva':'guarantee',
};
export const caseArtKind=(slug:string):ArtKind=>caseArt[slug]??'connections';
export const readingMinutes=(texts:string[])=>Math.max(2,Math.ceil(texts.join(' ').split(/\s+/).length/180));
export const articleMinutes=(article:Article)=>readingMinutes([article.lead,article.takeaway,...article.sections.flatMap(s=>[s.title,...s.paragraphs,...(s.items??[]),...(s.example?[s.example.title,s.example.intro,...s.example.rows.flat(),s.example.conclusion]:[])])]);
export const caseMinutes=(study:CaseStudy)=>readingMinutes([study.summary,study.role,...study.problem,...study.actions.flatMap(a=>[a.title,a.text]),...study.results,study.conclusion]);
export const minuteLabel=(n:number)=>`${n} ${n%10===1&&n%100!==11?'минута':n%10>=2&&n%10<=4&&(n%100<12||n%100>14)?'минуты':'минут'} чтения`;
