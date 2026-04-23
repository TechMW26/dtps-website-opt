import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Admin from '@/models/Admin';
import SecurityLog from '@/models/SecurityLog';
import { ensurePermanentAdminExists, getPermanentAdminConfig } from '@/lib/permanent-admin';
import { logSecurityEvent, sanitizeText } from '@/lib/security';

const VALID_ROLES = ['superadmin', 'admin', 'manager', 'editor', 'support', 'viewer'] as const;
type UserRole = (typeof VALID_ROLES)[number];

function isValidRole(role: string): role is UserRole {
  return VALID_ROLES.includes(role as UserRole);
}

async function getSessionOrDeny() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  return { session };
}

function isSuperAdmin(session: any) {
  return (session?.user as any)?.role === 'superadmin';
}

export async function GET() {
  const auth = await getSessionOrDeny();
  if (auth.error) return auth.error;

  try {
    await dbConnect();
    await ensurePermanentAdminExists();

    const users = await Admin.find({}).select('-password').sort({ createdAt: -1 }).lean();
    const userEmails = users.map((u: any) => u.email);

    const activities = await SecurityLog.find({
      type: { $in: ['login_success', 'logout', 'admin_action', 'password_change'] },
      $or: [
        { email: { $in: userEmails } },
        { 'meta.targetUserEmail': { $in: userEmails } },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(500)
      .lean();

    return NextResponse.json({
      success: true,
      users,
      activities,
      permanentAdminEmail: getPermanentAdminConfig()?.email || null,
      availableRoles: VALID_ROLES,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = await getSessionOrDeny();
  if (auth.error) return auth.error;
  if (!isSuperAdmin(auth.session)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    await dbConnect();
    await ensurePermanentAdminExists();

    const body = await req.json();
    const email = sanitizeText(String(body?.email || '').toLowerCase(), 120);
    const password = String(body?.password || '');
    const name = sanitizeText(String(body?.name || ''), 80);
    const role = sanitizeText(String(body?.role || 'admin'), 20);

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Name, email and password are required' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }
    if (!isValidRole(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    const existing = await Admin.findOne({ email });
    if (existing) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }

    const user = await Admin.create({
      email,
      password,
      name,
      role,
      isPermanent: false,
    });

    await logSecurityEvent({
      type: 'admin_action',
      severity: 'info',
      message: `User created: ${email}`,
      email: (auth.session?.user as any)?.email,
      meta: {
        actorEmail: (auth.session?.user as any)?.email,
        targetUserEmail: email,
        action: 'create_user',
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        isPermanent: user.isPermanent,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to create user' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await getSessionOrDeny();
  if (auth.error) return auth.error;
  if (!isSuperAdmin(auth.session)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    await dbConnect();
    await ensurePermanentAdminExists();

    const body = await req.json();
    const userId = sanitizeText(String(body?.userId || ''), 60);
    const name = sanitizeText(String(body?.name || ''), 80);
    const role = sanitizeText(String(body?.role || ''), 20);
    const password = String(body?.password || '');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const user = await Admin.findById(userId).select('+password');
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    if (user.isPermanent) {
      return NextResponse.json({ error: 'Permanent admin cannot be modified' }, { status: 400 });
    }

    if (name) user.name = name;
    if (role) {
      if (!isValidRole(role)) {
        return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
      }
      user.role = role;
    }
    if (password) {
      if (password.length < 8) {
        return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
      }
      user.password = password;
    }

    await user.save();

    await logSecurityEvent({
      type: 'admin_action',
      severity: 'info',
      message: `User updated: ${user.email}`,
      email: (auth.session?.user as any)?.email,
      meta: {
        actorEmail: (auth.session?.user as any)?.email,
        targetUserEmail: user.email,
        action: 'update_user',
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        isPermanent: user.isPermanent,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to update user' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await getSessionOrDeny();
  if (auth.error) return auth.error;
  if (!isSuperAdmin(auth.session)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    await dbConnect();
    await ensurePermanentAdminExists();

    const { searchParams } = new URL(req.url);
    const userId = sanitizeText(String(searchParams.get('userId') || ''), 60);

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const user = await Admin.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    if (user.isPermanent) {
      return NextResponse.json({ error: 'Permanent admin cannot be deleted' }, { status: 400 });
    }

    const actorEmail = (auth.session?.user as any)?.email;
    if (actorEmail && actorEmail === user.email) {
      return NextResponse.json({ error: 'You cannot delete your own account' }, { status: 400 });
    }

    await Admin.deleteOne({ _id: user._id });

    await logSecurityEvent({
      type: 'admin_action',
      severity: 'warning',
      message: `User deleted: ${user.email}`,
      email: actorEmail,
      meta: {
        actorEmail,
        targetUserEmail: user.email,
        action: 'delete_user',
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to delete user' },
      { status: 500 }
    );
  }
}
