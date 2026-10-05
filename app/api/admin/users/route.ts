import {NextRequest,NextResponse} from 'next/server';
import {getServerSession} from 'next-auth';
import {authOptions} from '@/lib/auth';
import {ensurePermanentAdminExists,getPermanentAdminConfig} from '@/lib/permanent-admin';
import {getWebsiteFirestore} from '@/lib/firebase-admin';
import {WebsiteAdminError,createWebsiteAdmin,changeWebsiteAdmin,listWebsiteAdmins,websiteAdminActivities,websiteSecurityDashboard,WEBSITE_ADMIN_ROLES} from '@/lib/website-admin-repository';
const errorResponse=(error:unknown)=>NextResponse.json({error:error instanceof WebsiteAdminError?error.message:'Admin service temporarily unavailable'},{status:error instanceof WebsiteAdminError?error.status:503});
export async function GET(){try{const session=await getServerSession(authOptions);await ensurePermanentAdminExists();const users=await listWebsiteAdmins(session as any),activities=await websiteAdminActivities(users.map(user=>String((user as any).email)));return NextResponse.json({success:true,users,activities,permanentAdminEmail:getPermanentAdminConfig()?.email||null,availableRoles:WEBSITE_ADMIN_ROLES});}catch(e){return errorResponse(e);}}
export async function POST(request:NextRequest){try{const session=await getServerSession(authOptions);await ensurePermanentAdminExists();const user=await createWebsiteAdmin(session as any,await request.json());return NextResponse.json({success:true,user});}catch(e){return errorResponse(e);}}
export async function PATCH(request:NextRequest){try{const session=await getServerSession(authOptions);await ensurePermanentAdminExists();const body=await request.json();const user=await changeWebsiteAdmin(session as any,String(body?.userId||''),body);return NextResponse.json({success:true,user});}catch(e){return errorResponse(e);}}
export async function DELETE(request:NextRequest){try{const session=await getServerSession(authOptions);await ensurePermanentAdminExists();await changeWebsiteAdmin(session as any,request.nextUrl.searchParams.get('userId')||'',null,true);return NextResponse.json({success:true});}catch(e){return errorResponse(e);}}
