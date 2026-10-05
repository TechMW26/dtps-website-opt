import {createHash} from 'node:crypto';
import type {Firestore,DocumentData,Query} from 'firebase-admin/firestore';
export function telemetryMillis(value:any):number {return typeof value?.toMillis==='function'?value.toMillis():new Date(value||0).getTime();}
export async function telemetryRows(query:Query):Promise<DocumentData[]> {const result:DocumentData[]=[];let cursor;for(;;){const page=await (cursor?query.startAfter(cursor):query).limit(500).get();result.push(...page.docs.map(row=>({...row.data(),_id:row.id})));if(page.size<500)return result;cursor=page.docs.at(-1);}}
export async function recordWebsiteVisit(db:Firestore,input:DocumentData,seed:DocumentData,now=new Date()) {
 const collection=db.collection('websiteVisitors'),canonical=collection.doc(createHash('sha256').update(input.sessionId).digest('hex'));
 await db.runTransaction(async tx=>{
  // Query retains imported IDs; the canonical read prevents two first requests from creating duplicate sessions.
  const [found,current]=await Promise.all([tx.get(collection.where('sessionId','==',input.sessionId).limit(1)),tx.get(canonical)]);
  const previous=found.docs[0]||(current.exists?current:undefined),ref=previous?.ref||canonical;
  if(!previous){tx.create(ref,{...seed,sessionId:input.sessionId,landingPath:input.path,pageViews:[{path:input.path,title:input.title,referrer:input.referrer,enteredAt:now}],sessionStart:now,lastSeen:now,totalDurationMs:0});return;}
  const data=previous.data()!,views=(data.pageViews||[]).map((row:DocumentData)=>({...row}));let total=Number(data.totalDurationMs)||0;
  const duration=Number.isFinite(input.durationMs)&&input.durationMs>0?Math.min(input.durationMs,30*60*1000):0;
  if(duration&&views.length){views[views.length-1].durationMs=(Number(views[views.length-1].durationMs)||0)+duration;total+=duration;}
  if(input.event==='pageview'&&views.at(-1)?.path!==input.path)views.push({path:input.path,title:input.title,referrer:input.referrer,enteredAt:now});
  tx.update(ref,{lastSeen:new Date(Math.max(telemetryMillis(data.lastSeen),now.getTime())),pageViews:views,totalDurationMs:total});
 });
}
export function summarizeWebsiteTraffic(rows:DocumentData[],live:DocumentData[],country?:string){
 const selected=country?rows.filter(row=>row.country===country):rows;
 const countries=new Map<string,any>(),cities=new Map<string,any>(),devices=new Map<string,any>(),pages=new Map<string,any>(),locations=new Map<string,any>();
 const add=(map:Map<string,any>,key:string,value:any)=>{const item=map.get(key);if(item)item.count++;else map.set(key,{...value,count:1});};
 let pageViews=0,duration=0;for(const row of selected){pageViews+=(row.pageViews||[]).length;duration+=Number(row.totalDurationMs)||0;
  if(row.country!=null)add(countries,JSON.stringify([row.country,row.countryCode]),{country:row.country,code:row.countryCode});
  const lat = row.lat == null || row.lat === '' ? NaN : Number(row.lat);
  const lng = row.lng == null || row.lng === '' ? NaN : Number(row.lng);
  const hasCoordinates = Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
  if(row.city!=null)add(cities,JSON.stringify([row.city,row.country]),{city:row.city,country:row.country,lat:hasCoordinates?lat:undefined,lng:hasCoordinates?lng:undefined});
  add(devices,row.device||'unknown',{device:row.device||'unknown'});
  for(const view of row.pageViews||[]){const item=pages.get(view.path);if(item)item.views++;else pages.set(view.path,{path:view.path,views:1});}
  if(hasCoordinates)add(locations,JSON.stringify([lat,lng,row.city,row.country]),{lat,lng,city:row.city,country:row.country});
 }
 const top=(map:Map<string,any>,limit:number)=>[...map.values()].sort((a,b)=>b.count-a.count).slice(0,limit);
 return {liveVisitors:live.length,stats:{sessions:selected.length,pageViews,avgSessionMs:Math.round(duration/(selected.length||1))},byCountry:top(countries,50),byCity:top(cities,100),byDevice:top(devices,100),byPage:[...pages.values()].sort((a,b)=>b.views-a.views).slice(0,10),locations:top(locations,500),liveList:live.sort((a,b)=>telemetryMillis(b.lastSeen)-telemetryMillis(a.lastSeen)).slice(0,50).map(v=>({sessionId:v.sessionId,ip:v.ip,country:v.country,city:v.city,device:v.device,browser:v.browser,os:v.os,currentPath:v.pageViews?.at(-1)?.path||v.landingPath,lastSeen:v.lastSeen,sessionStart:v.sessionStart,totalDurationMs:v.totalDurationMs,pageViewsCount:v.pageViews?.length||0}))};
}
