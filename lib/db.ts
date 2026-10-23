import 'server-only';
import Database from 'better-sqlite3';
import path from 'node:path';
import type { Dataset, Office, State, District, OfficePage } from './types';
let connection: Database.Database | undefined;
export function database() {
 if (!connection) { connection = new Database(path.join(process.cwd(),'data/postal.sqlite'),{readonly:true,fileMustExist:true}); connection.pragma('query_only = ON'); connection.pragma('cache_size = -8192'); }
 return connection;
}
export const getDataset = () => JSON.parse((database().prepare("SELECT value FROM metadata WHERE key='dataset'").get() as {value:string}).value) as Dataset;
export const getStates = () => database().prepare('SELECT * FROM states ORDER BY name').all() as State[];
export const getState = (slug:string) => database().prepare('SELECT * FROM states WHERE slug=?').get(slug) as State|undefined;
export const getDistricts = (state:string) => database().prepare('SELECT * FROM districts WHERE stateSlug=? ORDER BY name').all(state) as District[];
export const getDistrict = (state:string, district:string) => database().prepare('SELECT * FROM districts WHERE stateSlug=? AND slug=?').get(state,district) as District|undefined;
export const getOffice = (state:string,district:string,slug:string) => database().prepare('SELECT * FROM offices WHERE stateSlug=? AND districtSlug=? AND slug=?').get(state,district,slug) as Office|undefined;
export function ftsQuery(query:string) { return query.normalize('NFKC').match(/[\p{L}\p{N}]+/gu)?.slice(0,6).map(t=>`"${t}"*`).join(' AND ') ?? ''; }
export function searchOffices(query:string,limit=8):Office[] {
 const q=query.trim().slice(0,80); if(q.length<3) return [];
 if(/^\d+$/.test(q)) {if(q.length>6)return []; return database().prepare('SELECT * FROM offices WHERE pincode>=? AND pincode<=? ORDER BY pincode,name,id LIMIT ?').all(q.padEnd(6,'0'),q.padEnd(6,'9'),Math.min(limit,50)) as Office[];}
 const match=ftsQuery(q); if(!match)return [];
 return database().prepare('SELECT o.* FROM office_search s JOIN offices o ON o.rowid=s.rowid WHERE office_search MATCH ? ORDER BY rank LIMIT ?').all(match,Math.min(limit,50)) as Office[];
}
export function listOffices({state,district,pincode,q='',page=1}: {state?:string;district?:string;pincode?:string;q?:string;page?:number}):OfficePage {
 const conditions:string[]=[]; const args:string[]=[];
 if(state){conditions.push('o.stateSlug=?');args.push(state);}
 if(district){conditions.push('o.districtSlug=?');args.push(district);}
 if(pincode){conditions.push('o.pincode=?');args.push(pincode);}
 let join='';
 if(q.trim()) { if(/^\d+$/.test(q.trim())) {conditions.push('o.pincode>=? AND o.pincode<=?');args.push(q.trim().padEnd(6,'0'),q.trim().padEnd(6,'9'));} else {const match=ftsQuery(q);if(!match)return {rows:[],total:0,page:1,pages:1};join=' JOIN office_search s ON s.rowid=o.rowid';conditions.push('office_search MATCH ?');args.push(match);} }
 const where=conditions.length?' WHERE '+conditions.join(' AND '):'';
 const total=(database().prepare(`SELECT COUNT(*) n FROM offices o${join}${where}`).get(...args) as {n:number}).n;
 const pages=Math.max(1,Math.ceil(total/50)); const current=Math.max(1,Math.min(Number.isFinite(page)?Math.floor(page):1,pages));
 const rows=database().prepare(`SELECT o.* FROM offices o${join}${where} ORDER BY o.name,o.id LIMIT 50 OFFSET ?`).all(...args,(current-1)*50) as Office[];
 return {rows,total,page:current,pages};
}
export const relatedOffices = (o:Office) => database().prepare('SELECT * FROM offices WHERE stateSlug=? AND districtSlug=? AND id<>? ORDER BY (pincode=?) DESC,name LIMIT 8').all(o.stateSlug,o.districtSlug,o.id,o.pincode) as Office[];
export const urlCount = () => (database().prepare('SELECT COUNT(*) n FROM urls').get() as {n:number}).n;
export const urlChunk = (chunk:number,size:number) => database().prepare('SELECT path FROM urls WHERE seq>? AND seq<=? ORDER BY seq').all((chunk-1)*size,chunk*size) as {path:string}[];
