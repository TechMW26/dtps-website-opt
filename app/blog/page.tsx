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
}

export default function BlogPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBlogs() {
      try {
        const response = await fetch('/api/blogs?published=true');
        const data = await response.json();
        if (data.success && data.blogs) {
          setBlogs(data.blogs);
        }
      } catch (error) {
        console.error('Failed to fetch blogs:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchBlogs();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="">
      {/* Hero Section with Navbar */}
      <section className="hero-section pt-4 md:pt-[60px] px-3 md:px-[60px] lg:px-[120px]">
        <div className="bg-[#014E4E] rounded-3xl overflow-hidden w-full">
          <div className="relative w-full">
            {/* Navbar */}
            <Navbar />

            {/* Mobile Layout */}
            <div className="flex flex-col items-center w-full px-6 py-12 text-center md:hidden">
              <h1 className="text-[1.8rem] font-bold text-white leading-[1.3] mb-2">
                Your Guide to <span className="text-[#FF850B]">Better Nutrition</span>
              </h1>
              <h2 className="text-[1.8rem] font-bold text-white leading-[1.3] mb-2">
                Real tips, real food,
              </h2>
              <h3 className="text-[1.8rem] font-bold text-white leading-[1.3]">
                sustainable wellness.
              </h3>
            </div>

            {/* Desktop Layout */}
            <div className="flex-col items-center hidden w-full py-16 text-center md:flex lg:py-20" suppressHydrationWarning>
              <h1 className="text-[2.5rem] lg:text-[3rem] xl:text-[3.5rem] font-bold text-white leading-[1.2] mb-2">
                Your Guide to <span className="text-[#FF850B]">Better Nutrition</span>
              </h1>
              <h2 className="text-[2.5rem] lg:text-[3rem] xl:text-[3.5rem] font-bold text-white leading-[1.2] mb-4">
                Real tips, real food,
              </h2>
              <h3 className="text-[2.5rem] lg:text-[3rem] xl:text-[3.5rem] font-bold text-white leading-[1.2]">
                sustainable wellness.
              </h3>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Grid Section */}
      <section className="py-16 px-3 md:px-[60px] lg:px-[120px]">
        <div className="mx-auto max-w-[1200px]">
          {loading ? (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-[18px] bg-[#F3F3F3] p-[15px] animate-pulse">
                  <div className="h-[200px] w-full rounded-[12px] bg-[#D9D9D9]" />
                  <div className="pt-4">
                    <div className="h-4 w-24 bg-[#D9D9D9] rounded" />
                    <div className="mt-3 h-6 w-full bg-[#D9D9D9] rounded" />
                    <div className="mt-3 h-16 w-full bg-[#D9D9D9] rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : blogs.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-lg text-gray-500">No blog posts available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {blogs.map((blog) => (
                <article
                  key={blog._id}
                  className="rounded-[18px] bg-[#F3F3F3] p-[15px] shadow-sm hover:shadow-md transition-shadow"
                >
                  <Link href={`/blog/${blog.slug}`}>
                    <div className="overflow-hidden rounded-[12px]">
                      <Image
                        src={blog.featuredImage || "https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c908bfd19f93f09dc3df.jpg"}
                        alt={blog.title}
                        width={400}
                        height={250}
                        className="h-[200px] w-full rounded-[12px] object-cover bg-[#D9D9D9] hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw"
                      />
                    </div>
                  </Link>

                  <div className="pt-4">
                    <div className="flex items-center gap-3 text-[13px]">
                      <span className="text-[#8C8C8C] font-medium">
                        {formatDate(blog.createdAt)}
                      </span>
                      {blog.category && (
                        <span className="bg-[#015b5b] text-white px-2 py-0.5 rounded-full text-[11px]">
                          {blog.category}
                        </span>
                      )}
                    </div>

                    <Link href={`/blog/${blog.slug}`}>
                      <h3 className="mt-3 text-[#222222] text-[20px] leading-[1.2] font-bold hover:text-[#015b5b] transition-colors">
                        {blog.title}
                      </h3>
                    </Link>

                    <p className="mt-3 text-[#888888] text-[14px] leading-[1.5] line-clamp-3">
                      {blog.excerpt}
                    </p>

                    <Link
                      href={`/blog/${blog.slug}`}
                      className="mt-4 inline-flex h-[28px] items-center justify-center rounded-[8px] bg-[#FF8A0A] px-[12px] text-white text-[12px] font-semibold leading-none hover:bg-[#e07a00] transition-colors"
                    >
                      Read more <span className="ml-1">→</span>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
