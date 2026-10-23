import nextEnv from '@next/env';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
nextEnv.loadEnvConfig(process.cwd());
const url=process.env.POSTAL_DATA_URL;
if(url) {
 if(!url.startsWith('https://'))throw new Error('POSTAL_DATA_URL must use HTTPS');
 const expected=process.env.POSTAL_DATA_SHA256;
 if(!expected||!/^[a-f0-9]{64}$/i.test(expected))throw new Error('Set POSTAL_DATA_SHA256 to the SHA-256 of the exact CSV or JSON snapshot');
 const format=process.env.POSTAL_DATA_FORMAT||'csv';if(!['csv','json'].includes(format))throw new Error('POSTAL_DATA_FORMAT must be csv or json');
 const response=await fetch(url,{signal:AbortSignal.timeout(120000)});if(!response.ok)throw new Error(`Dataset download failed: HTTP ${response.status}`);
 const bytes=Buffer.from(await response.arrayBuffer());
 if(createHash('sha256').update(bytes).digest('hex')!==expected.toLowerCase())throw new Error('Dataset checksum mismatch');
 fs.mkdirSync('data',{recursive:true});const input=`data/input.${format}`;fs.writeFileSync(input,bytes);
 try { const run=spawnSync(process.execPath,['--import','tsx','scripts/import-data.ts','--input',input,'--kind','production','--source',process.env.POSTAL_SOURCE_NAME||'','--source-url',process.env.POSTAL_SOURCE_URL||'','--as-of',process.env.POSTAL_SOURCE_DATE||''],{stdio:'inherit'});if(run.status!==0)throw new Error('Dataset import failed'); }
 finally {fs.rmSync(input,{force:true});}
}

// Recreate the small demo DB on a fresh clone; production imports never fall back silently.
if(!fs.existsSync('data/postal.sqlite')) {
 const sample=spawnSync(process.execPath,['--import','tsx','scripts/import-data.ts','--input','data/sample.json'],{stdio:'inherit'});
 if(sample.status!==0)throw new Error('Sample database initialization failed');
}
