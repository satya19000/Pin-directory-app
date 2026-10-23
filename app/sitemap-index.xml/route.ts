import { urlCount,getDataset } from '@/lib/db';
import { absolute,canIndex,xmlEscape } from '@/lib/seo';
export const revalidate=86400;
export function GET(){const total=canIndex()?Math.ceil(urlCount()/10000):0;const date=getDataset().importedAt;const xml=`<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${Array.from({length:total},(_,i)=>`<sitemap><loc>${xmlEscape(absolute(`/sitemap-${i+1}.xml`))}</loc><lastmod>${date}</lastmod></sitemap>`).join('')}</sitemapindex>`;return new Response(xml,{headers:{'Content-Type':'application/xml; charset=utf-8','Cache-Control':'public, s-maxage=86400'}});}
