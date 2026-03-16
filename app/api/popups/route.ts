import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Lead from '@/models/Lead';
import PopupBanner from '@/models/PopupBanner';
import dbConnect from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page');
    const action = searchParams.get('action');

    if (action === 'getPopup' && page) {
      const popup = await PopupBanner.findOne({
        pages: page,
        isActive: true
      });

      return NextResponse.json({
        popup: popup || null,
        success: true
      });
    }

    // Get all popups for admin
    const popups = await PopupBanner.find().sort({ createdAt: -1 });

    return NextResponse.json({
      popups: popups || [],
      success: true
    });
  } catch (error) {
    console.error('Error fetching popups:', error);
    return NextResponse.json(
      { error: 'Failed to fetch popups' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const { phoneNumber, page, action, title, image, pages, isActive } = body;

    if (action === 'saveLead') {
      if (!phoneNumber || !/^[0-9]{10}$/.test(phoneNumber)) {
        return NextResponse.json(
          { error: 'Invalid phone number' },
          { status: 400 }
        );
      }

      const lead = new Lead({
        phoneNumber,
        page: page || 'unknown'
      });

      await lead.save();

      return NextResponse.json({
        success: true,
        message: 'Lead saved successfully',
        leadId: lead._id
      });
    }

    // Create new popup
    if (title && image && pages && pages.length > 0) {
      const popup = new PopupBanner({
        title,
        image,
        pages,
        isActive: isActive !== false
      });

      await popup.save();

      return NextResponse.json({
        success: true,
        message: 'Popup created successfully',
        popup
      });
    }

    return NextResponse.json(
      { error: 'Invalid action or missing fields' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const { _id, title, image, pages, isActive } = body;

    if (!_id) {
      return NextResponse.json(
        { error: 'Popup ID is required' },
        { status: 400 }
      );
    }

    const popup = await PopupBanner.findByIdAndUpdate(
      _id,
      { title, image, pages, isActive },
      { new: true }
    );

    return NextResponse.json({
      popup,
      success: true,
      message: 'Popup updated successfully'
    });
  } catch (error) {
    console.error('Error updating popup:', error);
    return NextResponse.json(
      { error: 'Failed to update popup' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Popup ID is required' },
        { status: 400 }
      );
    }

    await PopupBanner.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Popup deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting popup:', error);
    return NextResponse.json(
      { error: 'Failed to delete popup' },
      { status: 500 }
    );
  }
}
