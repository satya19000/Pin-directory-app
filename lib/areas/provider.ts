import type {AreaGuide,AreaOffice,WikiSummary} from './types';
import {canonicalTitle,commonsFileName,localityName,matchesPlace,photoFromCommons,safeUrl} from './validation';
export type Fetcher=(url:string,init?:RequestInit & {next?:{revalidate:number}})=>Promise<Response>;
async function json(fetcher:Fetcher,url:string):Promise<unknown>{
 const r=await fetcher(url,{headers:{'User-Agent':'PINAtlas/1.1 (https://github.com/satya19000/Pin-directory-app)'},signal:AbortSignal.timeout(2500),next:{revalidate:86400}});
 if(!r.ok)throw new Error('Area source unavailable');return r.json();
}
export async function loadWikipediaGuide(office:AreaOffice,fetcher:Fetcher=fetch):Promise<AreaGuide|null>{
 const locality=canonicalTitle(localityName(office.name));
 const candidates=[{title:locality,requested:locality,scope:'locality' as const},{title:office.district+' district',requested:office.district,scope:'district' as const},{title:office.district,requested:office.district,scope:'district' as const}];
 const seen=new Set<string>();
 for(const candidate of candidates){
  if(!candidate.title||seen.has(candidate.title.toLowerCase()))continue;seen.add(candidate.title.toLowerCase());
  try{
   const data=await json(fetcher,'https://en.wikipedia.org/api/rest_v1/page/summary/'+encodeURIComponent(candidate.title)) as WikiSummary;
   if(!matchesPlace(data,candidate.requested,office,candidate.scope))continue;
   const article=safeUrl(data.content_urls?.desktop?.page||'',['en.wikipedia.org']);if(!article)continue;
   const photos:AreaGuide['photos']=[];
   const filename=data.originalimage?.source?commonsFileName(data.originalimage.source):null;
   if(filename){try{const params=new URLSearchParams({action:'query',format:'json',formatversion:'2',prop:'imageinfo',iiprop:'url|extmetadata',iiurlwidth:'960',titles:'File:'+filename});
    const result=await json(fetcher,'https://commons.wikimedia.org/w/api.php?'+params) as {query?:{pages?:{imageinfo?:unknown[]}[]}};
    const photo=photoFromCommons(result.query?.pages?.[0]?.imageinfo?.[0],data.title+' — article photograph');if(photo)photos.push(photo);
   }catch{/* Source text remains useful if licensed imagery is unavailable. */}}
   return {title:data.title!,scope:candidate.scope,description:data.description||'',summary:data.extract!.slice(0,1100),highlights:[],photos,sources:[{title:'Wikipedia contributors — '+data.title,url:article}],articleUrl:article,reviewedOn:new Date().toISOString().slice(0,10),provenance:'wikipedia'};
  }catch{/* Continue to a clearly labelled district fallback; postal lookup remains available. */}
 }
 return null;
}
