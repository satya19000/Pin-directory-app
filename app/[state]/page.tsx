import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MapPin } from 'lucide-react';
import { getState, getStates, getDistricts } from '@/lib/db';
import { pageMetadata } from '@/lib/seo';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { AdSlot } from '@/components/ads';
import { Search } from '@/components/search';
export const revalidate=86400;
export function generateStaticParams(){return getStates().map(s=>({state:s.slug}));}
type Props={params:Promise<{state:string}>};
export async function generateMetadata({params}:Props){const {state}=await params,s=getState(state);if(!s)return {};return pageMetadata(`${s.name} PIN Codes & Post Offices | PIN Atlas`,`Browse ${s.offices} loaded post offices and ${s.pincodes} unique PIN codes across ${s.districts} districts in ${s.name}.`,`/${state}`,s.offices>0);}
export default async function StatePage({params}:Props){const {state}=await params,s=getState(state);if(!s)notFound();const districts=getDistricts(state);return <div className="container page-content"><Breadcrumbs items={[{label:s.name,href:`/${state}`}]}/><AdSlot/><div className="page-heading"><span className="section-kicker">{s.kind.toUpperCase()} DIRECTORY</span><h1>{s.name} PIN codes</h1><p>{s.offices.toLocaleString('en-IN')} loaded post offices · {s.pincodes.toLocaleString('en-IN')} PIN codes · {s.districts} districts</p></div><div className="narrow-search"><Search compact/></div><h2 className="list-heading">Browse by district</h2>{districts.length?<div className="state-grid">{districts.map(d=><Link className="state-card" href={`/${state}/${d.slug}`} key={d.slug} prefetch={false}><span className="state-icon"><MapPin size={20}/></span><span><h3>{d.name}</h3><p>{d.offices} offices · {d.pincodes} PIN codes</p></span></Link>)}</div>:<div className="empty-state"><h2>No records loaded for {s.name} yet</h2><p>This dataset does not currently cover this region. Try another state or verify your address with India Post.</p><Link href="/#states" className="text-link">Browse other states</Link></div>}<section className="info-panel"><h2>Finding a PIN code in {s.name}</h2><p>Select a district to see its post offices, delivery status and six-digit PIN codes. District names follow the imported source and may differ from newer administrative boundaries.</p></section></div>;}
