"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

interface Transformation {
  _id: string;
  clientName: string;
  beforeImage: string;
  afterImage: string;
  weightLost: string;
  daysToAchieve: string;
}

export default function LoseWeightSection() {

  const [transformations, setTransformations] = useState<Transformation[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/transformations?active=true");
        const data = await res.json();

        if (data.success) {
          setTransformations(data.transformations);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  return (
    <section className="bg-white py-12 md:py-[100px]">

      <div className="max-w-[1200px] mx-auto px-5">

        {/* Heading */}
        <h2 className="text-center text-2xl md:text-5xl font-bold leading-[1.3] mb-10">
          Lose <span className="text-[#ff850b]">5–7 Kilos</span> in just 30 Days
          <br className="hidden md:block" />
          & Still Eat the Food You Love!
        </h2>

        {/* Slider */}
        <Swiper
          modules={[Pagination, Autoplay]}
          slidesPerView={3}
          spaceBetween={25}
          loop
          autoplay={{ delay: 4000 }}
          pagination={{
            clickable: true,
            el: ".swiper-pagination-custom"
          }}
          breakpoints={{
            0: { slidesPerView: 1 },
            768: { slidesPerView: 3 }
          }}
          className="!pb-4"
        >

          {transformations.map((item) => (

            <SwiperSlide key={item._id} className="!h-auto flex justify-center">

              {/* CARD */}
              <div className="bg-white rounded-[22px] shadow-[0_8px_20px_rgba(0,0,0,0.08)] overflow-hidden relative w-full max-w-[340px]">

                {/* Pin */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                  <svg width="24" height="32" viewBox="0 0 32 40">
                    <path
                      d="M16 1C9.37 1 4 6.37 4 13c0 9 12 26 12 26s12-17 12-26c0-6.63-5.37-12-12-12z"
                      fill="#D32F2F"
                    />
                  </svg>
                </div>

                {/* Name */}
                <div className="text-center pt-6 pb-2">
                  <h3 className="font-bold text-[16px]">
                    {item.clientName}
                  </h3>

                  <p className="text-[#16a085] text-sm font-medium">
                    Lost {item.weightLost}
                  </p>
                </div>

                {/* Images */}
                <div className="grid grid-cols-2 h-[220px]">

                  {/* BEFORE */}
                  <div className="relative">
                    <Image
                      src={item.beforeImage}
                      alt="before"
                      fill
                      sizes="200px"
                      className="object-cover"
                    />

                    <span className="absolute bottom-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">
                      Before
                    </span>
                  </div>

                  {/* AFTER */}
                  <div className="relative">
                    <Image
                      src={item.afterImage}
                      alt="after"
                      fill
                      sizes="200px"
                      className="object-cover"
                    />

                    <span className="absolute bottom-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">
                      After
                    </span>
                  </div>

                </div>

                {/* Footer */}
                <div className="bg-[#16a085] py-3 text-center">
                  <span className="text-white font-semibold text-sm">
                    In Just {item.daysToAchieve}
                  </span>
                </div>

              </div>

            </SwiperSlide>

          ))}

        </Swiper>

        {/* Pagination */}
        <div className="swiper-pagination-custom flex justify-center mt-6 gap-2"></div>

        <style jsx global>{`
          .swiper-pagination-bullet{
            width:10px;
            height:10px;
            background:#d0d0d0;
            opacity:1;
          }

          .swiper-pagination-bullet-active{
            background:#ff850b;
            width:12px;
            height:12px;
          }
        `}</style>

        {/* Text */}
        <p className="text-center text-sm md:text-xl max-w-[800px] mx-auto mt-10">
          Forget diets. They were never built for people like you. At DTPS, we
          don't tell you to drink hot water and hate your meals. We take the
          food already on your plate and make it work for your body.
        </p>

      </div>

    </section>
  );
}