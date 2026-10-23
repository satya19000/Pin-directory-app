import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { parseArgs } from 'node:util';
import Database from 'better-sqlite3';
import { parse } from 'csv-parse';
import { STATES, canonicalState, slugify } from '../lib/states';
import type { Office, Dataset } from '../lib/types';
const { values } = parseArgs({ options: { input:{type:'string'}, output:{type:'string',default:'data/postal.sqlite'}, kind:{type:'string',default:'sample'}, source:{type:'string',default:'Bundled demonstration fixtures'}, 'source-url':{type:'string',default:''}, 'as-of':{type:'string',default:''} } });
if (!values.input) throw new Error('Usage: npm run data:import -- --input file.csv [--kind production --source name --source-url https://… --as-of YYYY-MM-DD]');
if (!['sample','production'].includes(values.kind!)) throw new Error('kind must be sample or production');
if (values.kind === 'production' && (!values.source || values.source === 'Bundled demonstration fixtures' || !/^https:\/\//.test(values['source-url']!) || !/^\d{4}-\d{2}-\d{2}$/.test(values['as-of']!) || Number.isNaN(Date.parse(values['as-of']!)))) throw new Error('Production imports require source, HTTPS source-url and valid as-of date.');
const output = path.resolve(values.output!);
fs.mkdirSync(path.dirname(output), {recursive:true});
const temporary = `${output}.tmp-${process.pid}`;
const db = new Database(temporary);
db.exec(fs.readFileSync(new URL('../lib/schema.sql', import.meta.url), 'utf8'));
const fields = ['id','pincode','name','officeType','delivery','district','districtSlug','state','stateSlug','slug','taluk','circle','region','division','latitude','longitude'];
const insert = db.prepare(`INSERT INTO offices (${fields.join(',')}) VALUES (${fields.map(f=>'@'+f).join(',')})`);
const previous = db.prepare('SELECT * FROM offices WHERE id=?');
const errors: {row:number;message:string}[] = [];
let rowNumber=0, records=0, duplicates=0, rejected=0;
const clean = (s: unknown) => String(s ?? '').normalize('NFC').trim().replace(/\s+/g,' ');
function normalize(raw: Record<string,unknown>): Office {
 const obj = Object.fromEntries(Object.entries(raw).map(([k,v])=>[k.toLowerCase().replace(/[^a-z0-9]/g,''),v]));
 const get = (...keys:string[]) => { for (const k of keys) if (obj[k] != null && clean(obj[k])) return clean(obj[k]); return ''; };
 const required = (...keys:string[]) => { const v=get(...keys); if(!v || /^(na|null|undefined)$/i.test(v)) throw new Error(`Missing ${keys[0]}`); if(v.length>180) throw new Error(`Too long: ${keys[0]}`); return v; };
 const state = canonicalState(required('state','statename')); if(!state) throw new Error('Unknown state; map it in lib/states.ts after checking source geography');
 const pincode=required('pincode','pin','postalcode'); if(!/^[1-9]\d{5}$/.test(pincode)) throw new Error('Invalid six-digit PIN');
 const name=required('officename','name'); const district=required('district','districtname'); const districtSlug=slugify(district); if(!districtSlug) throw new Error('District needs a Latin-script slug');
 const type=required('officetype','type').toUpperCase().replace(/[^A-Z]/g,'');
 const officeType=({BO:'B.O',SO:'S.O',HO:'H.O'} as const)[type as 'BO']; if(!officeType) throw new Error('Invalid office type');
 const deliveryRaw=required('delivery','deliverystatus').toLowerCase().replace(/[^a-z]/g,'');
 if(!['delivery','nondelivery'].includes(deliveryRaw)) throw new Error('Invalid delivery status');
 const coordinate=(key:string, alias:string, max:number) => { const v=get(key,alias); if(!v || /^(na|n\/a|null)$/i.test(v)) return null; const n=Number(v); if(!Number.isFinite(n)||Math.abs(n)>max) throw new Error(`Invalid ${key}`); return n; };
 const latitude=coordinate('latitude','lat',90), longitude=coordinate('longitude','lon',180);
 if((latitude===null)!==(longitude===null)) throw new Error('Coordinates must both be supplied or absent');
 const identity=[state.slug,districtSlug,name.toLowerCase(),pincode,officeType].join('|');
 const id=createHash('sha256').update(identity).digest('hex').slice(0,12);
 const slug=`${slugify(name)||'office'}-${pincode}-${id}`;
 return {id,pincode,name,officeType,delivery:deliveryRaw==='delivery'?'Delivery':'Non-Delivery',district,districtSlug,state:state.name,stateSlug:state.slug,slug,taluk:get('taluk','talukname','taluka')||null,circle:required('circle','circlename'),region:required('region','regionname'),division:required('division','divisionname'),latitude,longitude};
}
async function* rows() {
 if (values.input!.toLowerCase().endsWith('.json')) {
   const json:unknown=JSON.parse(fs.readFileSync(values.input!,'utf8'));
   const items=Array.isArray(json)?json:(json as {records?:unknown[]})?.records;
   if(!Array.isArray(items)) throw new Error('JSON must be an array or { records: [...] }');
   for(const item of items) yield item;
 } else {
   const parser=fs.createReadStream(values.input!).pipe(parse({columns:true,bom:true,skip_empty_lines:true,trim:true}));
   for await (const item of parser) yield item;
 }
}
try {
 db.exec('BEGIN');
 for await(const raw of rows()) {
   rowNumber++;
   try {
     if(!raw || typeof raw!=='object') throw new Error('Record must be an object');
     const office=normalize(raw as Record<string,unknown>);
     const existing=previous.get(office.id) as Office | undefined;
     if(existing) { if(fields.every(f=>existing[f as keyof Office]===office[f as keyof Office])) duplicates++; else throw new Error('Conflicting duplicate; resolve in input'); }
     else {insert.run(office); records++;}
   } catch(error) { rejected++; if(errors.length<100) errors.push({row:rowNumber,message:error instanceof Error?error.message:'Invalid record'}); }
 }
 if(!records || rejected) throw new Error(`Import rejected: ${rejected} invalid rows; ${records} valid rows. Existing database unchanged. ${JSON.stringify(errors)}`);
 db.exec("INSERT INTO office_search(office_search) VALUES('rebuild')");
 const stateInsert=db.prepare('INSERT INTO states VALUES(@name,@slug,@kind,@offices,@pincodes,@districts)');
 for(const state of STATES) {
 const counts=db.prepare('SELECT COUNT(*) offices, COUNT(DISTINCT pincode) pincodes, COUNT(DISTINCT districtSlug) districts FROM offices WHERE stateSlug=?').get(state.slug) as {offices:number;pincodes:number;districts:number};
 stateInsert.run({...state,...counts}); }
 db.exec('INSERT INTO districts SELECT MIN(district),districtSlug,stateSlug,COUNT(*),COUNT(DISTINCT pincode) FROM offices GROUP BY stateSlug,districtSlug');
 const pincodes=(db.prepare('SELECT COUNT(DISTINCT pincode) n FROM offices').get() as {n:number}).n;
 const metadata:Dataset={kind:values.kind as Dataset['kind'],source:values.source!,sourceUrl:values['source-url']!,asOf:values['as-of']||'',importedAt:new Date().toISOString(),records,pincodes,rejected,duplicates};
 db.prepare('INSERT INTO metadata VALUES(?,?)').run('dataset',JSON.stringify(metadata));
 db.exec(`INSERT INTO urls(path) VALUES ('/');
 INSERT INTO urls(path) SELECT '/'||slug FROM states WHERE offices>0 ORDER BY slug;
 INSERT INTO urls(path) SELECT '/'||stateSlug||'/'||slug FROM districts ORDER BY stateSlug,slug;
 INSERT INTO urls(path) SELECT '/pincode/'||pincode FROM offices GROUP BY pincode ORDER BY pincode;
 INSERT INTO urls(path) SELECT '/'||stateSlug||'/'||districtSlug||'/'||slug FROM offices ORDER BY stateSlug,districtSlug,slug;`);
 db.exec('COMMIT; ANALYZE; VACUUM;');
 db.close();
 fs.renameSync(temporary,output);
 console.log(JSON.stringify({output,...metadata},null,2));
} catch(error) { if(db.open) db.close(); fs.rmSync(temporary,{force:true}); throw error; }
