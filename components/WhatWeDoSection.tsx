"use client";
import Image from "next/image";

export default function WhatWeDoSection() {
  return (
    <section className="py-6  sm:py-8 md:py-12 ">
      <div className="max-w-7xl mx-auto">
        {/* Desktop Version */}
        <div className="hidden lg:block">
          <Image
            src="https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c659a14dfc9fbf5ad4be.jpg"
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
            src="https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c65ba14dfc9fbf5ad4c1.jpg"
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

