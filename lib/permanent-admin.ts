import {createHash} from 'node:crypto';
import bcrypt from 'bcryptjs';
import { FieldValue } from 'firebase-admin/firestore';
import { getWebsiteFirestore } from '@/lib/firebase-admin';

type PermanentAdminConfig = { email: string; password: string; name: string };
function pickFirst(...values: Array<string | undefined>) { for (const value of values) if (value?.trim()) return value.trim(); return ''; }
export function getPermanentAdminConfig(): PermanentAdminConfig | null { const email = pickFirst(process.env.PERMANENT_ADMIN_EMAIL, process.env.ADMIN_EMAIL).toLowerCase(); const password = pickFirst(process.env.PERMANENT_ADMIN_PASSWORD, process.env.ADMIN_PASSWORD); const name = pickFirst(process.env.PERMANENT_ADMIN_NAME, process.env.ADMIN_NAME, 'Permanent Admin'); return email && password ? { email, password, name } : null; }
export async function ensurePermanentAdminExists() {
  const config = getPermanentAdminConfig(); if (!config) return null;
  const db = getWebsiteFirestore(),guard=db.collection('_websiteAdminState').doc('bootstrap');
  const deterministic=db.collection('websiteAdmins').doc('permanent-'+createHash('sha256').update(config.email).digest('hex'));
  return db.runTransaction(async tx=>{
    await tx.get(guard);
    const snapshot=await tx.get(db.collection('websiteAdmins').where('email','==',config.email).limit(2));
    if(snapshot.size>1)throw new Error('Duplicate configured administrator records require review');
    if(snapshot.empty){
      const occupied=await tx.get(deterministic);if(occupied.exists)throw new Error('Configured administrator identity conflict');
      const passwordHash=await bcrypt.hash(config.password,12);
      tx.create(deterministic,{email:config.email,passwordHash,name:config.name,role:'superadmin',isPermanent:true,createdAt:FieldValue.serverTimestamp(),updatedAt:FieldValue.serverTimestamp()});
      tx.set(guard,{updatedAt:FieldValue.serverTimestamp()},{merge:true});
    }else{
      const row=snapshot.docs[0],existing=row.data(),patch:Record<string,unknown>={};
      if(existing.role!=='superadmin')patch.role='superadmin';if(existing.isPermanent!==true)patch.isPermanent=true;if(existing.name!==config.name)patch.name=config.name;
      if(Object.keys(patch).length){patch.updatedAt=FieldValue.serverTimestamp();tx.update(row.ref,patch);tx.set(guard,{updatedAt:FieldValue.serverTimestamp()},{merge:true});}
    }
    return config.email;
  });
}
