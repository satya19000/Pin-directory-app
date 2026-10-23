import 'server-only';
import type { Metadata } from 'next';
import { getDataset } from './db';
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/,'');
export const absolute = (path:string) => `${siteUrl}${path}`;
export function canIndex() { return process.env.ENABLE_INDEXING==='true' && process.env.VERCEL_ENV!=='preview' && getDataset().kind==='production'; }
export function pageMetadata(title:string,description:string,path:string,index=true):Metadata {
 return {title,description,alternates:{canonical:absolute(path)},robots:{index:canIndex()&&index,follow:true},openGraph:{title,description,url:absolute(path),siteName:'PIN Atlas',locale:'en_IN',type:'website',images:[{url:absolute('/opengraph-image'),width:1200,height:630}]},twitter:{card:'summary_large_image',title,description,images:[absolute('/opengraph-image')]}};
}
export const xmlEscape = (s:string) => s.replace(/[<>&"']/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c]!));
