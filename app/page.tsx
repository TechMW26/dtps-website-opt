"use client"
import { useState, useEffect, Suspense } from 'react';
import Hero from '@/components/Hero';
import AboutUsSection from '@/components/AboutUsSection';
import ServicesSection from '@/components/ServicesSection';
import WhatWeDoSection from '@/components/WhatWeDoSection';
import WhyChooseUsSection from '@/components/WhyChooseUsSection';
import ExpertGuidanceSection from '@/components/ExpertGuidanceSection';
import OurTeamSection from '@/components/OurTeamSection';
import YouTubeShortsSlider from '@/components/YouTubeShortsSlider';
import FAQSection from '@/components/FAQSection';
import OurBlogsSection from '@/components/OurBlogsSection';
import Image from 'next/image';
import { getOptimizedUrl } from '@/lib/imagekit';


type Testimonial = {
  _id?: string;
  name: string;
  role?: string;
  content: string;
  image: string;
};

const fallbackTestimonials: Testimonial[] = [
  {
    name: 'Kalyani Satpathy',
    content: 'The diet plan is very simple and it included home cooked meal. Nothing fancy they will tell you and this is the best part of my journey.',
    image: 'https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c909bfd19f93f09dc3e7.jpg',
  },
  {
    name: 'Farah',
    content: 'I saw ad of Dt Poonam Sagar on Instagram and thought to give it a try and I dont regret my decision.',
    image: 'https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c909bfd19f93f09dc3e9.jpg',
  },
  {
    name: 'Rimpy Thakur',
    content: "Great experience with Dietician Poonam Sagar's team. Special thanks to Ritika Bhatnagar ma'am who created a special diet plan for me",
    image: 'https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c909bfd19f93f09dc3eb.jpg',
  },
  {
    name: 'Payal Padamwar',
    content: 'I lost 6 kg in just 3 months with a simple yet highly effective diet plan. The best part was the team\'s support.',
    image: 'https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c909bfd19f93f09dc3e7.jpg',
  },
];

