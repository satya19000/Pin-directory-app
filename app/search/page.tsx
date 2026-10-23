import { first, type QueryParams } from '@/lib/params';
import { notFound } from 'next/navigation';
import { listOffices } from '@/lib/db';
import { pageMetadata } from '@/lib/seo';
import { Search } from '@/components/search';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { OfficeTable,Pagination } from '@/components/office-table';
export const metadata=pageMetadata('Search Indian PIN Codes | PIN Atlas','Search the postal directory by area or PIN code.','/search',false);
export default async function SearchPage({searchParams}:{searchParams:Promise<QueryParams>}){const sp=await searchParams,q=first(sp.q),page=first(sp.page,'1');const query=q.trim().slice(0,80);const current=Number(page);if(!Number.isSafeInteger(current)||current<1)notFound();const data=query.length>=3?listOffices({q:query,page:current}):null;if(data&&current>data.pages)notFound();return <div className="container page-content"><Breadcrumbs items={[{label:'Search',href:'/search'}]}/><div className="page-heading"><span className="section-kicker">DIRECTORY SEARCH</span><h1>{query?`Results for “${query}”`:'Find a PIN code'}</h1><p>Search by post office, town, district or PIN code.</p></div><div className="narrow-search"><Search/></div>{data?<><OfficeTable offices={data.rows}/><Pagination data={data} base="/search" q={query}/></>:<p className="empty-state">Enter at least three letters or digits to search.</p>}</div>;}
