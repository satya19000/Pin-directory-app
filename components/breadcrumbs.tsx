import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { StructuredData } from './structured-data';
import { absolute } from '@/lib/seo';
export type Crumb={label:string;href:string};
export function Breadcrumbs({items}:{items:Crumb[]}) { const all=[{label:'Home',href:'/'},...items]; return <>
<nav aria-label="Breadcrumb" className="breadcrumbs"><ol>{all.map((c,i)=><li key={c.href}>{i>0&&<ChevronRight size={13} aria-hidden="true"/>}{i===all.length-1?<span aria-current="page">{c.label}</span>:<Link href={c.href}>{c.label}</Link>}</li>)}</ol></nav>
<StructuredData data={{'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:all.map((c,i)=>({'@type':'ListItem',position:i+1,name:c.label,item:absolute(c.href)}))}}/>
</>; }
