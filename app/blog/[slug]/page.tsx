import type { Metadata } from 'next';
import dbConnect from '@/lib/mongodb';
import BlogModel from '@/models/Blog';
import BlogDetailClient from './BlogDetailClient';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    await dbConnect();
    const blog = await BlogModel.findOne({ slug, published: true }).lean();
    if (!blog) {
      return {
        title: 'Blog Post Not Found',
        description: 'The article you are looking for does not exist.',
        robots: { index: false, follow: false },
      };
    }
    const b = blog as {
      title: string;
      excerpt?: string;
      featuredImage?: string;
      author?: string;
      category?: string;
      tags?: string[];
    };
    return {
      title: b.title,
      description: b.excerpt ?? `Read this article by Dietitian Poonam Sagar.`,
      keywords: b.tags ?? [],
      openGraph: {
        title: b.title,
        description: b.excerpt ?? '',
        type: 'article',
        authors: b.author ? [b.author] : ['Dietitian Poonam Sagar'],
        images: b.featuredImage
          ? [{ url: b.featuredImage, alt: b.title }]
          : undefined,
      },
      twitter: {
        card: 'summary_large_image',
        title: b.title,
        description: b.excerpt ?? '',
        images: b.featuredImage ? [b.featuredImage] : undefined,
      },
      alternates: { canonical: `/blog/${slug}` },
    };
  } catch {
    return {
      title: 'Blog | Dietitian Poonam Sagar',
      description: 'Read expert health, nutrition, and wellness articles by Dietitian Poonam Sagar.',
    };
  }
}

export default function BlogDetailPage() {
  return <BlogDetailClient />;
}