export default function HomePage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(fallbackTestimonials);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const res = await fetch('/api/testimonials?page=home&active=true');
        if (!res.ok) {
          return;
        }
        const data = await res.json();
        const normalized = (data.testimonials || []).map((item: Testimonial & { _id?: string }) => ({
          _id: item._id,
          name: item.name || 'Client',
          role: item.role || '',
          content: item.content || '',
          image: getOptimizedUrl(item.image || 'https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c909bfd19f93f09dc3e7.jpg', {
            width: 300,
            height: 350,
            quality: 80,
            format: 'auto',
          }),
        }));
        if (normalized.length > 0) {
          setTestimonials(normalized);
        }
      } catch {
        // Keep fallback testimonials silently when API is unavailable
      }
    };

    fetchTestimonials();
  }, []);

  // Prevent flash of content before hydration
  if (!isClient) {
    return (
      <div className="min-h-screen bg-white">
        <Hero />
      </div>
    );
  }

  return (
    <div className="bg-white">
      <Hero />
      <div className="section-wrapper">
        <AboutUsSection />
      </div>
      <div className="section-wrapper">
        <ServicesSection />
      </div>
      <div className="section-wrapper">
        <WhatWeDoSection />
      </div>
      <div className="section-wrapper">
        <WhyChooseUsSection />
      </div>
      {/* Expert Guidance Section */}
      <div className="section-wrapper">
        <ExpertGuidanceSection />
      </div>
      {/* Our Team Section */}
      <div className="section-wrapper">
        <OurTeamSection />
      </div>

      {/* Our Programs Section */}
      <div className="section-wrapper">
        <section className="bg-white py-16 md:py-20 px-4 md:px-8 rounded-[30px] overflow-hidden">
          <div className="max-w-[1200px] mx-auto">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-6 md:mb-10">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[#ff9100] text-xl">✦</span>
                  <span className="text-base font-semibold text-teal-600">Hear from our Happy Clients</span>
                </div>
                <h2 className="text-[1.5rem] md:text-[2.5rem] font-bold text-gray-900 leading-tight">
                  Tailored programs for<br />your wellness
                </h2>
              </div>
            </div>
            <YouTubeShortsSlider />
          </div>
        </section>
      </div>

      {/* How It Work Section */}
      <div className="section-wrapper">
        <section className="relative w-full">
          {/* DESKTOP */}
          <div className="relative hidden md:block">
            <div
              className="relative overflow-hidden rounded-[30px] bg-[#014E4E] px-[52px] pt-[74px] pb-[210px]"
              style={{
                backgroundImage: `
                  repeating-radial-gradient(
                    circle at 0% 30%,
                    rgba(255,255,255,0.06) 0px,
                    rgba(255,255,255,0.06) 1px,
                    transparent 1px,
                    transparent 32px
                  ),
                  linear-gradient(180deg, #015a5a 0%, #014E4E 100%)
                `,
              }}
            >
              <div className="mx-auto max-w-[1202px]">
                {/* Header */}
                <div className="flex items-start justify-between gap-10 px-[128px]">
                  <div className="max-w-[430px]">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[#FF850B] text-[14px] leading-none">✦</span>
                      <span className="text-[14px] font-semibold leading-[1] text-white">
                        How It Work
                      </span>
                    </div>

                    <h2 className="text-[40px] font-bold leading-[1.15] tracking-[-0.02em] text-white">
                      Step-by-step guide
                      <br />
                      to your  healthy journey
                    </h2>
                  </div>

                  <p className="max-w-[415px] pt-8 text-[15px] leading-[1.75] text-white/90">
                    Achieving your health goals has never been easier. Our
                    step-by-step approach provides personalized guidance,
                    actionable strategies, and ongoing support.
                  </p>
                </div>

                {/* Steps */}
                <div className="relative mt-[78px] px-[88px]">

                  <div className="grid grid-cols-5 gap-6">

                    {/* Step 1 */}
                    <div className="relative">
                      {/* Dashed line with arrow to next step */}
                      <div className="pointer-events-none absolute left-[74px] top-[32px] z-[5] flex items-center"
                        style={{ width: 'calc(100% - 50px)' }}>
                        <Image
                          src="https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/home/how-it-work/step-connector-dashed-arrow-v2.png"
                          alt=""
                          width={170}
                          height={10}
                          className="w-full h-auto opacity-90"
                          aria-hidden="true"
                          loading="lazy"
                        />
                      </div>
                      <div className="relative mb-5 h-[72px]">
                        <div className="relative z-[2] flex h-[64px] w-[64px] items-center justify-center rounded-full  ">
                          <Image
                          
                            src="https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/home/how-it-work/step-icon-choose-plan-v2.png"
                            alt="Choose your plan icon"
                            width={31}
                            height={31}
                            className="h-[56px] w-[56px] object-contain"
                            loading="lazy"
                          />
                        </div>

                        <div className="absolute left-[52px] top-[22px] z-[3] flex h-[20px] w-[20px] items-center justify-center rounded-full bg-[#FF850B] text-[10px] font-semibold text-white">
                          1
                        </div>
                      </div>

                      <h3 className="text-[15px] font-semibold leading-[1.35] text-white">
                        Choose Your Plan
                      </h3>
                      <p className="mt-2 max-w-[170px] text-[12.5px] leading-[1.6] text-white/85">
                        Select a diet plan based on your goal, health condition, and duration.
                      </p>
                    </div>

                    {/* Step 2 */}
                    <div className="relative">
                      {/* Dashed line with arrow to next step */}
                      <div className="pointer-events-none absolute left-[74px] top-[32px] z-[5] flex items-center"
                        style={{ width: 'calc(100% - 50px)' }}>
                        <Image
                          src="https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/home/how-it-work/step-connector-dashed-arrow-v2.png"
                          alt=""
                          width={170}
                          height={10}
                          className="w-full h-auto opacity-90"
                          aria-hidden="true"
                          loading="lazy"
                        />
                      </div>
                      <div className="relative mb-5 h-[68px]">
                        <div className="relative z-[2] flex h-[64px] w-[64px] items-center justify-center rounded-full ">
                          <Image
                            src="https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/home/how-it-work/step-icon-counsellor-connect-v2.png"
                            alt="Health counsellor connect icon"
                            width={31}
                            height={31}
                            className="h-[56px] w-[56px] object-contain"
                            loading="lazy"
                          />
                        </div>

                        <div className="absolute left-[52px] top-[22px] z-[3] flex h-[20px] w-[20px] items-center justify-center rounded-full bg-[#FF850B] text-[10px] font-semibold text-white">
                          2
                        </div>
                      </div>

                      <h3 className="text-[15px] font-semibold leading-[1.35] text-white">
                        Health Counsellor Connect
                      </h3>
                      <p className="mt-2 max-w-[170px] text-[12.5px] leading-[1.6] text-white/85">
                        Our health counsellor connects with you to understand your lifestyle and concerns.
                      </p>
                    </div>

                    {/* Step 3 */}
                    <div className="relative">
                      {/* Dashed line with arrow to next step */}
                      <div className="pointer-events-none absolute left-[74px] top-[32px] z-[5] flex items-center"
                        style={{ width: 'calc(100% - 50px)' }}>
                        <Image
                          src="https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/home/how-it-work/step-connector-dashed-arrow-v2.png"
                          alt=""
                          width={170}
                          height={10}
                          className="w-full h-auto opacity-90"
                          aria-hidden="true"
                          loading="lazy"
                        />
                      </div>
                      <div className="relative mb-5 h-[72px]">
                        <div className="relative z-[2] flex h-[64px] w-[64px] items-center justify-center rounded-full">
                          <Image
                            src="https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/home/how-it-work/step-icon-dietitian-assessment-v2.png"
                            alt="Dietitian assessment call icon"
                            width={31}
                            height={31}
                            className="h-[56px] w-[56px] object-contain"
                            loading="lazy"
                          />
                        </div>

                        <div className="absolute left-[52px] top-[22px] z-[3] flex h-[20px] w-[20px] items-center justify-center rounded-full bg-[#FF850B] text-[10px] font-semibold text-white">
                          3
                        </div>
                      </div>

                      <h3 className="text-[15px] font-semibold leading-[1.35] text-white">
                        Dietitian Assessment Call
                      </h3>
                      <p className="mt-2 max-w-[170px] text-[12.5px] leading-[1.6] text-white/85">
                        Your assigned dietitian speaks with you to understand your lifestyle, food choices and health goals before planning your diet.
                      </p>
                    </div>

                    {/* Step 4 */}
                    <div className="relative">
                      {/* Dashed line with arrow to next step */}
                      <div className="pointer-events-none absolute left-[74px] top-[32px] z-[5] flex items-center"
                        style={{ width: 'calc(100% - 50px)' }}>
                        <Image
                          src="https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/home/how-it-work/step-connector-dashed-arrow-v2.png"
                          alt=""
                          width={170}
                          height={10}
                          className="w-full h-auto opacity-90"
                          aria-hidden="true"
                          loading="lazy"
                        />
                      </div>
                      <div className="relative mb-5 h-[72px]">
                        <div className="relative z-[2] flex h-[64px] w-[64px] items-center justify-center rounded-full ">
                          <Image
                            src="https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/home/how-it-work/step-icon-plan-delivery-v2.png"
                            alt="Personalised plan delivery icon"
                            width={31}
                            height={31}
                            className="h-[56px] w-[56px] object-contain"
                            loading="lazy"
                          />
                        </div>

                        <div className="absolute left-[52px] top-[22px] z-[3] flex h-[20px] w-[20px] items-center justify-center rounded-full bg-[#FF850B] text-[10px] font-semibold text-white">
                          4
                        </div>
                      </div>

                      <h3 className="text-[15px] font-semibold leading-[1.35] text-white">
                        Personalised Plan Delivery
                      </h3>
                      <p className="mt-2 max-w-[170px] text-[12.5px] leading-[1.6] text-white/85">
                        Your customised diet plan is shared on OUR APP within 24 hours of the assessment.
                      </p>
                    </div>

                    {/* Step 5 */}
                    <div className="relative">
                      <div className="relative mb-5 h-[72px]">
                        <div className="relative z-[2] flex h-[64px] w-[64px] items-center justify-center rounded-full">
                          <Image
                            src="https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/home/how-it-work/step-icon-followups-tracking-v2.png"
                            alt="Follow-ups and tracking icon"
                            width={31}
                            height={31}
                            className="h-[56px] w-[56px] object-contain"
                            loading="lazy"
                          />
                        </div>

                        <div className="absolute left-[52px] top-[22px] z-[3] flex h-[20px] w-[20px] items-center justify-center rounded-full bg-[#FF850B] text-[10px] font-semibold text-white">
                          5
                        </div>
                      </div>

                      <h3 className="text-[15px] font-semibold leading-[1.35] text-white">
                        Follow-Ups & Tracking
                      </h3>
                      <p className="mt-2 max-w-[170px] text-[12.5px] leading-[1.6] text-white/85">
                        Weekly or requirement-based follow-ups to track progress and make timely adjustments.
                      </p>
                    </div>

                  </div>
                </div>
              </div>
            </div>

            {/* Overlap appointment card */}
            <div className="relative z-10 mx-auto -mt-[178px] max-w-[1010px]">
              <div className="rounded-[22px] border border-[#F1F1F1] bg-white px-[66px] py-[66px] shadow-[0_0_20px_rgba(0,0,0,0.05)]">
                <div className="flex items-start gap-[40px]">
                  {/* left */}
                  <div className="w-[334px] flex-shrink-0">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-[#FF850B] text-[14px] leading-none">✦</span>
                      <span className="text-[14px] font-semibold text-[#014E4E]">
                        Appointment
                      </span>
                    </div>

                    <h3 className="text-[54px] font-bold leading-[1.02] tracking-[-0.03em] text-[#1E1E1E]">
                      Make appointment
                    </h3>

                    <p className="mt-4 text-[14px] leading-[1.7] text-[#828283]">
                      Easy scheduling for a personalized health coaching session.
                      Take the first step towards better health today!
                    </p>

                    <div className="mt-7 overflow-hidden rounded-[20px]">
                      <Image
                        src="https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c6f2a14dfc9fbf5ad5ec.jpg"
                        alt="Dietitian consultation"
                        width={334}
                        height={185}
                        className="h-[185px] w-full object-cover"
                        loading="lazy"
                        sizes="334px"
                        quality={75}
                      />
                    </div>
                  </div>

                  {/* right */}
                  <div className="flex-1 pt-6">
                    <form className="space-y-[15px]">
                      <div className="grid grid-cols-2 gap-[20px]">
                        <input
                          type="text"
                          placeholder="First Name"
                          className="h-[50px] w-full rounded-[10px] border border-[#F1F1F1] bg-white px-4 text-[14px] text-[#828283] outline-none placeholder:text-[#828283]"
                        />
                        <input
                          type="text"
                          placeholder="Last Name"
                          className="h-[50px] w-full rounded-[10px] border border-[#F1F1F1] bg-white px-4 text-[14px] text-[#828283] outline-none placeholder:text-[#828283]"
                        />
                      </div>

                      <input
                        type="email"
                        placeholder="Email Address"
                        className="h-[50px] w-full rounded-[10px] border border-[#F1F1F1] bg-white px-4 text-[14px] text-[#828283] outline-none placeholder:text-[#828283]"
                      />

                      <input
                        type="tel"
                        placeholder="Phone Number"
                        className="h-[50px] w-full rounded-[10px] border border-[#F1F1F1] bg-white px-4 text-[14px] text-[#828283] outline-none placeholder:text-[#828283]"
                      />

                      <div className="grid grid-cols-2 gap-[20px]">
                        <div className="relative">
                          <select className="h-[50px] w-full appearance-none rounded-[10px] border border-[#F1F1F1] bg-white px-4 text-[14px] text-[#828283] outline-none">
                            <option>Service</option>
                            <option>Weight Management</option>
                            <option>PCOD/PCOS</option>
                            <option>Therapeutic Diet</option>
                            <option>Wedding Program</option>
                          </select>
                          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#343A40]">
                            <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden="true">
                              <path
                                d="M2 3L7 8L12 3"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </span>
                        </div>

                        <input
                          type="date"
                          className="h-[50px] w-full rounded-[10px] border border-[#F1F1F1] bg-white px-4 text-[14px] text-[#828283] outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="mt-3 inline-flex h-[50px] min-w-[180px] items-center justify-center rounded-full bg-[#FF850B] px-7 text-[14px] font-bold text-white transition hover:opacity-95"
                      >
                        Book An Appointment
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* MOBILE */}
          <div className="md:hidden">
            <div className="overflow-hidden rounded-[28px] bg-[#014E4E] px-4 pb-6 pt-7">
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[#FF850B] text-[13px] leading-none">✦</span>
                  <span className="text-[13px] font-semibold text-white">
                    How It Work
                  </span>
                </div>

                <h2 className="text-[24px] font-bold leading-[1.18] tracking-[-0.02em] text-white">
                  Step-by-step guide to
                  <br />
                  your healthy journey
                </h2>

                <p className="mt-4 max-w-[335px] text-[14px] leading-[1.7] text-white/90">
                  Achieving your health goals has never been easier. Our
                  step-by-step approach provides personalized guidance,
                  actionable strategies, and ongoing support.
                </p>
              </div>

              <div className="relative pl-[6px] pr-[2px]">
                <div className="absolute left-[19px] top-[28px] bottom-[240px] border-l border-dotted border-white/45" />

                <div className="space-y-4">
                  {/* Mobile Step 1 */}
                  <div className="relative pl-10">
                    <div className="absolute left-0 top-[30px] z-[2] flex h-[26px] w-[26px] items-center justify-center rounded-full bg-[#FF850B] text-[12px] font-semibold text-white">
                      1
                    </div>

                    <div className="rounded-[18px] bg-[rgba(255,255,255,0.10)] px-3 py-4 shadow-[0_8px_16px_rgba(0,0,0,0.16)] ring-1 ring-white/5">
                      <div className="flex items-start gap-3">
                        <div className="flex h-[66px] w-[66px] flex-shrink-0 items-center justify-center rounded-full border border-white/70">
                          <Image
                            src="https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/home/how-it-work/step-icon-choose-plan-v2.png"
                            alt="Choose your plan icon"
                            width={31}
                            height={31}
                            className="h-[31px] w-[31px] object-contain"
                            loading="lazy"
                          />
                        </div>

                        <div className="pt-1">
                          <h3 className="text-[15px] font-semibold leading-[1.35] text-white">
                            Choose Your Plan
                          </h3>
                          <p className="mt-1.5 text-[12px] leading-[1.45] text-white/90">
                            Select a diet plan based on your goal, health
                            condition, and duration.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mobile Step 2 */}
                  <div className="relative pl-10">
                    <div className="absolute left-0 top-[30px] z-[2] flex h-[26px] w-[26px] items-center justify-center rounded-full bg-[#FF850B] text-[12px] font-semibold text-white">
                      2
                    </div>

                    <div className="rounded-[18px] bg-[rgba(255,255,255,0.10)] px-3 py-4 shadow-[0_8px_16px_rgba(0,0,0,0.16)] ring-1 ring-white/5">
                      <div className="flex items-start gap-3">
                        <div className="flex h-[66px] w-[66px] flex-shrink-0 items-center justify-center rounded-full border border-white/70">
                          <Image
                            src="https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/home/how-it-work/step-icon-counsellor-connect-v2.png"
                            alt="Health counsellor connect icon"
                            width={31}
                            height={31}
                            className="h-[31px] w-[31px] object-contain"
                            loading="lazy"
                          />
                        </div>

                        <div className="pt-1">
                          <h3 className="text-[15px] font-semibold leading-[1.35] text-white">
                            Health Counsellor Connect
                          </h3>
                          <p className="mt-1.5 text-[12px] leading-[1.45] text-white/90">
                            Our health counsellor connects with you to
                            understand your lifestyle and concerns.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mobile Step 3 */}
                  <div className="relative pl-10">
                    <div className="absolute left-0 top-[30px] z-[2] flex h-[26px] w-[26px] items-center justify-center rounded-full bg-[#FF850B] text-[12px] font-semibold text-white">
                      3
                    </div>

                    <div className="rounded-[18px] bg-[rgba(255,255,255,0.10)] px-3 py-4 shadow-[0_8px_16px_rgba(0,0,0,0.16)] ring-1 ring-white/5">
                      <div className="flex items-start gap-3">
                        <div className="flex h-[66px] w-[66px] flex-shrink-0 items-center justify-center rounded-full border border-white/70">
                          <Image
                            src="https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/home/how-it-work/step-icon-dietitian-assessment-v2.png"
                            alt="Dietitian assessment call icon"
                            width={31}
                            height={31}
                            className="h-[31px] w-[31px] object-contain"
                            loading="lazy"
                          />
                        </div>

                        <div className="pt-1">
                          <h3 className="text-[15px] font-semibold leading-[1.35] text-white">
                            Dietitian Assessment Call
                          </h3>
                          <p className="mt-1.5 text-[12px] leading-[1.45] text-white/90">
                            Your assigned dietitian speaks with you to
                            understand your lifestyle, food choices and health
                            goals before planning your diet.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mobile Step 4 */}
                  <div className="relative pl-10">
                    <div className="absolute left-0 top-[30px] z-[2] flex h-[26px] w-[26px] items-center justify-center rounded-full bg-[#FF850B] text-[12px] font-semibold text-white">
                      4
                    </div>

                    <div className="rounded-[18px] bg-[rgba(255,255,255,0.10)] px-3 py-4 shadow-[0_8px_16px_rgba(0,0,0,0.16)] ring-1 ring-white/5">
                      <div className="flex items-start gap-3">
                        <div className="flex h-[66px] w-[66px] flex-shrink-0 items-center justify-center rounded-full border border-white/70">
                          <Image
                            src="https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/home/how-it-work/step-icon-plan-delivery-v2.png"
                            alt="Personalised plan delivery icon"
                            width={31}
                            height={31}
                            className="h-[31px] w-[31px] object-contain"
                            loading="lazy"
                          />
                        </div>

                        <div className="pt-1">
                          <h3 className="text-[15px] font-semibold leading-[1.35] text-white">
                            Personalised Plan Delivery
                          </h3>
                          <p className="mt-1.5 text-[12px] leading-[1.45] text-white/90">
                            Your customised diet plan is shared on OUR APP
                            within 24 hours of the assessment.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mobile Step 5 */}
                  <div className="relative pl-10">
                    <div className="absolute left-0 top-[30px] z-[2] flex h-[26px] w-[26px] items-center justify-center rounded-full bg-[#FF850B] text-[12px] font-semibold text-white">
                      5
                    </div>

                    <div className="rounded-[18px] bg-[rgba(255,255,255,0.10)] px-3 py-4 shadow-[0_8px_16px_rgba(0,0,0,0.16)] ring-1 ring-white/5">
                      <div className="flex items-start gap-3">
                        <div className="flex h-[66px] w-[66px] flex-shrink-0 items-center justify-center rounded-full border border-white/70">
                          <Image
                            src="https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/home/how-it-work/step-icon-followups-tracking-v2.png"
                            alt="Follow-ups and tracking icon"
                            width={31}
                            height={31}
                            className="h-[31px] w-[31px] object-contain"
                            loading="lazy"
                          />
                        </div>

                        <div className="pt-1">
                          <h3 className="text-[15px] font-semibold leading-[1.35] text-white">
                            Follow-Ups &amp; Tracking
                          </h3>
                          <p className="mt-1.5 text-[12px] leading-[1.45] text-white/90">
                            Weekly or requirement-based follow-ups to track
                            progress and make timely adjustments.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* mobile appointment */}
                <div className="mt-6 rounded-[18px] border border-white/60 bg-[linear-gradient(180deg,#0f6767_0%,#0d5555_100%)] p-[1px]">
                  <div className="rounded-[17px] bg-white p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[#FF850B] text-[13px] leading-none">✦</span>
                      <span className="text-[13px] font-semibold text-[#014E4E]">
                        Our Testimonials
                      </span>
                    </div>

                    <h3 className="text-[26px] font-bold leading-[1.05] tracking-[-0.02em] text-[#FF850B]">
                      Make appointment
                    </h3>

                    <p className="mt-3 text-[13px] leading-[1.6] text-[#6F6F72]">
                      Easy scheduling for a personalized health coaching
                      session. Take the first step towards better health today!
                    </p>

                    <div className="mt-4 overflow-hidden rounded-[18px]">
                      <Image
                        src="https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c6f2a14dfc9fbf5ad5ec.jpg"
                        alt="Dietitian consultation"
                        width={350}
                        height={210}
                        className="object-cover w-full h-auto"
                        loading="lazy"
                        sizes="(max-width: 767px) 100vw, 350px"
                        quality={75}
                      />
                    </div>

                    <form className="mt-5 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="First Name"
                          className="h-[48px] w-full rounded-[10px] border border-[#E8E8E8] bg-white px-4 text-[13px] text-[#8B8B8E] outline-none placeholder:text-[#8B8B8E]"
                        />
                        <input
                          type="text"
                          placeholder="Last Name"
                          className="h-[48px] w-full rounded-[10px] border border-[#E8E8E8] bg-white px-4 text-[13px] text-[#8B8B8E] outline-none placeholder:text-[#8B8B8E]"
                        />
                      </div>

                      <input
                        type="email"
                        placeholder="Email Address"
                        className="h-[48px] w-full rounded-[10px] border border-[#E8E8E8] bg-white px-4 text-[13px] text-[#8B8B8E] outline-none placeholder:text-[#8B8B8E]"
                      />

                      <input
                        type="tel"
                        placeholder="Phone Number"
                        className="h-[48px] w-full rounded-[10px] border border-[#E8E8E8] bg-white px-4 text-[13px] text-[#8B8B8E] outline-none placeholder:text-[#8B8B8E]"
                      />

                      <div className="grid grid-cols-2 gap-3">
                        <div className="relative">
                          <select className="h-[48px] w-full appearance-none rounded-[10px] border border-[#E8E8E8] bg-white px-4 text-[13px] text-[#8B8B8E] outline-none">
                            <option>Service</option>
                            <option>Weight Management</option>
                            <option>PCOD/PCOS</option>
                            <option>Therapeutic Diet</option>
                            <option>Wedding Program</option>
                          </select>
                          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#343A40]">
                            <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden="true">
                              <path
                                d="M2 3L7 8L12 3"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </span>
                        </div>

                        <input
                          type="date"
                          className="h-[48px] w-full rounded-[10px] border border-[#E8E8E8] bg-white px-4 text-[13px] text-[#8B8B8E] outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="mt-2 inline-flex h-[46px] min-w-[155px] items-center justify-center rounded-full bg-[#FF850B] px-6 text-[14px] font-bold text-white"
                      >
                        Book An Appointment
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* FAQ Section */}
      <div className="section-wrapper">
        <FAQSection />
      </div>

      {/* Our Blogs Section */}
      <div className="section-wrapper-blog">
        <OurBlogsSection />
      </div>

      {/* Testimonials Section */}
      <div className="section-wrapper">
        <section className="bg-[#f0f4f8] py-12 md:py-20 px-4 md:px-8 rounded-[30px]">
          <div className="max-w-[1200px] mx-auto">

            {/* Mobile Layout */}
            <div className="block lg:hidden">
              {/* Single image at top for mobile */}
              <div className="relative mb-6">
                <div className="w-full rounded-[16px] overflow-hidden bg-gray-200">
                  <Image
                    src="/images/threetesti.png"
                    alt="Testimonials"
                    width={1200}
                    height={800}
                    className="object-contain w-full h-auto"
                    loading="lazy"
                    sizes="100vw"
                    quality={80}
                    placeholder="empty"
                    unoptimized
                  />
                </div>
              </div>

              {/* Header for mobile */}
              <div className="mb-5 text-left">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[#ff9100] text-lg">✦</span>
                  <span className="text-sm font-semibold text-teal-600">Our Testimonials</span>
                </div>
                <h2 className="text-[1.4rem] font-bold text-gray-900 leading-tight">
                  Success stories from our clients
                </h2>
              </div>

              {/* Testimonial Cards for mobile - carousel */}
              <div className="flex gap-3 pb-1 overflow-x-auto snap-x snap-mandatory scrollbar-hide">
                <div className="snap-start shrink-0 w-[86%] rounded-[16px] p-4 bg-[#ff9100] text-white">
                  <p className="text-[0.8rem] leading-relaxed mb-3 italic">
                    &ldquo;I am extremely happy and satisfied with my experience with Dietitian. Just 1 month, I lost 3 kg! I am genuinely thrilled with the results.&rdquo;
                  </p>
                  <div className="flex items-center gap-2 pt-2 border-t border-white/20">
                    <div className="flex items-center justify-center w-8 h-8 text-sm font-bold text-white rounded-full bg-white/20">R</div>
                    <div>
                      <div className="text-sm font-bold text-white">Rekha Rajput</div>
                      <div className="text-[0.7rem] text-white/70">Client</div>
                    </div>
                  </div>
                </div>

                <div className="snap-start shrink-0 w-[86%] rounded-[16px] p-4 bg-white shadow-md">
                  <p className="text-[0.8rem] leading-relaxed mb-3 italic text-gray-600">
                    &ldquo;Great experience with DTPS team. In 3 months, I achieved noticeable weight loss approx 7kgs and 2 inches reduced in upper body.&rdquo;
                  </p>
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                    <div className="flex items-center justify-center w-8 h-8 text-sm font-bold text-white bg-teal-600 rounded-full">C</div>
                    <div>
                      <div className="text-sm font-bold text-gray-900">Chanchal Agrawal</div>
                      <div className="text-[0.7rem] text-gray-500">Client</div>
                    </div>
                  </div>
                </div>

                <div className="snap-start shrink-0 w-[86%] rounded-[16px] p-4 bg-white shadow-md">
                  <p className="text-[0.8rem] leading-relaxed mb-3 italic text-gray-600">
                    &ldquo;My weight and inch loss journey has been very encouraging. I have noticed a clear difference in my body measurements, especially around my waist and hips.&rdquo;
                  </p>
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                    <div className="flex items-center justify-center w-8 h-8 text-sm font-bold text-white bg-teal-600 rounded-full">S</div>
                    <div>
                      <div className="text-sm font-bold text-gray-900">Swati Sharma</div>
                      <div className="text-[0.7rem] text-gray-500">Client</div>
                    </div>
                  </div>
                </div>

                <div className="snap-start shrink-0 w-[86%] rounded-[16px] p-4 bg-white shadow-md">
                  <p className="text-[0.8rem] leading-relaxed mb-3 italic text-gray-600">
                    &ldquo;The personalized diet plan worked wonders for me. Lost 5kg in 2 months with proper guidance and support from the team.&rdquo;
                  </p>
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                    <div className="flex items-center justify-center w-8 h-8 text-sm font-bold text-white bg-teal-600 rounded-full">P</div>
                    <div>
                      <div className="text-sm font-bold text-gray-900">Priya Verma</div>
                      <div className="text-[0.7rem] text-gray-500">Client</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="items-start hidden gap-10 lg:flex">
              {/* Left - Header and Testimonial Cards */}
              <div className="flex-1 max-w-[520px]">
                {/* Header */}
                <div className="mb-8 text-left">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[#ff9100] text-xl">✦</span>
                    <span className="text-base font-semibold text-teal-600">Our Testimonials</span>
                  </div>
                  <h2 className="text-[2.2rem] font-bold text-gray-900 leading-tight">
                    Success stories from our clients
                  </h2>
                </div>

                {/* Testimonial Cards Grid - 2 columns, 2 rows */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Card 1 - Highlighted */}
                  <div className="rounded-[16px] p-5 bg-[#ff9100] text-white shadow-[0_10px_30px_rgba(255,145,0,0.25)]">
                    <p className="text-[0.82rem] leading-relaxed mb-4 italic text-white">
                      &ldquo;I am extremely happy and satisfied with my experience with Dietitian. Just 1 month, I lost 3 kg! I am genuinely thrilled with the results.&rdquo;
                    </p>
                    <div className="flex items-center gap-3 pt-3 border-t border-white/20">
                      <div className="flex items-center justify-center text-base font-bold text-white rounded-full w-9 h-9 bg-white/20">R</div>
                      <div>
                        <div className="text-sm font-bold text-white">Rekha Rajput</div>
                        <div className="text-[0.72rem] text-white/70">Client</div>
                      </div>
                    </div>
                  </div>

                  {/* Card 2 */}
                  <div className="rounded-[16px] p-5 bg-white shadow-md">
                    <p className="text-[0.82rem] leading-relaxed mb-4 italic text-gray-600">
                      &ldquo;Great experience with DTPS team. In 3 months, I achieved noticeable weight loss approx 7kgs and 2 inches reduced in upper body.&rdquo;
                    </p>
                    <div className="flex items-center gap-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-center text-base font-bold text-white bg-teal-600 rounded-full w-9 h-9">C</div>
                      <div>
                        <div className="text-sm font-bold text-gray-900">Chanchal Agrawal</div>
                        <div className="text-[0.72rem] text-gray-500">Client</div>
                      </div>
                    </div>
                  </div>

                  {/* Card 3 */}
                  <div className="rounded-[16px] p-5 bg-white shadow-md">
                    <p className="text-[0.82rem] leading-relaxed mb-4 italic text-gray-600">
                      &ldquo;My weight and inch loss journey has been very encouraging. I have noticed a clear difference in my body measurements, especially around my waist and hips.&rdquo;
                    </p>
                    <div className="flex items-center gap-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-center text-base font-bold text-white bg-teal-600 rounded-full w-9 h-9">S</div>
                      <div>
                        <div className="text-sm font-bold text-gray-900">Swati Sharma</div>
                        <div className="text-[0.72rem] text-gray-500">Client</div>
                      </div>
                    </div>
                  </div>

                  {/* Card 4 - Additional */}
                  <div className="rounded-[16px] p-5 bg-white shadow-md">
                    <p className="text-[0.82rem] leading-relaxed mb-4 italic text-gray-600">
                      &ldquo;The personalized diet plan worked wonders for me. Lost 5kg in 2 months with proper guidance and support from the team.&rdquo;
                    </p>
                    <div className="flex items-center gap-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-center text-base font-bold text-white bg-teal-600 rounded-full w-9 h-9">P</div>
                      <div>
                        <div className="text-sm font-bold text-gray-900">Priya Verma</div>
                        <div className="text-[0.72rem] text-gray-500">Client</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right - Single testimonial image */}
              <div className="flex items-center justify-center flex-1">
                <div className="w-full max-w-[520px] rounded-[20px] overflow-hidden bg-gray-200">
                  <Image
                    src="/images/threetesti.png"
                    alt="Testimonials"
                    width={1200}
                    height={800}
                    className="object-contain w-full h-auto"
                    loading="lazy"
                    sizes="(min-width: 1024px) 520px, 100vw"
                    quality={80}
                    placeholder="empty"
                    unoptimized
                  />
                </div>
              </div>
            </div>

          </div>
        </section>
      </div>
    </div>
  );
}
// Removed local fallback implementations of useState/useEffect — using React's useState and useEffect imported above.
