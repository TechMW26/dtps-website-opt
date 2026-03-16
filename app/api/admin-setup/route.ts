import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Admin from '@/models/Admin';

export async function GET() {
  try {
    await dbConnect();
    
    // Check if any admin exists
    const adminExists = await Admin.findOne({});
    
    return NextResponse.json({
      adminExists: !!adminExists,
    });
  } catch (error: any) {
    console.error('Error checking admin:', error?.message || error);
    
    // Return a graceful error response instead of 500
    return NextResponse.json(
      { 
        adminExists: false,
        warning: 'Database connection unavailable. Running in offline mode.',
        error: error?.message || 'Database connection failed'
      },
      { status: 200 } // Return 200 to allow UI to load
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    // Check if any admin already exists
    const existingAdmin = await Admin.findOne({});
    if (existingAdmin) {
      return NextResponse.json(
        { error: 'Admin already exists. Please login instead.' },
        { status: 400 }
      );
    }

    const { email, password, name } = await request.json();

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Create first admin
    const newAdmin = new Admin({
      email: email.toLowerCase(),
      password,
      name,
      role: 'superadmin', // First admin is superadmin
    });

    await newAdmin.save();

    return NextResponse.json(
      { message: 'Admin created successfully. Please login.' },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating admin:', error?.message || error);
    
    // Check for database connection errors
    if (error?.message?.includes('MongoDB connection') || error?.message?.includes('ECONNREFUSED')) {
      return NextResponse.json(
        { error: 'Database connection unavailable. Please check your MongoDB connection.' },
        { status: 503 } // Service Unavailable
      );
    }
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to create admin' },
      { status: 500 }
    );
  }
}
