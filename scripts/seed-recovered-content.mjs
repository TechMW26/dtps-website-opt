// Default is offline validation. --execute requires an explicit matching Firebase destination.
import fs from 'node:fs';
import {cert,initializeApp,deleteApp} from 'firebase-admin/app';
import {getFirestore,FieldValue} from 'firebase-admin/firestore';
const seed=JSON.parse(fs.readFileSync(new URL('../data/recovery/content-seed.json',import.meta.url),'utf8'));
const collections=new Set(['websiteTransformations','websiteSuccessStories','websiteBlogs']),identities=new Set();
for(const row of seed.records){
 if(!collections.has(row.collection)||!/^recovered-(composite|blog)-[a-f0-9]{24}$/.test(row.id)||identities.has(row.collection+'/'+row.id))throw new Error('Invalid or duplicate recovery identity');
 identities.add(row.collection+'/'+row.id);
 if(!row.data.provenance||!row.data.provenance.inventorySha256)throw new Error('Missing provenance');
 if(row.collection==='websiteBlogs'&&(row.data.published!==false||row.data.content!==''||row.data.author!==''))throw new Error('Incomplete recovered blogs must remain drafts without invented content');
 if(row.collection!=='websiteBlogs'&&(row.data.beforeImage!==''||row.data.weightLost!==''||row.data.daysToAchieve!==''||row.data.testimonial!==''||row.data.clientName!=='Transformation'))throw new Error('Composite records must not invent client metadata');
}
const counts=Object.fromEntries([...collections].map(collection=>[collection,seed.records.filter(row=>row.collection===collection).length]));
if(!process.argv.includes('--execute')){console.log(JSON.stringify({mode:'dry-run',counts,writes:0}));process.exit(0);}
if(process.env.VERCEL||process.env.NODE_ENV==='production')throw new Error('Run recovery from an explicitly configured local operator environment');
const option=name=>{const index=process.argv.indexOf(name);return index>=0?process.argv[index+1]:undefined;};
const projectId=process.env.FIREBASE_PROJECT_ID||process.env.FIRESTORE_NATIVE_PROJECT_ID,databaseId=process.env.FIREBASE_DATABASE_ID||process.env.FIRESTORE_NATIVE_DATABASE_ID||'(default)';
if(!projectId||option('--project')!==projectId||option('--database')!==databaseId)throw new Error('Explicit --project and --database must match configured destination');
const emulator=process.env.FIRESTORE_EMULATOR_HOST;
if(emulator&&(!/^(localhost|127\.0\.0\.1):\d+$/.test(emulator)||!projectId.startsWith('demo-')))throw new Error('Emulator must use localhost and demo project');
const clientEmail=process.env.FIREBASE_CLIENT_EMAIL||process.env.FIRESTORE_NATIVE_CLIENT_EMAIL,privateKey=(process.env.FIREBASE_PRIVATE_KEY||process.env.FIRESTORE_NATIVE_PRIVATE_KEY||'').replace(/\\n/g,'\n');
if(!emulator&&(!clientEmail||!privateKey))throw new Error('Firebase credentials required');
const app=initializeApp({projectId,...(!emulator?{credential:cert({projectId,clientEmail,privateKey})}:{})},'website-content-recovery');
const db=getFirestore(app,databaseId);let created=0,existing=0;
try{
 for(const row of seed.records){const result=await db.runTransaction(async tx=>{
  const ref=db.collection(row.collection).doc(row.id);if((await tx.get(ref)).exists)return false;
  const provenance=row.data.provenance,urls=(row.collection==='websiteBlogs'?provenance.mediaVariants:provenance.aliases).map(item=>item.url),field=row.collection==='websiteBlogs'?'featuredImage':'afterImage';
  for(let i=0;i<urls.length;i+=30)if(!(await tx.get(db.collection(row.collection).where(field,'in',urls.slice(i,i+30)).limit(1))).empty)return false;
  if(row.collection==='websiteBlogs'&&!(await tx.get(db.collection(row.collection).where('slug','==',provenance.sourceSlugHint).limit(1))).empty)return false;
  tx.create(ref,{...row.data,recoveryVersion:seed.version,createdAt:FieldValue.serverTimestamp(),updatedAt:FieldValue.serverTimestamp()});return true;
 });if(result)created++;else existing++;}
 console.log(JSON.stringify({mode:'execute',created,existing,overwritten:0,counts}));
}finally{await db.terminate();await deleteApp(app);}
