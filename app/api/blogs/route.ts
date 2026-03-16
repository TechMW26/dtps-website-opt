import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Blog from '@/models/Blog';

// Get all blogs
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const published = searchParams.get('published');
    const featured = searchParams.get('featured');
    const category = searchParams.get('category');
    const slug = searchParams.get('slug');
    const limit = searchParams.get('limit');

    if (slug) {
      const blog = await Blog.findOne({ slug });
      if (!blog) {
        return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
      }
      // Increment views
      await Blog.findByIdAndUpdate(blog._id, { $inc: { views: 1 } });
      return NextResponse.json({ success: true, blog });
    }

    const query: any = {};
    if (published === 'true') query.published = true;
    if (featured === 'true') query.featured = true;
    if (category) query.category = category;

    let blogsQuery = Blog.find(query).sort({ createdAt: -1 });
    if (limit) blogsQuery = blogsQuery.limit(parseInt(limit));

    const blogs = await blogsQuery;

    return NextResponse.json({
      success: true,
      blogs,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch blogs' },
      { status: 500 }
    );
  }
}

// Create blog (protected)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const payload = { ...body };

    if (!payload.title) {
      payload.title = `Image ${Date.now()}`;
    }

    if (!payload.content) {
      payload.content = 'Image content';
    }

    if (!payload.excerpt && payload.description) {
      payload.excerpt = payload.description;
    }

    if (!payload.featuredImage && payload.image) {
      payload.featuredImage = payload.image;
    }

    if (payload.published === undefined && payload.isPublished !== undefined) {
      payload.published = payload.isPublished;
    }

    if (!payload.author) {
      payload.author = 'DTPS Admin';
    }

    if (!payload.category) {
      payload.category = 'Health & Nutrition';
    }

    if (!payload.readTime) {
      payload.readTime = '1 min read';
    }

    // Generate slug from title if not provided
    if (!payload.slug && payload.title) {
      payload.slug = payload.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    const blog = await Blog.create(payload);

    return NextResponse.json({
      success: true,
      blog,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create blog' },
      { status: 500 }
    );
  }
}

// Update blog (protected)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const { id, ...updateData } = body;

    const blog = await Blog.findByIdAndUpdate(id, updateData, { new: true });

    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      blog,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update blog' },
      { status: 500 }
    );
  }
}

// Delete blog (protected)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    const blog = await Blog.findByIdAndDelete(id);

    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Blog deleted successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete blog' },
      { status: 500 }
    );
  }
}
