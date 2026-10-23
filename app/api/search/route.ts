import { NextRequest,NextResponse } from 'next/server';
import { searchOffices } from '@/lib/db';
export const runtime='nodejs';
export function GET(request:NextRequest){const q=request.nextUrl.searchParams.get('q')?.trim()||'';if(q.length>80)return NextResponse.json({error:'Query is too long',results:[]},{status:400});if(q.length<3)return NextResponse.json({results:[]});try{return NextResponse.json({results:searchOffices(q)},{headers:{'Cache-Control':'public, s-maxage=3600, stale-while-revalidate=86400','X-Robots-Tag':'noindex'}});}catch(error){console.error('Postal search failed',error instanceof Error?error.message:'Unknown error');return NextResponse.json({error:'Search temporarily unavailable',results:[]},{status:503,headers:{'Cache-Control':'no-store'}});}}
