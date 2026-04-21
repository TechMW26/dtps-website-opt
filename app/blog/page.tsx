'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';

interface Blog {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage: string;
  createdAt: string;
  category: string;
  readTime?: string;
  author?: string;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

const FALLBACK =
  'https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c908bfd19f93f09dc3df.jpg';

/* ─── Card skeletons ─── */
function CardSkeleton() {
  return (
    <div className="rounded-2xl bg-[#F3F3F3] overflow-hidden animate-pulse">
      <div className="w-full aspect-[16/9] bg-[#D9D9D9]" />
      <div className="p-5 space-y-3">
        <div className="h-3 w-20 bg-[#D9D9D9] rounded-full" />
        <div className="h-5 w-full bg-[#D9D9D9] rounded" />
        <div className="h-4 w-5/6 bg-[#D9D9D9] rounded" />
        <div className="h-4 w-4/6 bg-[#D9D9D9] rounded" />
      </div>
    </div>
  );
}

export default function BlogPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBlogs() {
      try {
        const response = await fetch('/api/blogs?published=true', { cache: 'no-store' });
        const data = await response.json();
        if (data.success && data.blogs) setBlogs(data.blogs);
      } catch (error) {
        console.error('Failed to fetch blogs:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchBlogs();
  }, []);

  const [featured, ...rest] = blogs;

  return (
    <div className="bg-white min-h-screen">

      {/* ── Hero ── */}
      <section className="site-shell pt-4 md:pt-[60px]">
        <div className="bg-[#014E4E] rounded-3xl overflow-hidden w-full">
          <Navbar />
          <div className="flex flex-col items-center w-full px-6 py-12 text-center md:py-20">
            <span className="bg-white/15 text-white/90 text-[11px] font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-5">
              Health &amp; Nutrition
            </span>
            <h1 className="text-[1.9rem] md:text-[3rem] lg:text-[3.5rem] font-bold text-white leading-[1.15] max-w-[700px] tracking-tight">
              Your Guide to{' '}
              <span className="text-[#FF850B]">Better Nutrition</span>
            </h1>
            <p className="mt-4 text-white/60 text-[15px] max-w-[480px] leading-relaxed">
              Real tips, real food, and sustainable wellness — by Dietitian Poonam Sagar.
            </p>
          </div>
        </div>
      </section>

      <section className="site-shell py-12 md:py-16">
        <div className="site-fill">

          {loading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : blogs.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-lg text-gray-400">No articles available yet. Check back soon!</p>
            </div>
          ) : (
            <>
              {/* ── Featured post ── */}
              {featured && (
                <Link href={`/blog/${featured.slug}`} className="group block mb-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-0 rounded-2xl overflow-hidden bg-[#F6FAFA] border border-[#014E4E]/10 hover:shadow-lg transition-shadow duration-300">
                    {/* image */}
                    <div className="relative w-full aspect-[16/9] md:aspect-auto md:min-h-[280px]">
                      <Image
                        src={featured.featuredImage || FALLBACK}
                        alt={featured.title}
                        fill
                        className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                        style={{ objectFit: 'cover', objectPosition: 'center' }}
                        priority
                        sizes="(max-width: 767px) 100vw, 50vw"
                      />
                    </div>
                    {/* text */}
                    <div className="flex flex-col justify-center p-7 md:p-10">
                      <div className="flex items-center gap-3 mb-4">
                        {featured.category && (
                          <span className="bg-[#014E4E] text-white px-3 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide">
                            {featured.category}
                          </span>
                        )}
                        <span className="text-[12px] text-[#8C8C8C]">{formatDate(featured.createdAt)}</span>
                      </div>
                      <h2 className="text-[1.35rem] md:text-[1.65rem] font-bold text-[#1a1a1a] leading-[1.2] mb-3 group-hover:text-[#014E4E] transition-colors">
                        {featured.title}
                      </h2>
                      <p className="text-[#6B6B6B] text-[14px] leading-relaxed line-clamp-3 mb-5">
                        {featured.excerpt}
                      </p>
                      <span className="inline-flex items-center gap-2 text-[#014E4E] font-semibold text-sm">
                        Read article
                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                        </svg>
                      </span>
                    </div>
                  </div>
                </Link>
              )}

              {/* ── Rest of posts grid ── */}
              {rest.length > 0 && (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {rest.map((blog) => (
                    <article key={blog._id} className="group rounded-2xl overflow-hidden bg-white border border-gray-100 hover:shadow-md transition-shadow duration-300 flex flex-col">
                      <Link href={`/blog/${blog.slug}`} className="block relative w-full aspect-[16/9] overflow-hidden bg-gray-100">
                        <Image
                          src={blog.featuredImage || FALLBACK}
                          alt={blog.title}
                          fill
                          className="object-cover group-hover:scale-[1.04] transition-transform duration-500"
                          style={{ objectFit: 'cover', objectPosition: 'center' }}
                          loading="lazy"
                          sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
                        />
                        {blog.category && (
                          <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-[#014E4E] px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide shadow-sm">
                            {blog.category}
                          </span>
                        )}
                      </Link>

                      <div className="flex flex-col flex-1 p-5">
                        <p className="text-[11px] text-[#9C9C9C] mb-2.5 flex items-center gap-2">
                          {formatDate(blog.createdAt)}
                          {blog.readTime && (
                            <>
                              <span className="w-1 h-1 rounded-full bg-[#C5C5C5]" />
                              {blog.readTime} read
                            </>
                          )}
                        </p>

                        <Link href={`/blog/${blog.slug}`}>
                          <h3 className="text-[#1a1a1a] text-[16px] font-bold leading-[1.3] mb-2.5 group-hover:text-[#014E4E] transition-colors line-clamp-2">
                            {blog.title}
                          </h3>
                        </Link>

                        <p className="text-[#7A7A7A] text-[13px] leading-relaxed line-clamp-2 flex-1 mb-4">
                          {blog.excerpt}
                        </p>

                        <Link
                          href={`/blog/${blog.slug}`}
                          className="inline-flex items-center gap-1.5 text-[#014E4E] text-[12px] font-semibold hover:gap-3 transition-all duration-200"
                        >
                          Read more
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                          </svg>
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
