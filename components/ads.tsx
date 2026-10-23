'use client';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import { X } from 'lucide-react';
declare global { interface Window { adsbygoogle?: Record<string,unknown>[] } }
const AdContext=createContext(false);
export function AdProvider({children,productionData}:{children:React.ReactNode;productionData:boolean}) {
 const [consent,setConsent]=useState(false),[show,setShow]=useState(false);
 const live=process.env.NEXT_PUBLIC_ADS_MODE==='live'&&productionData;
 const client=process.env.NEXT_PUBLIC_ADSENSE_CLIENT||'';
 const configured=/^ca-pub-\d{16}$/.test(client);
 useEffect(()=>{try {const saved=localStorage.getItem('pinatlas-ad-preference');setConsent(saved==='allow');setShow(!saved);}catch{setShow(true);}},[]);
 function choose(allow:boolean){try{localStorage.setItem('pinatlas-ad-preference',allow?'allow':'deny');}catch{}setConsent(allow);setShow(false);if(!allow&&consent)window.location.reload();}
 return <AdContext.Provider value={live&&configured&&consent}>{children}{live&&configured&&consent&&<Script id="adsense" strategy="afterInteractive" async crossOrigin="anonymous" src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`}/>}{live&&configured&&<><button type="button" className="ad-preferences" onClick={()=>setShow(true)}>Ad preferences</button>{show&&<section role="dialog" aria-modal="false" aria-label="Advertising preferences" className="consent-panel"><h2>Your ad preferences</h2><p>Allow Google advertising to load? Google may use cookies or similar technologies. You can change this choice at any time.</p><div><button className="button secondary" onClick={()=>choose(false)}>Decline</button><button className="button" onClick={()=>choose(true)}>Allow ads</button></div><a href="/privacy">Privacy details</a></section>}</>}</AdContext.Provider>;
}
export function AdSlot({placement='leaderboard',isDev=(process.env.NEXT_PUBLIC_ADS_MODE??'placeholder')==='placeholder'}:{placement?:'leaderboard'|'content'|'anchor';isDev?:boolean}) {
 const permitted=useContext(AdContext),ref=useRef<HTMLModElement>(null),[dismissed,setDismissed]=useState(false);
 const slot=placement==='leaderboard'?process.env.NEXT_PUBLIC_AD_SLOT_LEADERBOARD:process.env.NEXT_PUBLIC_AD_SLOT_CONTENT;
 useEffect(()=>{if(isDev||!permitted||!slot||placement==='anchor'||!ref.current)return;const element=ref.current;let requested=false;const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)&&!requested){requested=true;try{(window.adsbygoogle=window.adsbygoogle||[]).push({});}catch{}observer.disconnect();}},{rootMargin:'200px'});observer.observe(element);return()=>observer.disconnect();},[permitted,slot,isDev,placement]);
 if(dismissed)return null;
 // AdSense Auto ads owns live anchors. Never pin a manual display ad over content.
 if(placement==='anchor'&&!isDev)return null;
 if(!isDev&&(!permitted||!slot))return null;
 return <aside aria-label="Advertisement" className={`ad-slot ad-${placement} ${isDev?'ad-placeholder':''}`}>{isDev?<><span>ADVERTISEMENT</span><small>{placement==='anchor'?'Mobile anchor · 320 × 50':placement==='content'?'Responsive in-content placement':'Responsive leaderboard · 728 × 90'}</small>{placement==='anchor'&&<button type="button" aria-label="Dismiss ad preview" onClick={()=>setDismissed(true)}><X size={16}/></button>}</>:<><span>ADVERTISEMENT</span><ins ref={ref} className="adsbygoogle" style={{display:'block'}} data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT} data-ad-slot={slot} data-ad-format="auto" data-full-width-responsive="true"/></>}</aside>;
}
