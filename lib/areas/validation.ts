import type {AreaOffice,AreaPhoto,WikiSummary} from './types';
export const normalized=(s:string)=>s.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
export function localityName(name:string){return name.replace(/\s*(?:g\.?\s*p\.?\s*o\.?|[hsb]\.?\s*o\.?)\s*$/i,'').trim();}
const aliases:Record<string,string>={bengaluru:'Bangalore',mysuru:'Mysore',rajahmundry:'Rajahmundry'};
export function canonicalTitle(name:string){return aliases[normalized(name)]||name;}
export function safeUrl(value:string,hosts:string[]){try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password&&hosts.includes(u.hostname)?u.href:null;}catch{return null;}}
export function matchesPlace(data:WikiSummary,requested:string,office:AreaOffice,scope:'locality'|'district'){
 if(data.type!=='standard'||!data.extract||!data.title)return false;
 const title=normalized(data.title.replace(/\([^)]*\)/g,''));
 const wanted=normalized(canonicalTitle(requested));
 if(title!==wanted && title!==wanted+' district')return false;
 const description=normalized(data.description||'');
 if(!/\b(city|town|village|district|suburb|neighbou?rhood|locality|municipality|settlement|capital|metropolis)\b/.test(description))return false;
 const text=normalized((data.description||'')+' '+data.extract);
 if(!/\bindia\b|\bindian\b/.test(text))return false;
 const state=normalized(office.state);
 if(!text.includes(state))return false;
 // Localities must match district context or authoritative coordinates. Cities named after
 // their own district can match directly. Ambiguous same-name villages are withheld.
 if(scope==='locality') {
  const district=normalized(office.district.replace(/\s+district$/i,''));
  const districtMatch=text.includes(district)||normalized(requested)===district;
  const c=data.coordinates;
  const close=c&&office.latitude!==null&&office.longitude!==null&&Math.abs(c.lat-office.latitude)<0.15&&Math.abs(c.lon-office.longitude)<0.15;
  if(!districtMatch&&!close)return false;
 }
 return true;
}
export function commonsFileName(source:string){
 const safe=safeUrl(source,['upload.wikimedia.org','thumb.wikimedia.org']);if(!safe)return null;
 const parts=new URL(safe).pathname.split('/');const index=parts.indexOf('commons');if(index<0)return null;
 const offset=parts[index+1]==='thumb'?4:3; // commons/[thumb/]a/ab/Original filename
 return decodeURIComponent(parts[index+offset]||'')||null;
}
export function plainText(html:string){return html.replace(/<[^>]*>/g,'').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/\s+/g,' ').trim();}
export function photoFromCommons(info:unknown,caption:string):AreaPhoto|null{
 if(!info||typeof info!=='object')return null;
 const v=info as {thumburl?:string;url?:string;descriptionurl?:string;thumbwidth?:number;thumbheight?:number;extmetadata?:Record<string,{value?:string}>};
 const m=v.extmetadata||{},get=(k:string)=>plainText(String(m[k]?.value||''));
 const license=get('LicenseShortName'),author=get('Artist');
 const url=safeUrl(v.thumburl||v.url||'',['upload.wikimedia.org','thumb.wikimedia.org']);
 const sourceUrl=safeUrl(v.descriptionurl||'',['commons.wikimedia.org']);
 const licenseUrl=safeUrl(get('LicenseUrl'),['creativecommons.org'])||(license==='Public domain'?'https://commons.wikimedia.org/wiki/Help:Public_domain':null);
 if(!url||!sourceUrl||!licenseUrl||!author||!(/^(CC BY(?:-SA)? [234]\.0|CC0(?: 1\.0)?|Public domain)$/.test(license)))return null;
 if(!Number.isFinite(v.thumbwidth)||!Number.isFinite(v.thumbheight)||!v.thumbwidth||!v.thumbheight)return null;
 return {url,sourceUrl,licenseUrl,license,author,caption,width:v.thumbwidth,height:v.thumbheight};
}
