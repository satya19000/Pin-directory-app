'use client';
export default function ErrorPage({reset}:{error:Error&{digest?:string};reset:()=>void}){return <div className="container page-content empty-state"><h1>The directory is temporarily unavailable.</h1><p>Please try loading the page again.</p><button className="button" onClick={reset}>Try again</button></div>;}
