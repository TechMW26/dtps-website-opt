import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import dbConnect from '@/lib/mongodb';
import Admin from '@/models/Admin';
import { logSecurityEvent } from '@/lib/security';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toLowerCase().trim();
        if (!email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }

        await dbConnect();

        const admin = await Admin.findOne({ email }).select('+password');

        if (!admin) {
          await logSecurityEvent({
            type: 'login_failed',
            severity: 'warning',
            message: `Failed login attempt for unknown email: ${email}`,
            email,
          });
          throw new Error('Invalid credentials');
        }

        const isPasswordValid = await admin.comparePassword(credentials.password);

        if (!isPasswordValid) {
          await logSecurityEvent({
            type: 'login_failed',
            severity: 'warning',
            message: `Failed login attempt – wrong password`,
            email,
          });
          throw new Error('Invalid credentials');
        }

        await logSecurityEvent({
          type: 'login_success',
          severity: 'info',
          message: `Admin signed in`,
          email,
        });

        return {
          id: admin._id.toString(),
          email: admin.email,
          name: admin.name,
          role: admin.role,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  events: {
    async signOut({ token }) {
      await logSecurityEvent({
        type: 'logout',
        severity: 'info',
        message: 'Admin signed out',
        email: (token as any)?.email,
      });
    },
  },
  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
