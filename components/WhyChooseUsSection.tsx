"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export default function WhyChooseUsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="rounded-[28px] py-10 md:py-16"
    >
      <div className="site-fill">
        {/* Desktop Version */}
        <div className="hidden lg:block">
          <Image
            src="/threewhydesktop.png"
            alt="Why Choose Us - Desktop"
            width={1200}
            height={600}
            loading="lazy"
            sizes="(max-width: 1200px) 100vw, 1200px"
            className="w-full h-auto"
            unoptimized
          />
        </div>

        {/* Mobile Version */}
        <div className="lg:hidden">
          <Image
            src="/threewhymobile.png"
            alt="Why Choose Us - Mobile"
            width={600}
            height={800}
            loading="lazy"
            sizes="100vw"
            className="w-full h-auto"
            unoptimized
          />
        </div>
      </div>
    </section>
  );
}