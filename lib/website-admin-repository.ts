import bcrypt from 'bcryptjs';
import {FieldValue} from '@/lib/mongo-website-types.mjs';
import type {WebsiteTransaction as Transaction, WebsiteQueryDocumentSnapshot} from './website-database-types';
import {getWebsiteDatabase} from './website-database';
import {getPermanentAdminConfig} from './permanent-admin';
import {sanitizeText} from './security';
export const WEBSITE_ADMIN_ROLES=['superadmin','admin','manager','editor','support','viewer'] as const;
export class WebsiteAdminError extends Error{constructor(message:string,public status=400){super(message);}}
type SessionActor={user?:{id?:string;email?:string|null;role?:string}}|null;
const db=()=>getWebsiteDatabase();
const iso=(v:any)=>v?.toDate instanceof Function?v.toDate().toISOString():v instanceof Date?v.toISOString():v;
export function publicWebsiteAdmin(id:string,data:Record<string,any>){return {_id:id,id,...Object.fromEntries(['email','name','role','isPermanent','createdAt','updatedAt'].filter(k=>data[k]!==undefined).map(k=>[k,iso(data[k])]))};}
function publicEvent(row:WebsiteQueryDocumentSnapshot){const data=row.data();return {_id:row.id,...Object.fromEntries(['type','severity','message','email','ip','userAgent','path','createdAt'].filter(k=>data[k]!==undefined).map(k=>[k,iso(data[k])])),...(data.meta?{meta:Object.fromEntries(['actorEmail','targetUserEmail','action'].filter(k=>typeof data.meta[k]==='string').map(k=>[k,data.meta[k]]))}:{})};}
export async function requireWebsiteAdmin(session:SessionActor,tx?:Transaction,superOnly=false){
 const email=session?.user?.email?.toLowerCase().trim();if(!email)throw new WebsiteAdminError('Unauthorized',401);
 const query=db().collection('websiteAdmins').where('email','==',email).limit(2);const rows=tx?await tx.get(query):await query.get();
 if(rows.size!==1)throw new WebsiteAdminError('Unauthorized',401);const data=rows.docs[0].data();
 if(data.isDeleted||data.status==='inactive'||data.status==='suspended'||!WEBSITE_ADMIN_ROLES.includes(data.role))throw new WebsiteAdminError('Unauthorized',401);
 if(superOnly&&data.role!=='superadmin')throw new WebsiteAdminError('Forbidden',403);return {id:rows.docs[0].id,email,role:data.role};
}
export function validateWebsiteAdmin(body:any,create=true){
 const email=sanitizeText(String(body?.email||'').toLowerCase(),120),name=sanitizeText(String(body?.name||''),80),role=sanitizeText(String(body?.role||(create?'admin':'')),20),password=String(body?.password||'');
 if(create&&(!name||!email||!password))throw new WebsiteAdminError('Name, email and password are required');
 if(create&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw new WebsiteAdminError('Invalid email');
 if(role&&!WEBSITE_ADMIN_ROLES.includes(role as any))throw new WebsiteAdminError('Invalid role');
 if(password&&(password.length<8||Buffer.byteLength(password,'utf8')>72))throw new WebsiteAdminError('Password must be at least 8 characters and at most 72 bytes');return {email,name,role,password};
}
export async function createWebsiteAdmin(session:SessionActor,body:any,allowBootstrap=false,onlyBootstrap=false){
 if(!allowBootstrap)await requireWebsiteAdmin(session,undefined,true);
 const input=validateWebsiteAdmin(body),passwordHash=await bcrypt.hash(input.password,12),store=db(),ref=store.collection('websiteAdmins').doc(),guard=store.collection('_websiteAdminState').doc('bootstrap'),audit=store.collection('websiteSecurityLogs').doc();
 return store.runTransaction(async tx=>{
  await tx.get(guard);const any=await tx.get(store.collection('websiteAdmins').limit(1));
  if(onlyBootstrap&&!any.empty)throw new WebsiteAdminError('Admin already exists. Please login instead.');
  const bootstrap=allowBootstrap&&any.empty;const actor=bootstrap?null:await requireWebsiteAdmin(session,tx,true);
  const duplicate=await tx.get(store.collection('websiteAdmins').where('email','==',input.email).limit(1));if(!duplicate.empty)throw new WebsiteAdminError('Email already exists');
  const now=new Date(),data={email:input.email,name:input.name,role:bootstrap?'superadmin':input.role,passwordHash,isPermanent:false,createdAt:now,updatedAt:now};
  tx.set(ref,data);tx.set(guard,{updatedAt:now},{merge:true});tx.set(audit,{type:'admin_action',severity:'info',message:'Admin user created',email:actor?.email||input.email,meta:{actorEmail:actor?.email||input.email,targetUserEmail:input.email,action:'create_user'},createdAt:now});return publicWebsiteAdmin(ref.id,data);
 });
}
export async function changeWebsiteAdmin(session:SessionActor,id:string,body:any,remove=false){
 await requireWebsiteAdmin(session,undefined,true);
 if(!id||id.includes('/')||id.length>128)throw new WebsiteAdminError('Invalid userId');const input=remove?null:validateWebsiteAdmin(body,false),hash=input?.password?await bcrypt.hash(input.password,12):null;const store=db();
 return store.runTransaction(async tx=>{const actor=await requireWebsiteAdmin(session,tx,true),ref=store.collection('websiteAdmins').doc(id),row=await tx.get(ref);if(!row.exists)throw new WebsiteAdminError('User not found',404);const data=row.data()!;
 if(data.isPermanent||data.email===getPermanentAdminConfig()?.email)throw new WebsiteAdminError('Permanent admin cannot be modified or deleted');if(remove&&actor.id===id)throw new WebsiteAdminError('You cannot delete your own account');
 if(data.role==='superadmin'&&(remove||(input?.role&&input.role!=='superadmin'))){const peers=await tx.get(store.collection('websiteAdmins').where('role','==','superadmin'));if(!peers.docs.some(d=>d.id!==id&&!d.get('isDeleted')&&!['inactive','suspended'].includes(d.get('status'))))throw new WebsiteAdminError('At least one superadmin is required');}
 const patch={...(input?.name?{name:input.name}:{}),...(input?.role?{role:input.role}:{}),...(hash?{passwordHash:hash,password:FieldValue.delete()}:{}),updatedAt:new Date()};if(remove)tx.delete(ref);else tx.update(ref,patch);
 tx.set(store.collection('websiteSecurityLogs').doc(),{type:'admin_action',severity:remove?'warning':'info',message:remove?'Admin user deleted':'Admin user updated',email:actor.email,meta:{actorEmail:actor.email,targetUserEmail:data.email,action:remove?'delete_user':'update_user'},createdAt:new Date()});return remove?null:publicWebsiteAdmin(id,{...data,...patch});});
}
export async function listWebsiteAdmins(session:SessionActor){await requireWebsiteAdmin(session);const rows=await db().collection('websiteAdmins').orderBy('createdAt','desc').get();return rows.docs.map(d=>publicWebsiteAdmin(d.id,d.data()));}
export async function websiteAdminActivities(emails:string[]){
 const found=new Map<string,WebsiteQueryDocumentSnapshot>();for(let start=0;start<emails.length;start+=7){const part=emails.slice(start,start+7);await Promise.all(['email','meta.targetUserEmail'].map(async field=>{const rows=await db().collection('websiteSecurityLogs').where(field,'in',part).where('type','in',['login_success','logout','admin_action','password_change']).orderBy('createdAt','desc').limit(500).get();for(const row of rows.docs)if(['login_success','logout','admin_action','password_change'].includes(row.get('type')))found.set(row.id,row);}));}
 return [...found.values()].sort((a,b)=>Number(b.get('createdAt')?.toMillis?.()||new Date(b.get('createdAt')).getTime())-Number(a.get('createdAt')?.toMillis?.()||new Date(a.get('createdAt')).getTime())).slice(0,500).map(publicEvent);
}
export async function websiteSecurityDashboard(session:SessionActor){await requireWebsiteAdmin(session);const logs=db().collection('websiteSecurityLogs'),day=new Date(Date.now()-86400000),week=new Date(Date.now()-7*86400000);const [events,total,failed24,failed7,critical,recent,last]=await Promise.all([logs.orderBy('createdAt','desc').limit(100).get(),logs.count().get(),logs.where('type','==','login_failed').where('createdAt','>=',day).count().get(),logs.where('type','==','login_failed').where('createdAt','>=',week).count().get(),logs.where('severity','==','critical').where('createdAt','>=',week).count().get(),logs.where('createdAt','>=',week).select('type').get(),logs.where('type','==','login_success').orderBy('createdAt','desc').limit(5).get()]);const types=new Map<string,number>();for(const row of recent.docs)types.set(row.get('type'),(types.get(row.get('type'))||0)+1);return {events:events.docs.map(publicEvent),stats:{totals:total.data().count,failed24h:failed24.data().count,failed7d:failed7.data().count,criticalOpen:critical.data().count,byType:[...types].map(([_id,count])=>({_id,count})).sort((a,b)=>b.count-a.count),lastLogins:last.docs.map(publicEvent)}};}
