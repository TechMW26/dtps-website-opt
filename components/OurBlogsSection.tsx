"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

type Blog = {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage: string;
  createdAt: string;
};

export default function OurBlogsSection() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBlogs() {
      try {
        const response = await fetch('/api/blogs?published=true&limit=3');
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

  // Format date helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Don't render section if no blogs
  if (!loading && blogs.length === 0) {
    return null;
  }
  return (
    <section className="section-wrapper our-blogs-wrapper">
      <div className="w-full rounded-[30px] bg-[#015b5b] px-4 py-7 md:px-[64px] md:py-[58px] overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 md:gap-8">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="text-[#FF8A0A] text-[14px] leading-none">✦</span>
              <span className="text-white text-[14px] md:text-[15px] font-semibold leading-none">
                Our Blogs
              </span>
            </div>

            <h2 className="text-white text-[34px] leading-[1.08] tracking-[-0.02em] font-bold md:text-[60px] md:leading-[1.05]">
              Stories for
              <br className="md:hidden" />
              <span className="hidden md:inline"> </span>
              every mood
            </h2>
          </div>

          <a
            href="/blog"
            className="mt-[38px] md:mt-[28px] inline-flex h-[42px] md:h-[34px] shrink-0 items-center justify-center rounded-full bg-[#FF8A0A] px-6 md:px-7 text-white text-[14px] md:text-[13px] font-semibold leading-none"
          >
            <span className="md:hidden">View All</span>
            <span className="hidden md:inline">View more blogs</span>
          </a>
        </div>

        {/* Desktop Grid */}
        <div className="mt-12 hidden md:grid grid-cols-3 gap-[26px]">
          {loading ? (
            // Loading skeleton
            [...Array(3)].map((_, i) => (
              <article key={i} className="rounded-[18px] bg-[#F3F3F3] p-[15px] animate-pulse">
                <div className="h-[170px] w-full rounded-[12px] bg-[#D9D9D9]" />
                <div className="pt-4">
                  <div className="h-4 w-24 bg-[#D9D9D9] rounded" />
                  <div className="mt-3 h-6 w-full bg-[#D9D9D9] rounded" />
                  <div className="mt-3 h-16 w-full bg-[#D9D9D9] rounded" />
                </div>
              </article>
            ))
          ) : (
            blogs.map((blog) => (
              <article
                key={blog._id}
                className="rounded-[18px] bg-[#F3F3F3] p-[15px] shadow-none"
              >
                <div className="overflow-hidden rounded-[12px]">
                  <Image
                    src={blog.featuredImage || "https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c908bfd19f93f09dc3df.jpg"}
                    alt={blog.title}
                    width={360}
                    height={195}
                    className="h-[170px] w-full rounded-[12px] object-cover bg-[#D9D9D9]"
                    loading="lazy"
                    sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw"
                    quality={75}
                  />
                </div>

                <div className="pt-4">
                  <p className="text-[#8C8C8C] text-[13px] leading-[1.4] font-medium">
                    {formatDate(blog.createdAt)}
                  </p>

                  <h3 className="mt-3 text-[#222222] text-[21px] leading-[1.08] font-bold max-w-[300px]">
                    {blog.title}
                  </h3>

                  <p className="mt-3 text-[#888888] text-[13px] leading-[1.35] max-w-[315px]">
                    {blog.excerpt}
                  </p>

                  <a
                    href={`/blog/${blog.slug}`}
                    className="mt-4 inline-flex h-[22px] items-center justify-center rounded-[6px] bg-[#FF8A0A] px-[9px] text-white text-[11px] font-semibold leading-none"
                  >
                    Read more <span className="ml-1">→</span>
                  </a>
                </div>
              </article>
            ))
          )}
        </div>

        {/* Mobile Slider */}
        <div className="mt-8 md:hidden -mr-4">
          <div className="flex gap-4 overflow-x-auto pb-2 pr-4 snap-x snap-mandatory no-scrollbar">
            {loading ? (
              // Loading skeleton for mobile
              [...Array(3)].map((_, i) => (
                <article key={i} className="w-[270px] shrink-0 snap-start rounded-[16px] bg-[#F3F3F3] p-3 animate-pulse">
                  <div className="h-[132px] w-full rounded-[12px] bg-[#D9D9D9]" />
                  <div className="pt-3">
                    <div className="h-3 w-20 bg-[#D9D9D9] rounded" />
                    <div className="mt-3 h-5 w-full bg-[#D9D9D9] rounded" />
                    <div className="mt-3 h-12 w-full bg-[#D9D9D9] rounded" />
                  </div>
                </article>
              ))
            ) : (
              blogs.map((blog) => (
                <article
                  key={blog._id}
                  className="w-[270px] shrink-0 snap-start rounded-[16px] bg-[#F3F3F3] p-3"
                >
                  <div className="overflow-hidden rounded-[12px]">
                    <Image
                      src={blog.featuredImage || "https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c908bfd19f93f09dc3df.jpg"}
                      alt={blog.title}
                      width={260}
                      height={170}
                      className="h-[132px] w-full rounded-[12px] object-cover bg-[#D9D9D9]"
                      loading="lazy"
                      sizes="260px"
                      quality={75}
                    />
                  </div>

                  <div className="pt-3">
                    <p className="text-[#8C8C8C] text-[12px] leading-[1.35] font-medium">
                      {formatDate(blog.createdAt)}
                    </p>

                    <h3 className="mt-3 text-[#222222] text-[17px] leading-[1.08] font-bold">
                      {blog.title}
                    </h3>

                    <p className="mt-3 text-[#888888] text-[12px] leading-[1.35]">
                      {blog.excerpt}
                    </p>

                    <a
                      href={`/blog/${blog.slug}`}
                      className="mt-4 inline-flex h-[20px] items-center justify-center rounded-[6px] bg-[#FF8A0A] px-[8px] text-white text-[10px] font-semibold leading-none"
                    >
                      Read more <span className="ml-1">→</span>
                    </a>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .our-blogs-wrapper {
          padding-top: 0;
          padding-bottom: 0;
          padding-left: 70px;
          padding-right: 70px;
        }

        @media (max-width: 768px) {
          .our-blogs-wrapper {
            padding-left: 12px;
            padding-right: 12px;
          }
        }

        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
