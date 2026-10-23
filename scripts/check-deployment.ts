import nextEnv from '@next/env';
import fs from 'node:fs';
import Database from 'better-sqlite3';
nextEnv.loadEnvConfig(process.cwd());
const p='data/postal.sqlite';
if(!fs.existsSync(p)) throw new Error('Missing postal database. Run npm run data:sample or data:import first.');
const db=new Database(p,{readonly:true});
const info=JSON.parse((db.prepare("SELECT value FROM metadata WHERE key='dataset'").get() as {value:string}).value);
if(process.env.ENABLE_INDEXING==='true') {
 if(info.kind!=='production') throw new Error('Indexing sample data is blocked. Import a reviewed production dataset.');
 const url=new URL(process.env.NEXT_PUBLIC_SITE_URL||'http://localhost:3000');
 if(url.protocol!=='https:' || ['localhost','example.com'].includes(url.hostname)||url.pathname!=='/'||url.search||url.hash) throw new Error('Set NEXT_PUBLIC_SITE_URL to your production HTTPS origin.');
}
console.log(`Dataset: ${info.kind}; ${info.records} offices. Indexing: ${process.env.ENABLE_INDEXING==='true'?'enabled':'disabled'}.`);
db.close();
