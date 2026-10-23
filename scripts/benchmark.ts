import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { performance } from 'node:perf_hooks';
import Database from 'better-sqlite3';
const count=160000,dir=fs.mkdtempSync(path.join(os.tmpdir(),'pin-benchmark-'));
try {
 const rows=Array.from({length:count},(_,i)=>({pincode:String(100000+i%30000),officeName:`Test Village ${String(i).padStart(6,'0')} B.O`,officeType:'B.O',delivery:'Delivery',district:`Test District ${i%100}`,state:'Andhra Pradesh',circle:'Test Circle',region:'Test Region',division:'Test Division'}));
 const input=path.join(dir,'fixture.json'),file=path.join(dir,'postal.sqlite');fs.writeFileSync(input,JSON.stringify(rows));
 const start=performance.now();const result=spawnSync(process.execPath,['--import','tsx','scripts/import-data.ts','--input',input,'--output',file],{encoding:'utf8',maxBuffer:2e6});if(result.status!==0)throw new Error(result.stderr);
 const importSeconds=(performance.now()-start)/1000;const db=new Database(file,{readonly:true});
 const statements={pin:db.prepare('SELECT * FROM offices WHERE pincode>=? AND pincode<=? ORDER BY pincode,name,id LIMIT 8'),text:db.prepare('SELECT o.* FROM office_search s JOIN offices o ON o.rowid=s.rowid WHERE office_search MATCH ? ORDER BY rank LIMIT 8'),district:db.prepare('SELECT * FROM offices WHERE stateSlug=? AND districtSlug=? ORDER BY name,id LIMIT 50'),sitemap:db.prepare('SELECT path FROM urls WHERE seq>? AND seq<=? ORDER BY seq')};
 const timings:Record<string,{p50Ms:number;p95Ms:number}>={};
 for(const name of Object.keys(statements) as (keyof typeof statements)[]){const samples:number[]=[];for(let i=0;i<60;i++){const t=performance.now();if(name==='pin')statements.pin.all('123000','123999');else if(name==='text')statements.text.all('"Village"* AND "001"*');else if(name==='district')statements.district.all('andhra-pradesh','test-district-10');else statements.sitemap.all(10000,20000);samples.push(performance.now()-t);}samples.sort((a,b)=>a-b);timings[name]={p50Ms:Number(samples[30].toFixed(2)),p95Ms:Number(samples[57].toFixed(2))};}
 console.log(JSON.stringify({synthetic:true,records:count,databaseMB:Number((fs.statSync(file).size/1024/1024).toFixed(2)),importSeconds:Number(importSeconds.toFixed(2)),timings,note:'Local warm SQLite query timings; excludes cold starts, network, rendering and production traffic.'},null,2));db.close();
}finally{fs.rmSync(dir,{recursive:true,force:true});}
