import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
test('Production sitemap routes partition more than 10,000 URLs without gaps or duplicates',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'pin-sitemap-'));try{
 const fixture=JSON.parse(fs.readFileSync('data/sample.json','utf8'))[0] as Record<string,unknown>;
 const rows=Array.from({length:10050},(_,i)=>({...fixture,officeName:`Synthetic office ${i}`}));const input=path.join(dir,'input.json');fs.writeFileSync(input,JSON.stringify(rows));
 const run=spawnSync(process.execPath,['--import','tsx','scripts/import-data.ts','--input',input,'--output',path.join(dir,'data/postal.sqlite'),'--kind','production','--source','Synthetic test only','--source-url','https://example.test/dataset','--as-of','2026-01-01'],{encoding:'utf8'});assert.equal(run.status,0,run.stderr);
 const index=pathToFileURL(path.resolve('app/sitemap-index.xml/route.ts')).href,chunk=pathToFileURL(path.resolve('app/sitemaps/[chunk]/route.ts')).href;
 const script=`import assert from 'node:assert/strict';const index=await import(${JSON.stringify(index)});const chunk=await import(${JSON.stringify(chunk)});process.chdir(${JSON.stringify(dir)});const i=await index.GET().text();assert.equal((i.match(/<sitemap>/g)||[]).length,2);const a=await chunk.GET(new Request('https://pins.test'),{params:Promise.resolve({chunk:'1'})});const b=await chunk.GET(new Request('https://pins.test'),{params:Promise.resolve({chunk:'2'})});const ax=await a.text(),bx=await b.text();assert.equal((ax.match(/<url>/g)||[]).length,10000);assert.equal((bx.match(/<url>/g)||[]).length,54);const paths=[...ax.matchAll(/<loc>(.*?)<\\/loc>/g),...bx.matchAll(/<loc>(.*?)<\\/loc>/g)].map(x=>x[1]);assert.equal(new Set(paths).size,10054);assert.ok(paths.every(x=>x.startsWith('https://pins.test/')));assert.equal((await chunk.GET(new Request('https://pins.test'),{params:Promise.resolve({chunk:'3'})})).status,404);console.log('Sitemap chunks verified');`;
 const verify=spawnSync(process.execPath,['--conditions=react-server','--import','tsx','--input-type=module','-e',script],{encoding:'utf8',env:{...process.env,ENABLE_INDEXING:'true',NEXT_PUBLIC_SITE_URL:'https://pins.test',VERCEL_ENV:'production'}});assert.equal(verify.status,0,verify.stderr);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
