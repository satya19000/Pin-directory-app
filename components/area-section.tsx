import type {Office} from '@/lib/types';
import {getLocalGuide} from '@/lib/areas/catalog';
import {AreaExplorer} from './area-explorer';
export function AreaSection({offices}:{offices:Office[]}){
 const chosen=offices.find(o=>o.officeType==='H.O')||offices[0];if(!chosen)return null;
 const areas=offices.map(({id,name,pincode,state,stateSlug,district,districtSlug,latitude,longitude})=>({id,name,pincode,state,stateSlug,district,districtSlug,latitude,longitude}));
 return <AreaExplorer key={chosen.id} offices={areas} initialOffice={chosen.id} initialGuide={getLocalGuide(chosen)}/>;
}
