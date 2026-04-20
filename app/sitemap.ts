import type { MetadataRoute } from 'next';
import dbConnect from '@/lib/mongodb';
import BlogModel from '@/models/Blog';

const SITE_URL = 'https://www.dtpoonamsagar.com';

export const revalidate = 3600; // regenerate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/weight-loss`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/pcod`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/plans/therapeutic`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/plans/wedding`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/appointment`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.6,
    },
  ];

  let blogRoutes: MetadataRoute.Sitemap = [];
  try {
    await dbConnect();
    const blogs = await BlogModel.find({ published: true })
      .select('slug updatedAt')
      .lean();
    blogRoutes = (blogs as { slug: string; updatedAt?: Date }[]).map((blog) => ({
      url: `${SITE_URL}/blog/${blog.slug}`,
      lastModified: blog.updatedAt ?? new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
  } catch {
    // If DB is unavailable, return static routes only
  }

  return [...staticRoutes, ...blogRoutes];
}
