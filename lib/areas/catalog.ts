import catalog from '@/data/area-guides.json';
import type {AreaGuide,AreaOffice} from './types';
import {canonicalTitle,localityName,normalized} from './validation';
interface Entry {stateSlug:string;districtSlugs:string[];localities:string[];guide:AreaGuide}
const entries=catalog as Entry[];
export function getLocalGuide(office:AreaOffice):AreaGuide|null{
 const entry=entries.find(e=>e.stateSlug===office.stateSlug&&e.districtSlugs.includes(office.districtSlug));
 if(!entry)return null;
 const exact=entry.localities.some(name=>normalized(canonicalTitle(name))===normalized(canonicalTitle(localityName(office.name))));
 return {...entry.guide,scope:exact?'locality':'district'};
}
