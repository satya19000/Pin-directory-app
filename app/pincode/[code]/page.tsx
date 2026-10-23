import { AreaSection } from '@/components/area-section';
import { first, type QueryParams } from '@/lib/params';
import { notFound } from 'next/navigation';
import { listOffices } from '@/lib/db';
import { pageMetadata } from '@/lib/seo';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { OfficeTable,Pagination } from '@/components/office-table';
import { CopyPin } from '@/components/copy-pin';
import { AdSlot } from '@/components/ads';
type Props={params:Promise<{code:string}>;searchParams:Promise<QueryParams>};
export async function generateMetadata({params,searchParams}:Props){const {code}=await params,{page}=await searchParams;if(!/^[1-9]\d{5}$/.test(code))return {};const data=listOffices({pincode:code});return pageMetadata(`${code} PIN Code – Post Offices & Areas | PIN Atlas`,`Find all ${data.total} loaded post offices sharing PIN code ${code}. View office names, delivery status, districts and states.`,`/pincode/${code}${Number(first(page))>1?`?page=${Number(first(page))}`:''}`,data.total>0);}
export default async function PinPage({params,searchParams}:Props){const {code}=await params,sp=await searchParams,page=first(sp.page,'1');if(!/^[1-9]\d{5}$/.test(code))notFound();const current=Number(page);if(!Number.isSafeInteger(current)||current<1)notFound();const data=listOffices({pincode:code,page:current});if(!data.total||current>data.pages)notFound();return <div className="container page-content"><Breadcrumbs items={[{label:`PIN ${code}`,href:`/pincode/${code}`}]}/><AdSlot/><div className="page-heading"><span className="section-kicker">PIN CODE LOOKUP</span><h1 className="pin-page-title">{code}<CopyPin pin={code}/></h1><p>{data.total} {data.total===1?'post office shares':'post offices share'} this PIN code in the loaded dataset.</p></div><OfficeTable offices={data.rows}/><Pagination data={data} base={`/pincode/${code}`}/><AreaSection offices={data.rows}/><AdSlot placement="content"/><section className="info-panel"><h2>Using PIN code {code}</h2><p>Include your complete street address, locality, district and state along with this PIN. Select an office above to see its postal circle, region and division. Sharing a PIN does not mean that two offices have the same street address.</p></section></div>;}
