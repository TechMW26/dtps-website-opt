import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Admin from '@/models/Admin';

// Create initial admin (for setup)
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // Check if any admin exists
    const existingAdmin = await Admin.findOne({});
    
    if (existingAdmin) {
      // If admin exists, require authentication
      const session = await getServerSession(authOptions);
      if (!session || (session.user as any)?.role !== 'superadmin') {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    const body = await request.json();
    const { email, password, name, role } = body;

    // Check if email already exists
    const existingEmail = await Admin.findOne({ email });
    if (existingEmail) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      );
    }

    const admin = await Admin.create({
      email,
      password,
      name,
      role: existingAdmin ? role : 'superadmin', // First admin is superadmin
    });

    return NextResponse.json({
      success: true,
      message: 'Admin created successfully',
      admin: {
        id: admin._id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create admin' },
      { status: 500 }
    );
  }
}

// Get all admins (protected)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    const admins = await Admin.find({}).select('-password');

    return NextResponse.json({
      success: true,
      admins,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch admins' },
      { status: 500 }
    );
  }
}
