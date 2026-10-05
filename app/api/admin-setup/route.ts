import {NextRequest,NextResponse} from 'next/server';
import {getServerSession} from 'next-auth';
import {authOptions} from '@/lib/auth';
import {ensurePermanentAdminExists,getPermanentAdminConfig} from '@/lib/permanent-admin';
import {getWebsiteFirestore} from '@/lib/firebase-admin';
import {WebsiteAdminError,createWebsiteAdmin,changeWebsiteAdmin,listWebsiteAdmins,websiteAdminActivities,websiteSecurityDashboard,WEBSITE_ADMIN_ROLES} from '@/lib/website-admin-repository';
const errorResponse=(error:unknown)=>NextResponse.json({error:error instanceof WebsiteAdminError?error.message:'Admin service temporarily unavailable'},{status:error instanceof WebsiteAdminError?error.status:503});
export async function GET(){try{await ensurePermanentAdminExists();const rows=await getWebsiteFirestore().collection('websiteAdmins').limit(1).get();return NextResponse.json({adminExists:!rows.empty,hasPermanentAdmin:!!getPermanentAdminConfig()});}catch{return NextResponse.json({adminExists:true,warning:'Admin service temporarily unavailable'},{status:503});}}
export async function POST(request:NextRequest){try{await ensurePermanentAdminExists();await createWebsiteAdmin(null,await request.json(),true,true);return NextResponse.json({message:'Admin created successfully. Please login.'},{status:201});}catch(e){return errorResponse(e);}}
