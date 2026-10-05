import {NextRequest,NextResponse} from 'next/server';
import {getServerSession} from 'next-auth';
import {authOptions} from '@/lib/auth';
import {ensurePermanentAdminExists,getPermanentAdminConfig} from '@/lib/permanent-admin';
import {getWebsiteFirestore} from '@/lib/firebase-admin';
import {WebsiteAdminError,createWebsiteAdmin,changeWebsiteAdmin,listWebsiteAdmins,websiteAdminActivities,websiteSecurityDashboard,WEBSITE_ADMIN_ROLES} from '@/lib/website-admin-repository';
const errorResponse=(error:unknown)=>NextResponse.json({error:error instanceof WebsiteAdminError?error.message:'Admin service temporarily unavailable'},{status:error instanceof WebsiteAdminError?error.status:503});
export async function GET(){try{const session=await getServerSession(authOptions);await ensurePermanentAdminExists();return NextResponse.json({success:true,admins:await listWebsiteAdmins(session as any)});}catch(e){return errorResponse(e);}}
export async function POST(request:NextRequest){try{const session=await getServerSession(authOptions);await ensurePermanentAdminExists();const admin=await createWebsiteAdmin(session as any,await request.json(),true);return NextResponse.json({success:true,message:'Admin created successfully',admin});}catch(e){return errorResponse(e);}}
