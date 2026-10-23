import type { Office } from '../types';
export type AreaOffice = Pick<Office,'id'|'name'|'pincode'|'state'|'stateSlug'|'district'|'districtSlug'|'latitude'|'longitude'>;
export interface AreaPhoto { url:string; caption:string; author:string; license:string; licenseUrl:string; sourceUrl:string; width:number; height:number; }
export interface AreaHighlight { title:string; description:string; url:string; }
export interface AreaGuide {
 title:string; scope:'locality'|'district'; summary:string; description:string;
 highlights:AreaHighlight[]; photos:AreaPhoto[];
 sources:{title:string;url:string}[]; reviewedOn:string;
 provenance:'curated'|'wikipedia'; articleUrl?:string;
}
export interface WikiSummary {type?:string;title?:string;description?:string;extract?:string;originalimage?:{source:string};coordinates?:{lat:number;lon:number};content_urls?:{desktop?:{page?:string}};}
