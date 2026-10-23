import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {setTimeout as delay} from 'node:timers/promises';
test('Production HTTP routes, search, metadata and sample indexing guards',async()=>{
 const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--port','3107','--hostname','127.0.0.1'],{stdio:'pipe'});let output='';server.stdout.on('data',d=>output+=d);server.stderr.on('data',d=>output+=d);
 const origin='http://127.0.0.1:3107';
 try {
  let ready=false;for(let i=0;i<100;i++){try{const r=await fetch(origin);if(r.ok){ready=true;break;}}catch{}await delay(100);}assert.ok(ready,output);
  const api=await fetch(origin+'/api/search?q=Kaki');assert.equal(api.status,200);const data=await api.json() as {results:{stateSlug:string;districtSlug:string;slug:string}[]};assert.ok(data.results.length>0);
  const office=data.results[0];const officePath=`/${office.stateSlug}/${office.districtSlug}/${office.slug}`;
  for(const url of ['/','/andhra-pradesh','/andhra-pradesh/kakinada','/pincode/533001',officePath,'/search?q=Kaki&q=533','/about','/privacy','/terms','/opengraph-image']){const response=await fetch(origin+url);assert.equal(response.status,200,url);}
  const html=await(await fetch(origin+officePath)).text();assert.match(html,/application\/ld\+json/);assert.match(html,/BreadcrumbList/);assert.match(html,/PostOffice/);assert.match(html,/noindex/);assert.match(html,/rel="canonical"/);
  for(const url of ['/pincode/000000','/andhra-pradesh/not-a-district','/andhra-pradesh/kakinada?page=999','/sitemap-1.xml'])assert.equal((await fetch(origin+url)).status,404,url);
  assert.match(await(await fetch(origin+'/robots.txt')).text(),/Disallow: \//);
  assert.doesNotMatch(await(await fetch(origin+'/sitemap-index.xml')).text(),/<sitemap>/);
  assert.equal((await fetch(origin+'/api/search?q='+ 'a'.repeat(81))).status,400);
  assert.equal((await fetch(origin+'/api/search?q='+encodeURIComponent('" OR * ; DROP TABLE offices;'))).status,200);
 }finally{server.kill('SIGTERM');}
});
