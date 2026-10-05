import {readFile,readdir,writeFile} from 'node:fs/promises';
import {cert,initializeApp} from 'firebase-admin/app';
import {getFirestore} from 'firebase-admin/firestore';
const state=JSON.parse(await readFile('.recovery/transactions/state.json'));
if(!state.complete||!state.paymentsComplete)throw new Error('Source scan incomplete');
const projectId=process.env.FIREBASE_PROJECT_ID||process.env.FIRESTORE_NATIVE_PROJECT_ID;
const databaseId=process.env.FIREBASE_DATABASE_ID||process.env.FIRESTORE_NATIVE_DATABASE_ID;
if(!projectId||!databaseId)throw new Error('Explicit Firebase destination required');
const app=initializeApp({projectId,credential:cert({projectId,clientEmail:process.env.FIREBASE_CLIENT_EMAIL||process.env.FIRESTORE_NATIVE_CLIENT_EMAIL,privateKey:(process.env.FIREBASE_PRIVATE_KEY||process.env.FIRESTORE_NATIVE_PRIVATE_KEY||'').replace(/\\n/g,'\n')})});
const db=getFirestore(app,databaseId),expected=[];let orders=0,payments=0,capturedPaise=0;
for(const file of (await readdir('.recovery/transactions')).filter(x=>/^order_.*\.json$/.test(x))){
 const {order,payments:items}=JSON.parse(await readFile('.recovery/transactions/'+file));
 expected.push({ref:db.collection('websiteOrders').doc('recovered-'+order.id),values:{orderId:order.receipt||order.id,razorpayOrderId:order.id,amountPaise:order.amount,paymentStatus:order.status==='paid'?'completed':'pending'}});orders++;
 for(const payment of items||[]){
  if(payment.order_id!==order.id)throw new Error('Source payment binding mismatch');
  expected.push({ref:db.collection('websitePayments').doc(payment.id),values:{orderId:order.receipt||order.id,razorpayOrderId:order.id,razorpayPaymentId:payment.id,amountPaise:payment.amount,status:payment.status==='captured'?'completed':payment.status==='failed'?'failed':'pending'}});payments++;
  if(payment.status==='captured')capturedPaise+=Number(payment.amount);
 }
}
let verified=0;
for(let start=0;start<expected.length;start+=300){
 const batch=expected.slice(start,start+300),snapshots=await db.getAll(...batch.map(item=>item.ref));
 for(let i=0;i<batch.length;i++){
  const {values}=batch[i],data=snapshots[i].data();
  if(!data||Object.entries(values).some(([k,v])=>data[k]!==v))throw new Error(`Recovery mismatch at ${batch[i].ref.path}`);
  verified++;
 }
}
const report={verifiedAt:new Date().toISOString(),projectId,databaseId,orders,payments,verified,capturedPaise,sourceCutoff:state.to,missing:0,mismatched:0};
await writeFile('.recovery/firebase-verification.json',JSON.stringify(report,null,2),{mode:0o600});
console.log(JSON.stringify(report));await db.terminate();
