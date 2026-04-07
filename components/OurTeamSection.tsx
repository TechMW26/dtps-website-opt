"use client";

import Image from "next/image";
import { useState } from "react";

export default function OurTeamSection() {
  const [teamBannerSrc, setTeamBannerSrc] = useState(
    "https://ik.imagekit.io/br0mssyqj/tr:w-1920,q-90,f-auto/DTPS-Ecommerce/static/home/team/dtps-full-team-image-v1.png"
  );
  const highlights = [
    { number: "01", label: "Years of Hands-On Experience" },
    { number: "02", label: "Real-World Case Experts" },
    { number: "03", label: "Condition-Specific Guidance" },
    { number: "04", label: "PCOD, Thyroid & Diabetes Experience" },
  ];

  const galleryImages = [
    "https://ik.imagekit.io/br0mssyqj/tr:q-90,f-auto/DTPS-Ecommerce/static/gridfs-69b7c6ffa14dfc9fbf5ad639.jpg",
    "https://ik.imagekit.io/br0mssyqj/tr:q-90,f-auto/DTPS-Ecommerce/static/gridfs-69b7c65ca14dfc9fbf5ad4c4.jpg",
    "https://ik.imagekit.io/br0mssyqj/tr:q-90,f-auto/DTPS-Ecommerce/static/gridfs-69b7c701a14dfc9fbf5ad644.jpg",
    "https://ik.imagekit.io/br0mssyqj/tr:q-90,f-auto/DTPS-Ecommerce/static/gridfs-69b7c707a14dfc9fbf5ad665.jpg",
  ];

  return (
    <section className="w-full bg-[#f7f7f7] md:bg-white rounded-none md:rounded-[26px] overflow-hidden border-0 md:border md:border-[#d9d9d9] md:outline md:outline-[0.5px] md:outline-[#6c6c6c] md:-outline-offset-[0.5px] flex flex-col items-center gap-8 md:gap-10 py-8 md:py-10">

      {/* Banner */}
      <div className="relative w-full overflow-hidden aspect-[16/9] sm:aspect-[16/8] md:aspect-[16/7] min-h-[220px] sm:min-h-[280px] md:min-h-[340px]">
        <Image
          src={teamBannerSrc}
          alt="Our Team"
          fill
          priority
          unoptimized
          className="object-cover object-top"
          sizes="100vw"
          onError={() => {
            if (teamBannerSrc !== "/images/dtps-full-team-image.png") {
              setTeamBannerSrc("/images/dtps-full-team-image.png");
            }
          }}
        />
      </div>

      {/* Content */}
      <div className="site-card-padding flex flex-col items-center gap-8 w-full">
        <div className="w-full max-w-[920px]">

          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[#f5a623] text-lg">✦</span>
              <span className="text-base font-semibold text-teal-600">
                Our Team
              </span>
            </div>

            <h2 className="m-0 text-[#1e1e1e] text-[28px] md:text-[40px] font-bold leading-[1.12] text-center">
              The People Behind Your Weight Loss Journey
            </h2>
          </div>

          <br />

          <div className="w-full text-base leading-[26px]">
            Weight loss doesn&apos;t work because of a chart. It works because of people. DTPS is run by a team of{" "}
            <span className="font-bold">
              200+ dietitians and health counsellors.
            </span>
            <br />
            They talk to you, understand your routine and adjust your plan when things don&apos;t go as planned. They track your progress, adjust your plan when needed, and stay involved until results show. This isn&apos;t automated support. This isn&apos;t passion written in a job description. It comes from people who genuinely care about outcomes, who think beyond charts and calls, and who take personal responsibility for your progress until results actually show.
          </div>

        </div>

        <div className="w-full max-w-[456px] border-t-2 border-[#e9e9e9]" />

        {/* Highlights Grid */}
        <div className="w-full max-w-[920px] grid grid-cols-2 gap-5 md:gap-[22px]">
          {highlights.map((item) => (
            <div
              key={item.number}
              className="w-full min-h-[130px] md:min-h-[76px] p-4 md:px-5 md:py-2 bg-white shadow-[0_0_4px_rgba(0,0,0,0.25)] rounded-[22px] md:rounded-[40px] flex flex-col md:flex-row items-center justify-center md:justify-start gap-2 md:gap-[14px] text-center md:text-left"
            >
              <div className="w-14 h-14 md:w-[60px] md:h-[60px] bg-[#014e4e] rounded-[14px] md:rounded-[32px] flex items-center justify-center flex-shrink-0">
                <div className="text-white text-[22px] md:text-[24px] font-extrabold">{item.number}</div>
              </div>
              <div className="text-[15px] md:text-[18px] font-semibold mt-2 md:mt-0">{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Gallery */}
      <div className="site-card-padding w-full flex gap-[14px] md:gap-5 overflow-x-auto md:overflow-visible snap-x snap-mandatory md:snap-none scrollbar-hide pb-2 md:justify-center">
        {galleryImages.map((img, index) => (
          <div
            key={index}
            className="flex-[0_0_270px] w-[270px] h-[179px] relative rounded-2xl overflow-hidden snap-center md:snap-align-none"
          >
            <Image
              src={img}
              alt={`Gallery ${index + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 639px) 75vw, (max-width: 767px) 60vw, 25vw"
              quality={90}
              unoptimized
            />
          </div>
        ))}
      </div>

    </section>
  );
}
