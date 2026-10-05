import type { Metadata } from 'next';
import { getWebsiteFirestore, serializeFirestoreDocument } from '@/lib/firebase-admin';
import BlogDetailClient from './BlogDetailClient';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const snapshot = await getWebsiteFirestore().collection('websiteBlogs').where('slug', '==', slug).where('published', '==', true).limit(1).get();
    if (snapshot.empty) {
      return {
        title: 'Blog Post Not Found',
        description: 'The article you are looking for does not exist.',
        robots: { index: false, follow: false },
      };
    }
    const b = serializeFirestoreDocument(snapshot.docs[0].id, snapshot.docs[0].data() as Record<string, unknown>) as unknown as {
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
