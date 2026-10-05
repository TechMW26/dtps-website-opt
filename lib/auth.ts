import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { getWebsiteFirestore } from '@/lib/firebase-admin';
import { logSecurityEvent } from '@/lib/security';

export const authOptions: NextAuthOptions = {
  providers: [CredentialsProvider({
    name: 'credentials',
    credentials: { email: { label: 'Email', type: 'email' }, password: { label: 'Password', type: 'password' } },
    async authorize(credentials) {
      const email = credentials?.email?.toLowerCase().trim(); const password = credentials?.password;
      if (!email || !password) throw new Error('Invalid credentials');
      let admin: any = null;let ambiguous=false;
      try {
        const snapshot = await getWebsiteFirestore().collection('websiteAdmins').where('email', '==', email).limit(2).get();
        ambiguous=snapshot.size>1;
        if (!snapshot.empty) admin = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
      } catch { /* fall through to the configured bootstrap admin */ }
      const configuredEmail = (process.env.PERMANENT_ADMIN_EMAIL || process.env.ADMIN_EMAIL || '').toLowerCase().trim();
      const configuredPassword = process.env.PERMANENT_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || '';
      const configuredMatch = email === configuredEmail && Boolean(configuredPassword) && password === configuredPassword;
      const storedMatch = Boolean(admin?.passwordHash) && await bcrypt.compare(password, String(admin.passwordHash));
      if (ambiguous || admin?.isDeleted || ['inactive','suspended'].includes(admin?.status) || (!configuredMatch && !storedMatch)) {
        await logSecurityEvent({ type: 'login_failed', severity: 'warning', message: 'Failed admin login attempt', email });
        throw new Error('Invalid credentials');
      }
      const user = { id: String(admin?.id || 'configured-admin'), email, name: String(admin?.name || process.env.ADMIN_NAME || 'Admin'), role: String(admin?.role || 'superadmin') };
      await logSecurityEvent({ type: 'login_success', severity: 'info', message: 'Admin signed in', email });
      return user;
    },
  })],
  session: { strategy: 'jwt', maxAge: 24 * 60 * 60 },
  callbacks: {
    async jwt({ token, user }) { if (user) { token.id = user.id; token.role = (user as any).role; } return token; },
    async session({ session, token }) { if (session.user) { (session.user as any).id = token.id; (session.user as any).role = token.role; } return session; },
  },
  events: { async signOut({ token }) { await logSecurityEvent({ type: 'logout', severity: 'info', message: 'Admin signed out', email: (token as any)?.email }); } },
  pages: { signIn: '/admin/login', error: '/admin/login' },
  secret: process.env.NEXTAUTH_SECRET,
};
