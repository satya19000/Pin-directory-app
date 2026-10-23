'use client';
import Link from 'next/link';
import { useState } from 'react';
import { MapPin, Search } from 'lucide-react';
import type { State } from '@/lib/types';
export function StateGrid({states,sample}:{states:State[];sample:boolean}) {const [filter,setFilter]=useState(''),[kind,setKind]=useState('All');const shown=states.filter(s=>(kind==='All'||s.kind===kind)&&s.name.toLowerCase().includes(filter.toLowerCase()));return <>
<div className="directory-controls"><div className="tabs" aria-label="Filter regions">{['All','State','Union territory'].map(k=><button key={k} onClick={()=>setKind(k)} aria-pressed={kind===k} className={kind===k?'active':''}>{k==='All'?'All regions':k==='State'?'States':'Union territories'}<span>{k==='All'?36:k==='State'?28:8}</span></button>)}</div><label className="filter-input"><Search size={16}/><span className="sr-only">Filter states</span><input value={filter} onChange={e=>setFilter(e.target.value)} placeholder="Find a state…"/></label></div>
<div className="state-grid">{shown.map(s=><Link className="state-card" key={s.slug} href={`/${s.slug}`} prefetch={false}><span className="state-icon"><MapPin size={20}/></span><span><h3>{s.name}</h3><p>{s.offices>0?<><b>{s.pincodes.toLocaleString('en-IN')}</b> {sample?'sample PINs':'PIN codes'} <span>· {s.districts} {s.districts===1?'district':'districts'}</span></>:<span>0 loaded PIN codes</span>}</p></span></Link>)}</div>{!shown.length&&<p className="empty-state">No regions match “{filter}”.</p>}
</>;}
