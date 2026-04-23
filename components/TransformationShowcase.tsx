'use client';

import { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

interface Transformation {
  _id: string;
  clientName: string;
  beforeImage?: string;
  afterImage?: string;
  weightLost: string;
  daysToAchieve: string;
  testimonial?: string;
  page: string;
  targetPages?: string[];
  featured: boolean;
  isActive: boolean;
}

interface TransformationShowcaseProps {
  page: 'weight-loss' | 'pcod' | 'therapeutic' | 'wedding';
  title?: string;
  subtitle?: string;
  maxItems?: number;
}

const fallbackData: Transformation[] = [];

export default function TransformationShowcase({
  page,
  title,
  subtitle,
  maxItems = 6
}: TransformationShowcaseProps) {
  const [transformations, setTransformations] = useState<Transformation[]>(fallbackData as any);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransformations = async () => {
      try {
        const response = await fetch(`/api/transformations?page=${page}&active=true`, {
          cache: 'no-store'
        });
        const data = await response.json();

        if (data.transformations && data.transformations.length > 0) {
          setTransformations(data.transformations.slice(0, maxItems));
        }
      } catch (error) {
        console.error('Error fetching transformations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransformations();
  }, [page, maxItems]);

  return (
    <section className="site-card-padding py-10 md:py-[60px] bg-white">
      <div className="site-fill">
        {title && (
          <div className={`text-center mb-8 md:mb-[50px] ${page === 'wedding' ? 'hidden md:block' : ''}`}>
            <h2 className="text-2xl md:text-5xl font-bold text-black mb-2.5 font-[Epilogue,sans-serif] leading-tight">
              <span className="text-[#ff850b]">Over 1,00,000+</span><br />
              {title}
            </h2>
            {subtitle && (
              <p className="text-sm md:text-[17px] text-[#666] leading-relaxed max-w-full md:max-w-[680px] mx-auto">
                {subtitle}
              </p>
            )}
          </div>
        )}

        <style>{`
          .transformation-showcase-swiper .swiper {
            padding: 20px 40px;
          }

          .transformation-showcase-swiper .swiper-button-prev,
          .transformation-showcase-swiper .swiper-button-next {
            background: #ff850b;
            color: white;
            width: 44px;
            height: 44px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            top: 50%;
            transform: translateY(-50%);
            transition: all 0.3s ease;
            z-index: 10;
          }

          .transformation-showcase-swiper .swiper-button-prev:hover,
          .transformation-showcase-swiper .swiper-button-next:hover {
            background: #e6740a;
            box-shadow: 0 4px 12px rgba(255, 133, 11, 0.3);
          }

          .transformation-showcase-swiper .swiper-button-prev::after,
          .transformation-showcase-swiper .swiper-button-next::after {
            font-size: 20px;
            font-weight: bold;
          }

          .transformation-showcase-swiper .swiper-button-prev {
            left: 0;
          }

          .transformation-showcase-swiper .swiper-button-next {
            right: 0;
          }

          .transformation-showcase-card {
            background: #4e0101;
            overflow: hidden;
            transition: transform 0.3s ease;
            height: 100%;
          }

          .transformation-showcase-card:hover {
            transform: none;
          }

          .transformation-showcase-images {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0;
            height: 300px;
            background: #000;
          }

          .transformation-showcase-image-container {
            position: relative;
            overflow: hidden;
            background: #f0f0f0;
          }

          .transformation-showcase-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .transformation-showcase-image-label {
            position: absolute;
            top: 12px;
            padding: 6px 12px;
            background: #4E0101;
            color: white;
            font-size: 12px;
            font-weight: 600;
            border-radius: 6px;
          }

          .transformation-showcase-image-label.before {
            left: 8px;
          }

          .transformation-showcase-image-label.after {
            right: 8px;
            background: rgba(22, 160, 133, 0.8);
          }

          .transformation-showcase-content {
            padding: 20px;
            color: white;
          }

          .transformation-showcase-name {
            font-size: 20px;
            font-weight: 700;
            color: white;
            margin: 0 0 8px;
          }

          .transformation-showcase-info {
            display: flex;
            gap: 10px;
            align-items: center;
            flex-wrap: wrap;
            margin-bottom: 0;
          }

          .transformation-showcase-weight {
            color: #16a085;
            font-size: 14px;
            font-weight: 600;
          }

          .transformation-showcase-badge {
            background: #ff850b;
            color: white;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 700;
            white-space: nowrap;
          }

          .transformation-showcase-dots {
            display: flex;
            justify-content: center;
            gap: 8px;
            margin-top: 30px;
          }

          .transformation-showcase-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #ddd;
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .transformation-showcase-dot.active {
            background: #ff850b;
            width: 24px;
            border-radius: 4px;
          }

          @media (max-width: 768px) {
            .transformation-showcase-swiper .swiper {
              padding: 20px 10px;
            }

            .transformation-showcase-swiper .swiper-button-prev,
            .transformation-showcase-swiper .swiper-button-next {
              width: 36px;
              height: 36px;
            }

            .transformation-showcase-images {
              height: 250px;
            }

            .transformation-showcase-name {
              font-size: 18px;
            }
          }
        `}</style>

        <div className="transformation-showcase-swiper">
          <Swiper
            modules={[Navigation, Autoplay]}
            navigation={true}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
            }}
            spaceBetween={30}
            slidesPerView={1}
            breakpoints={{
              640: {
                slidesPerView: 2,
                spaceBetween: 20,
              },
              1024: {
                slidesPerView: 3,
                spaceBetween: 30,
              },
            }}
            loop={true}
          >
            {transformations.map((transformation) => (
              <SwiperSlide key={transformation._id || transformation.clientName}>
                <div className="transformation-showcase-card">
                  {/* Before/After Images */}
                  <div className="transformation-showcase-images">
                    {/* Before Image */}
                    <div className="transformation-showcase-image-container">
                      {transformation.beforeImage ? (
                        <>
                          <img
                            src={transformation.beforeImage}
                            alt="Before"
                            className="transformation-showcase-image"
                            loading="lazy"
                            decoding="async"
                          />
                          <div className="transformation-showcase-image-label before">
                            Before
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#e5e7eb] text-[#999] text-xs">
                          No Image
                        </div>
                      )}
                    </div>

                    {/* After Image */}
                    <div className="transformation-showcase-image-container">
                      {transformation.afterImage ? (
                        <>
                          <img
                            src={transformation.afterImage}
                            alt="After"
                            className="transformation-showcase-image"
                            loading="lazy"
                            decoding="async"
                          />
                          <div className="transformation-showcase-image-label after">
                            After
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#e5e7eb] text-[#999] text-xs">
                          No Image
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
}
