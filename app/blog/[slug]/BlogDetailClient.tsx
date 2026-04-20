'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

interface Blog {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  category: string;
  tags: string[];
  author: string;
  readTime: string;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export default function BlogDetailClient() {
  const params = useParams();
  const slug = params.slug as string;
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchBlog() {
      try {
        const response = await fetch(`/api/blogs?slug=${encodeURIComponent(slug)}`, {
          cache: 'no-store',
        });
        const data = await response.json();
        if (data.success && data.blog) {
          setBlog(data.blog);
        } else {
          setError(true);
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    if (slug) fetchBlog();
  }, [slug]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="bg-white min-h-screen">
        <section className="hero-section site-shell pt-4 md:pt-[60px]">
          <div className="bg-[#014E4E] rounded-3xl overflow-hidden w-full">
            <div className="relative w-full">
              <Navbar />
              <div className="flex flex-col items-center w-full px-6 py-16 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white" />
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="bg-white min-h-screen">
        <section className="hero-section site-shell pt-4 md:pt-[60px]">
          <div className="bg-[#014E4E] rounded-3xl overflow-hidden w-full">
            <div className="relative w-full">
              <Navbar />
              <div className="flex flex-col items-center w-full px-6 py-16 text-center">
                <h1 className="text-2xl font-bold text-white mb-4">Blog Post Not Found</h1>
                <p className="text-white/80 mb-6">
                  The article you&apos;re looking for doesn&apos;t exist.
                </p>
                <Link
                  href="/blog"
                  className="rounded-full bg-[#FF8A1F] px-6 py-2.5 text-sm font-semibold text-white"
                >
                  Back to Blog
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section with Navbar */}
      <section className="hero-section site-shell pt-4 md:pt-[60px]">
        <div className="bg-[#014E4E] rounded-3xl overflow-hidden w-full">
          <div className="relative w-full">
            <Navbar />
            <div className="flex flex-col items-center w-full px-6 py-12 md:py-16 text-center">
              {blog.category && (
                <span className="bg-[#FF8A0A] text-white px-3 py-1 rounded-full text-xs font-semibold mb-4">
                  {blog.category}
                </span>
              )}
              <h1 className="text-[1.6rem] md:text-[2.5rem] lg:text-[3rem] font-bold text-white leading-[1.2] max-w-[800px]">
                {blog.title}
              </h1>
              <div className="flex items-center gap-4 mt-4 text-white/70 text-sm">
                {blog.author && <span>By {blog.author}</span>}
                <span>{formatDate(blog.createdAt)}</span>
                {blog.readTime && <span>{blog.readTime} read</span>}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Content */}
      <article className="site-shell py-10 md:py-16">
        <div className="site-fill">
          {/* Featured Image */}
          {blog.featuredImage && (
            <div className="mb-8 rounded-[18px] overflow-hidden">
              <Image
                src={blog.featuredImage}
                alt={blog.title}
                width={800}
                height={450}
                className="w-full h-auto object-cover"
                priority
                sizes="(max-width: 800px) 100vw, 800px"
              />
            </div>
          )}

          {/* Content */}
          <div
            className="prose prose-lg max-w-none
              prose-headings:text-[#1E1E1E] prose-headings:font-bold
              prose-p:text-[#4A4A4A] prose-p:leading-relaxed
              prose-a:text-[#015b5b] prose-a:font-medium
              prose-img:rounded-xl
              prose-strong:text-[#1E1E1E]
              prose-ul:text-[#4A4A4A] prose-ol:text-[#4A4A4A]"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="mt-10 pt-6 border-t border-gray-200">
              <div className="flex flex-wrap gap-2">
                {blog.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-[#F3F3F3] text-[#4A4A4A] px-3 py-1 rounded-full text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Back to Blog */}
          <div className="mt-10">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-[#015b5b] font-semibold text-sm hover:underline"
            >
              ← Back to all articles
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
}
