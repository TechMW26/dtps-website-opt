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

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/* ─── Skeleton loader ─── */
function Skeleton() {
  return (
    <div className="bg-white min-h-screen">
      <section className="site-shell pt-4 md:pt-[60px]">
        <div className="bg-[#014E4E] rounded-3xl overflow-hidden w-full">
          <Navbar />
          <div className="flex flex-col items-center w-full px-6 py-14 text-center gap-3">
            <div className="h-5 w-24 bg-white/20 rounded-full animate-pulse" />
            <div className="h-8 w-3/4 bg-white/20 rounded-xl animate-pulse" />
            <div className="h-8 w-1/2 bg-white/20 rounded-xl animate-pulse" />
            <div className="flex gap-4 mt-2">
              <div className="h-4 w-20 bg-white/20 rounded animate-pulse" />
              <div className="h-4 w-20 bg-white/20 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </section>
      <div className="site-shell py-10 md:py-14">
        <div className="max-w-[780px] mx-auto space-y-4">
          <div className="w-full h-[360px] bg-gray-100 rounded-2xl animate-pulse" />
          {[...Array(6)].map((_, i) => (
            <div key={i} className={`h-4 ${i % 3 === 0 ? 'w-full' : i % 3 === 1 ? 'w-5/6' : 'w-4/6'} bg-gray-100 rounded animate-pulse`} />
          ))}
        </div>
      </div>
    </div>
  );
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

  if (loading) return <Skeleton />;

  if (error || !blog) {
    return (
      <div className="bg-white min-h-screen">
        <section className="site-shell pt-4 md:pt-[60px]">
          <div className="bg-[#014E4E] rounded-3xl overflow-hidden w-full">
            <Navbar />
            <div className="flex flex-col items-center w-full px-6 py-20 text-center">
              <h1 className="text-2xl font-bold text-white mb-3">Article Not Found</h1>
              <p className="text-white/70 mb-6 text-sm">The article you&apos;re looking for doesn&apos;t exist or has been removed.</p>
              <Link href="/blog" className="rounded-full bg-[#FF8A1F] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#e07a00] transition-colors">
                ← Back to Blog
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">

      {/* ── Hero / Header ── */}
      <section className="site-shell pt-4 md:pt-[60px]">
        <div className="bg-[#014E4E] rounded-3xl overflow-hidden w-full">
          <Navbar />
          <div className="flex flex-col items-center w-full px-6 py-12 md:py-16 text-center">
            {/* breadcrumb */}
            <div className="flex items-center gap-1.5 text-white/50 text-xs mb-5">
              <Link href="/" className="hover:text-white/80 transition-colors">Home</Link>
              <span>/</span>
              <Link href="/blog" className="hover:text-white/80 transition-colors">Blog</Link>
              {blog.category && (
                <>
                  <span>/</span>
                  <span className="text-white/70">{blog.category}</span>
                </>
              )}
            </div>

            {/* category pill */}
            {blog.category && (
              <span className="bg-[#FF8A0A] text-white px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide mb-5">
                {blog.category}
              </span>
            )}

            {/* title */}
            <h1 className="text-[1.55rem] md:text-[2.4rem] lg:text-[2.8rem] font-bold text-white leading-[1.2] max-w-[820px] tracking-tight">
              {blog.title}
            </h1>

            {/* excerpt */}
            {blog.excerpt && (
              <p className="mt-4 text-white/65 text-[15px] md:text-base max-w-[640px] leading-relaxed">
                {blog.excerpt}
              </p>
            )}

            {/* meta row */}
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 mt-6 text-white/60 text-[13px]">
              {blog.author && (
                <span className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/>
                  </svg>
                  {blog.author}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                </svg>
                {formatDate(blog.createdAt)}
              </span>
              {blog.readTime && (
                <span className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                  </svg>
                  {blog.readTime} read
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Main content area ── */}
      <div className="site-shell py-10 md:py-14">
        <div className="max-w-[820px] mx-auto">

          {/* Featured image — fixed 16:9 aspect, no tall stretching */}
          {blog.featuredImage && (
            <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden shadow-md mb-10">
              <Image
                src={blog.featuredImage}
                alt={blog.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 820px) 100vw, 820px"
              />
            </div>
          )}

          {/* Article body */}
          <article
            className="blog-prose"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />

          {/* ── Footer row ── */}
          <div className="mt-12 pt-8 border-t border-gray-100">

            {/* Tags */}
            {blog.tags && blog.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {blog.tags.map((tag) => (
                  <span key={tag} className="bg-[#F0F7F7] text-[#014E4E] border border-[#014E4E]/20 px-3 py-1 rounded-full text-[12px] font-medium">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Author card */}
            <div className="flex items-start gap-4 bg-[#F6FAFA] border border-[#014E4E]/10 rounded-2xl p-5 mb-10">
              <div className="w-12 h-12 rounded-full bg-[#014E4E] flex items-center justify-center flex-shrink-0 text-white font-bold text-lg">
                {blog.author ? blog.author.charAt(0).toUpperCase() : 'D'}
              </div>
              <div>
                <p className="text-[13px] text-[#8C8C8C] mb-0.5">Written by</p>
                <p className="font-semibold text-[#1E1E1E] text-[15px]">{blog.author || 'Dietitian Poonam Sagar'}</p>
                <p className="text-[13px] text-[#6B6B6B] mt-1 leading-relaxed">
                  Expert dietitian &amp; nutritionist with 25+ years of experience guiding 15,000+ clients towards healthier lives.
                </p>
              </div>
            </div>

            {/* Back CTA */}
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-[#014E4E] font-semibold text-sm border border-[#014E4E]/30 rounded-full px-5 py-2.5 hover:bg-[#014E4E] hover:text-white transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
              </svg>
              Back to all articles
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
