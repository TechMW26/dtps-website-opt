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
        const response = await fetch('/api/blogs?published=true&limit=3', {
          cache: 'no-store'
        });
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
    <section className="w-full">
      <div className="w-full overflow-hidden rounded-[24px] bg-[#015b5b] px-4 py-8 md:rounded-none md:px-[70px] md:py-[58px]">
        {/* Header */}
        <div className="flex flex-row gap-4 items-end justify-center md:flex-row md:items-start md:justify-between md:gap-8 md:items-center">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <span className="text-[#f5a623] text-lg">✦</span>
              <span className="text-white text-base font-semibold">
                Our Blogs
              </span>
            </div>



            <h2 className="text-white text-[30px] leading-[0.98] tracking-[-0.04em] font-bold md:max-w-none md:text-[60px] md:leading-[1.05] md:tracking-[-0.02em]">
              Stories for every mood
            </h2>
          </div>

          <a
            href="/blog"
            className="inline-flex h-[40px] w-fit shrink-0 items-center justify-center rounded-full bg-[#FF8A0A] px-5 text-white text-[13px] font-semibold leading-none md:mt-[28px] md:h-[34px] md:self-auto md:px-7"
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
        <div className="mt-8 md:hidden">
          <div className="flex gap-4 overflow-x-auto pl-1 pr-4 pb-1 snap-x snap-mandatory no-scrollbar">
            {loading ? (
              // Loading skeleton for mobile
              [...Array(3)].map((_, i) => (
                <article key={i} className="w-[270px] shrink-0 snap-start rounded-[20px] bg-white p-[14px] animate-pulse">
                  <div className="h-[166px] w-full rounded-[14px] bg-[#D9D9D9]" />
                  <div className="pt-4">
                    <div className="h-3 w-24 rounded bg-[#D9D9D9]" />
                    <div className="mt-3 h-5 w-[85%] rounded bg-[#D9D9D9]" />
                    <div className="mt-3 h-[52px] w-full rounded bg-[#D9D9D9]" />
                    <div className="mt-4 h-[22px] w-[74px] rounded-[6px] bg-[#D9D9D9]" />
                  </div>
                </article>
              ))
            ) : (
              blogs.map((blog) => (
                <article
                  key={blog._id}
                  className="w-[270px] shrink-0 snap-start rounded-[20px] bg-white p-[14px]"
                >
                  <div className="overflow-hidden rounded-[14px]">
                    <Image
                      src={blog.featuredImage || "https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c908bfd19f93f09dc3df.jpg"}
                      alt={blog.title}
                      width={260}
                      height={170}
                      className="h-[166px] w-full rounded-[14px] object-cover bg-[#D9D9D9]"
                      loading="lazy"
                      sizes="260px"
                      quality={75}
                    />
                  </div>

                  <div className="pt-4">
                    <p className="text-[#8C8C8C] text-[11px] leading-[1.35] font-medium">
                      {formatDate(blog.createdAt)}
                    </p>

                    <h3 className="mobile-blog-title mt-3 min-h-[40px] text-[#222222] text-[19px] leading-[1.08] font-bold">
                      {blog.title}
                    </h3>

                    <p className="mobile-blog-excerpt mt-3 min-h-[50px] text-[#888888] text-[12px] leading-[1.45]">
                      {blog.excerpt}
                    </p>

                    <a
                      href={`/blog/${blog.slug}`}
                      className="mt-4 inline-flex h-[22px] items-center justify-center rounded-[6px] bg-[#FF8A0A] px-[9px] text-white text-[10px] font-semibold leading-none"
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

        .mobile-blog-title,
        .mobile-blog-excerpt {
          display: -webkit-box;
          overflow: hidden;
          -webkit-box-orient: vertical;
        }

        .mobile-blog-title {
          -webkit-line-clamp: 2;
        }

        .mobile-blog-excerpt {
          -webkit-line-clamp: 3;
        }
      `}</style>
    </section>
  );
}
