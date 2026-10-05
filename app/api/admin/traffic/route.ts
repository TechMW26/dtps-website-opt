import {NextRequest,NextResponse} from 'next/server';
import {getServerSession} from 'next-auth';
import {authOptions} from '@/lib/auth';
import {getWebsiteFirestore,serializeFirestoreValue} from '@/lib/firebase-admin';
import {telemetryRows,summarizeWebsiteTraffic} from '@/lib/website-telemetry';
export async function GET(req:NextRequest){
 if(!(await getServerSession(authOptions))?.user)return NextResponse.json({error:'Unauthorized'},{status:401});
 const url=new URL(req.url),range=url.searchParams.get('range')||'24h',country=url.searchParams.get('country')||undefined;
 const ms=(range==='30d'?30:range==='7d'?7:1)*24*3600e3,db=getWebsiteFirestore(),collection=db.collection('websiteVisitors');
 const [rows,live]=await Promise.all([telemetryRows(collection.where('sessionStart','>=',new Date(Date.now()-ms))),telemetryRows(collection.where('lastSeen','>=',new Date(Date.now()-120000)))]);
 return NextResponse.json(serializeFirestoreValue({range,...summarizeWebsiteTraffic(rows,live,country)}));
}
