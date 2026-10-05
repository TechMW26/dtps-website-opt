import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import {getWebsiteFirestore,serializeFirestoreValue,serializeFirestoreDocument} from '@/lib/firebase-admin';
import {telemetryRows,telemetryMillis} from '@/lib/website-telemetry';
import type {DocumentData} from 'firebase-admin/firestore';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const STATUSES = new Set(['new', 'contacted', 'converted', 'closed']);
const RANGES: Record<string, number> = {
  '24h': 24 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000,
  '30d': 30 * 24 * 60 * 60 * 1000,
  '90d': 90 * 24 * 60 * 60 * 1000,
};

function clean(value: unknown, max: number) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

async function requireAdmin() {
  return Boolean((await getServerSession(authOptions))?.user);
}

export async function GET(request: NextRequest) {
  try {
    if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const db=getWebsiteFirestore();

    const { searchParams } = new URL(request.url);
    const page = Math.min(1000000, Math.max(1, Math.floor(Number(searchParams.get('page')) || 1)));
    const exporting = searchParams.get('export') === '1';
    const limit = exporting ? 5000 : Math.min(100, Math.max(10, Math.floor(Number(searchParams.get('limit')) || 25)));
    const search = clean(searchParams.get('search'), 120);
    const status = clean(searchParams.get('status'), 30);
    const device = clean(searchParams.get('device'), 30);
    const range = clean(searchParams.get('range'), 10);

    const all=await telemetryRows(db.collection('websiteLeads').where('source','==','popup'));
    const since=range&&RANGES[range]?Date.now()-RANGES[range]:0;
    const searchFields=['phoneNumber','e164','popupTitle','popupId','page','pageUrl','sessionId','ip','utmCampaign','utmSource'];
    const matched=all.filter(lead=>(!STATUSES.has(status)||(lead.leadStatus||'new')===status)&&(!device||lead.device===device)&&(!since||telemetryMillis(lead.createdAt)>=since)&&(!search||searchFields.some(key=>String(lead[key]||'').toLowerCase().includes(search.toLowerCase())))).sort((a,b)=>telemetryMillis(b.createdAt)-telemetryMillis(a.createdAt)||String(b._id).localeCompare(String(a._id)));
    const total=matched.length,totalAll=all.length,now=new Date(),today=new Date(now.getFullYear(),now.getMonth(),now.getDate()).getTime();
    const todayCount=all.filter(row=>telemetryMillis(row.createdAt)>=today).length,weekCount=all.filter(row=>telemetryMillis(row.createdAt)>=Date.now()-7*86400e3).length,convertedCount=all.filter(row=>row.leadStatus==='converted').length;
    const rawLeads=matched.slice(exporting?0:(page-1)*limit,(exporting?0:(page-1)*limit)+limit);
    const sessionIds=[...new Set(rawLeads.map(lead=>lead.sessionId).filter(value=>typeof value==='string'&&value))];
    const popupIds=[...new Set(rawLeads.map(lead=>lead.popupId).filter((id):id is string=>typeof id==='string'&&!!id&&!id.includes('/')))];
    const visitors:DocumentData[]=[],popups:DocumentData[]=[];
    await Promise.all([ (async()=>{for(let i=0;i<sessionIds.length;i+=30)visitors.push(...await telemetryRows(db.collection('websiteVisitors').where('sessionId','in',sessionIds.slice(i,i+30))));})(),(async()=>{for(let i=0;i<popupIds.length;i+=100){const docs=await db.getAll(...popupIds.slice(i,i+100).map(id=>db.collection('websitePopups').doc(id)));popups.push(...docs.filter(doc=>doc.exists).map(doc=>({...doc.data(),_id:doc.id})));}})() ]);
    const visitorBySession=new Map(visitors.map(row=>[row.sessionId,row]));
    const popupById=new Map(popups.map(row=>[row._id,row.title]));

    const leads = rawLeads.map((lead) => {
      const visitor = lead.sessionId ? visitorBySession.get(lead.sessionId) : undefined;
      return {
        ...lead,
        _id: String(lead._id),
        leadStatus: lead.leadStatus || 'new',
        popupTitle: lead.popupTitle || (lead.popupId ? popupById.get(lead.popupId) : '') || 'Popup offer',
        device: lead.device || visitor?.device || 'unknown',
        browser: lead.browser || visitor?.browser || 'unknown',
        os: lead.os || visitor?.os || 'unknown',
        ip: lead.ip || visitor?.ip || '',
        language: lead.language || visitor?.language || '',
        referrer: lead.referrer || visitor?.referrer || '',
        location: {
          country: visitor?.country || '',
          countryCode: visitor?.countryCode || '',
          region: visitor?.region || '',
          city: visitor?.city || '',
          lat: visitor?.lat,
          lng: visitor?.lng,
          isp: visitor?.isp || '',
        },
        session: visitor ? {
          startedAt: visitor.sessionStart,
          lastSeen: visitor.lastSeen,
          landingPath: visitor.landingPath,
          totalDurationMs: visitor.totalDurationMs,
          pageViews: visitor.pageViews,
        } : null,
      };
    });

    return NextResponse.json(serializeFirestoreValue({
      success: true,
      leads,
      pagination: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) },
      stats: { total: totalAll, today: todayCount, last7Days: weekCount, converted: convertedCount },
    }));
  } catch (error) {
    console.error('Popup leads fetch error:', error);
    return NextResponse.json({ error: 'Failed to load popup leads' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await request.json();
    const id = clean(body.id, 100);
    const status = clean(body.status, 30);
    const adminNote = clean(body.adminNote, 2000);
    if ((!id||id.includes('/')||id==='.'||id==='..')) return NextResponse.json({ error: 'Invalid lead ID' }, { status: 400 });
    if (!STATUSES.has(status)) return NextResponse.json({ error: 'Invalid lead status' }, { status: 400 });

    const db=getWebsiteFirestore();
    const ref=db.collection('websiteLeads').doc(id);
    const lead=await db.runTransaction(async tx=>{const current=await tx.get(ref);if(!current.exists||current.get('source')!=='popup')return null;const patch={leadStatus:status,adminNote,updatedAt:new Date()};tx.update(ref,patch);return serializeFirestoreDocument(ref.id,{...current.data(),...patch});});
    if (!lead) return NextResponse.json({ error: 'Popup lead not found' }, { status: 404 });
    return NextResponse.json({ success: true, lead });
  } catch (error) {
    console.error('Popup lead update error:', error);
    return NextResponse.json({ error: 'Failed to update popup lead' }, { status: 500 });
  }
}
