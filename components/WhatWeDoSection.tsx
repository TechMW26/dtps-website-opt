"use client";
import Image from "next/image";

export default function WhatWeDoSection() {
  return (
    <section className="py-10 md:py-16">
      <div className="site-fill">
        {/* Desktop Version */}
        <div className="hidden lg:block">
          <Image
            src="https://ik.imagekit.io/br0mssyqj/DTPS-Ecommerce/static/home/wedding/section-28-1776941172011.jpg"
            alt="5-Cycle Weight Loss Process - Desktop"
            width={1200}
            height={800}
            loading="lazy"
            sizes="(max-width: 1400px) 100vw, 1400px"
            className="w-full h-auto"
            style={{ width: '100%', height: 'auto' }}
          />
        </div>

        {/* Mobile Version */}
        <div className="lg:hidden">
          <Image
            src="https://ik.imagekit.io/br0mssyqj/DTPS-Ecommerce/static/home/wedding/section-25-1776942342385.jpg"
            alt="5-Cycle Weight Loss Process - Mobile"
            width={600}
            height={800}
            loading="lazy"
            sizes="100vw"
            className="w-full h-auto"
            style={{ width: '100%', height: 'auto' }}
          />
        </div>
      </div>
    </section>
  );
}

