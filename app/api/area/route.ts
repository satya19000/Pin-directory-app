import {NextRequest,NextResponse} from 'next/server';
import {database} from '@/lib/db';
import type {Office} from '@/lib/types';
import {getLocalGuide} from '@/lib/areas/catalog';
import {loadWikipediaGuide} from '@/lib/areas/provider';
export const runtime='nodejs';
export const maxDuration=20;
export async function GET(request:NextRequest){
 const id=request.nextUrl.searchParams.get('office')||'';
 if(!/^[a-f0-9]{12}$/.test(id))return NextResponse.json({error:'Valid office ID required'},{status:400});
 const office=database().prepare('SELECT * FROM offices WHERE id=?').get(id) as Office|undefined;
 if(!office)return NextResponse.json({error:'Office not found'},{status:404});
 const guide=getLocalGuide(office)??(process.env.AREA_DISCOVERY==='off'?null:await loadWikipediaGuide(office));
 return NextResponse.json({guide},{headers:{'Cache-Control':guide?'public, s-maxage=86400, stale-while-revalidate=604800':'public, s-maxage=300','X-Robots-Tag':'noindex'}});
}
