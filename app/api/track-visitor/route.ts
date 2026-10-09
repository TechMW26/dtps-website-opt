import {NextRequest,NextResponse} from 'next/server';
import {getWebsiteDatabase} from '@/lib/website-database';
import {recordWebsiteVisit} from '@/lib/website-telemetry';
import {geoLookup,parseUserAgent} from '@/lib/geoip';
export async function POST(req:NextRequest){try{
 const body=await req.json();if(typeof body?.sessionId!=='string'||!body.sessionId||body.sessionId.length>200||typeof body.path!=='string'||!body.path)return NextResponse.json({ok:true});
 const clean=(value:unknown,max:number)=>typeof value==='string'?value.slice(0,max):'';
 const input={sessionId:body.sessionId,event:body.event,path:clean(body.path,500),title:clean(body.title,200),referrer:clean(body.referrer,500),durationMs:body.durationMs};
 const db=getWebsiteDatabase(),existing=await db.collection('websiteVisitors').where('sessionId','==',input.sessionId).limit(1).get();let seed={};
 if(existing.empty){const ip=clean(req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()||req.headers.get('x-real-ip')||'unknown',100),userAgent=clean(req.headers.get('user-agent'),1000);const geo=await geoLookup(ip),ua=parseUserAgent(userAgent);seed=Object.fromEntries(Object.entries({...geo,...ua,ip,userAgent,language:clean(body.language,100),referrer:input.referrer}).filter(([,value])=>value!==undefined));}
 await recordWebsiteVisit(db,input,seed);return NextResponse.json({ok:true});
 }catch{return NextResponse.json({ok:true});}}
