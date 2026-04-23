"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, type MouseEvent } from "react";
import Navbar from "@/components/Navbar";
import LoseWeightSection from "@/components/LoseWeightSection";
import DynamicPlansDisplay from "@/components/DynamicPlansDisplay";
import { getPricingByCategory } from "@/lib/api";
import type { Pricing } from "@/lib/api";
import TransformationGallery from "@/components/TransformationGallery";
import TestimonialSliderSection from "@/components/TestimonialSliderSection";
import ExpertGuidanceSection from "@/components/ExpertGuidanceSection";

// Tab data for "What Happens" section
type WeddingTabKey = "brides" | "grooms" | "couples" | "family";

type WeddingTabConfig = {
  label: string;
  tabVector: string;
  image: string;
  benefits: string[];
};

const weddingTabOrder: WeddingTabKey[] = ["brides", "grooms", "couples", "family"];

const benefitIcons = [
  "/images/Frame%20126.png",
  "/images/Frame%20127.png",
  "/images/Frame%20128.png",
  "/images/Frame%20130.png",
  "/images/Frame%20129.png",
] as const;

function SectionTitle({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <h2
      className={`text-[28px] md:text-[36px] lg:text-[46px] font-extrabold leading-[1.12] ${className}`}
      style={{ fontFamily: 'var(--font-epilogue), Epilogue, sans-serif' }}
    >
      {children}
    </h2>
  );
}

const tabsData: Record<WeddingTabKey, WeddingTabConfig> = {
  brides: {
    label: "Brides",
    tabVector: "/images/Bride-Vector.png",
    image: "https://ik.imagekit.io/br0mssyqj/DTPS-Ecommerce/static/home/wedding/Bride.png",
    benefits: [
      "You'll drop those extra inches with real, home-cooked food.",
      "Skin looks clearer and naturally glowing.",
      "Hair feels stronger and healthier from within.",
      "Energy stays consistent through long functions.",
      "You feel fresh, light, and comfortable in your outfits.",
    ],
  },
  grooms: {
    label: "Grooms",
    tabVector: "/images/Groom-Vector.png",
    image: "/images/Groom.png",
    benefits: [
      "Better sherwani fit and confident posture.",
      "Sharper jawline and reduced puffiness.",
      "Stamina improves during busy wedding days.",
      "Better digestion with clean meals.",
      "You look naturally sharp in pictures.",
    ],
  },
  couples: {
    label: "Couples",
    tabVector: "/images/Couples-Vector.png",
    image: "/images/Couple.png",
    benefits: [
      "Both partners feel fit & confident.",
      "Shared food routine improves bonding.",
      "Glow shows naturally in wedding photos.",
      "No starving — full satisfying meals.",
      "You look and feel great together.",
    ],
  },
  family: {
    label: "Family",
    tabVector: "/images/Family-Vector.png",
    image: "/images/Family.png",
    benefits: [
      "Stay light and comfortable through events.",
      "Better digestion reduces bloating.",
      "Skin looks naturally bright in pictures.",
      "Energy stays stable throughout functions.",
      "Feel confident and fresh in outfits.",
    ],
  },
};

const pricingPlansFallback = [
  {
    duration: "10 Days Trial",
    badge: "LIMITED OFFER!",
    price: "₹399",
    originalPrice: "₹999",
    features: [
      "Pre-Wedding Detox Plan",
      "Visible Inch loss",
      { text: "Skin & hair Care Diets", crossed: true },
      { text: "Anemia Treatment", crossed: true },
      "Easy Workouts",
      "8hrs/day Availability",
      "Dietitian Consultation (3)",
      "Customised Diet Plan",
      "20+ Diet Recipe E Book",
      "Weekly Check-ins",
    ],
    timeline: "quick debloat & routine kickstart",
  },
  {
    duration: "01 Month",
    badge: "Most Popular",
    price: "₹4999",
    originalPrice: "₹6000",
    features: [
      "Pre-Wedding Detox Plan",
      "Visible Inch loss",
      { text: "Skin & hair Care Diets", crossed: true },
      "Anemia Treatment",
      "Easy Workouts",
      "8hrs/day Availability",
      "Dietitian Consultation (12)",
      "Customised Diet Plan",
      "50+ Diet Recipe E Book",
      "Weekly Check-ins",
    ],
    timeline: "fast inch loss for outfits",
  },
  {
    duration: "03 Months",
    badge: "Premium",
    price: "₹7999",
    originalPrice: "₹11000",
    features: [
      "Pre-Wedding Detox Plan",
      "Visible Inch loss",
      "Skin & hair Care Diets",
      "Anemia Treatment",
      "Easy Workouts",
      "8hrs/day Availability",
      "Dietitian Consultation (18)",
      "Customised Diet Plan",
      "100+ Diet Recipe E Book",
      "Weekly Check-ins",
    ],
    timeline: "deeper fat loss + glow rebuild",
  },
  {
    duration: "06 Months",
    badge: "Most Effective",
    price: "₹11000",
    originalPrice: "₹15000",
    features: [
      "Pre-Wedding Detox Plan",
      "Visible Inch loss",
      "Skin & hair Care Diets",
      "Anemia Treatment",
      "Easy Workouts",
      "8hrs/day Availability",
      "Customised Diet Plan",
      "Dietitian Consultation upto(20)",
      "150+ Diet Recipe E Book",
      "Weekly Check-ins",
    ],
    timeline: "long-term change + maintenance",
  },
];

const awards = [
  {
    image:
      "https://staging.dtpoonamsagar.com/wp-content/uploads/2025/03/image-27.webp",
    title: "News 18 Narayani Namah Award",
  },
  {
    image:
      "https://staging.dtpoonamsagar.com/wp-content/uploads/2025/03/image-24-1.webp",
    title: "Dainik Bhaskar Women Entrepreneur Award",
  },
  {
    image:
      "https://staging.dtpoonamsagar.com/wp-content/uploads/2025/03/0010-600x450-1.webp",
    title: "Iconic Business Women (Health & Nutrition) Award 2024",
  },
];

const noPushItems = [
  {
    icon: "/images/no_meals.png",
    alt: "No meals",
    text: "Crash diets. Starvation.",
  },
  {
    icon: "/images/pill.png",
    alt: "Pill",
    text: "Glutathione. Fat-burner pills. Detox teas.",
  },
  {
    icon: "/images/cardio_load.png",
    alt: "Cardio load",
    text: "Heavy gym plans if you do not want them.",
  },
  {
    icon: "/images/fluent_bowl-salad-24-regular.png",
    alt: "Fad salad",
    text: "Fad expensive salad or juice-only diet.",
  },
];

export default function WeddingPlanPage() {
  const [activeTab, setActiveTab] = useState<WeddingTabKey>("brides");
  const [arrowTab, setArrowTab] = useState<WeddingTabKey>("brides");
  const [isArrowVisible, setIsArrowVisible] = useState(true);
  const [pricingPlans, setPricingPlans] = useState<any[]>(pricingPlansFallback);
  const [loadingPricing, setLoadingPricing] = useState(true);

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const dbPricing = await getPricingByCategory("new-wedding-plan");

        if (dbPricing && dbPricing.length > 0) {
          const formattedPricing = dbPricing.map((plan: Pricing) => ({
            duration: plan.duration,
            badge: plan.badge,
            price: `₹${plan.price}`,
            originalPrice: `₹${plan.originalPrice}`,
            features: plan.features.map((f) => f.text),
            timeline: plan.durationLabel,
          }));

          setPricingPlans(formattedPricing);
        }
      } catch (error) {
        console.error("Error fetching pricing:", error);
        setPricingPlans(pricingPlansFallback);
      } finally {
        setLoadingPricing(false);
      }
    };

    fetchPricing();
  }, []);

  useEffect(() => {
    if (activeTab === arrowTab) {
      return;
    }

    setIsArrowVisible(false);

    const timeoutId = window.setTimeout(() => {
      setArrowTab(activeTab);
      setIsArrowVisible(true);
    }, 140);

    return () => window.clearTimeout(timeoutId);
  }, [activeTab, arrowTab]);

  const activeTabData = tabsData[activeTab];
  const arrowTabIndex = weddingTabOrder.indexOf(arrowTab);
  const connectorLeft = `${((arrowTabIndex + 0.5) / weddingTabOrder.length) * 100}%`;

  const suppressMouseFocus = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  return (
    <main className="bg-white">
      {/* Hero Section with Navbar */}
      <section className="hero-section site-shell pt-4 md:pt-[60px]">
        <div className="bg-[#014E4E] rounded-3xl overflow-hidden w-full relative h-[765px] md:h-[738px]">
          {/* Background Image */}
          <Image
            src="https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c727a14dfc9fbf5ad706.jpg"
            alt="Wedding couple"
            fill
            priority
            className="object-cover"
            sizes="100vw"
            quality={80}
          />

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-[rgba(78,1,1,0.12)] to-[rgba(78,1,1,0.9)]" />

          <div className="relative z-10 flex h-full w-full flex-col">
            {/* Navbar */}
            <Navbar />

            {/* Mobile Layout */}
            <div className="flex w-full flex-1 flex-col items-center justify-end px-6 pb-10 text-center md:hidden">
              <div className="max-w-[360px]">
                <p className="text-[1.6rem] font-extrabold leading-[1.02] tracking-[-0.03em] text-white">
                  India&apos;s Only
                </p>
                <p className="mt-1 text-[2.45rem] font-extrabold leading-[0.94] tracking-[-0.045em] text-[#FF850B]">
                  Ghar Ka Khana
                </p>
                <p className="mt-2 text-[1.6rem] font-extrabold leading-[1.06] tracking-[-0.03em] text-white">
                  Diet Plan That Gets You
                </p>
                <p className="mt-1 text-[1.6rem] font-extrabold leading-[1.06] tracking-[-0.03em] text-white">
                  Wedding-Ready.
                </p>
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden md:flex w-full flex-1 flex-col items-center justify-end mb-12  px-6 text-center lg:px-8">
              <h1 className="text-[2.5rem] lg:text-[3rem] xl:text-[3.5rem] font-bold text-white leading-[1.2]">
                <span className="block">India&apos;s Only</span>
                <span className="block"><span className="text-[#FF850B]">&ldquo;Ghar Ka Khana&rdquo;</span> Diet Plan</span>
                <span className="block">That Gets You <span className="">Wedding-Ready.</span></span>
              </h1>

              <p className="text-white/80 text-[18px] leading-[1.7] mb-8 max-w-[580px]">
                Because you shouldn&apos;t have to suffer to look beautiful.
              </p>

              {/* Button */}
              <Link
                href="#plans-section"
                className="bg-[#FF850B] hover:bg-[#E57A09] text-white font-semibold py-3.5 px-10 rounded-full text-base transition-colors"
              >
                Buy Wedding Plan Now
              </Link>
            </div>
          </div>
        </div>
      </section>
      {/* Wedding Transformations Section */}
      <TestimonialSliderSection
        page="wedding"
        maxItems={6}
        header={
          <div className="text-center md:text-left">
            <h2 className="mb-2.5 text-2xl font-bold leading-tight text-black md:text-5xl">
              Lose <span className="text-[#FF850B]">5-7 Kilos</span> in just 30 Days
            </h2>
            <h2 className="mb-2.5 text-2xl font-bold leading-tight text-black md:text-5xl">
              &amp; Still Eat the Food You Love!
            </h2>
          </div>
        }
      />
      {/* What Happens When You Start Section */}
      <section className="site-shell bg-white py-12">
        <div className="site-fill">
          <h2
            className="mb-8 hidden text-center text-2xl font-bold text-black  md:mb-16 md:block md:text-5xl"
            style={{ fontFamily: 'var(--font-epilogue), Epilogue, sans-serif' }}
          >
            What Happens
            <span className="mt-6 block">
              When You Start the <span className="text-[#ff850b]">DTPS Wedding Plan</span>
            </span>
          </h2>

          <h2
            className="mb-6 text-center text-[32px] font-bold leading-[1.125] text-[#1E1E1E] md:hidden"
            style={{ fontFamily: 'var(--font-epilogue), Epilogue, sans-serif' }}
          >
            What Happens
            <br />
            When You Start the
            <br />
            <span className="text-[#FF850B]">DTPS Wedding Plan</span>
          </h2>

          {/* Desktop Tabs */}
          <div className="relative mb-7 hidden md:block">
            <div className="grid grid-cols-4 gap-5 xl:gap-0">
              {weddingTabOrder.map((tabKey) => {
                const tab = tabsData[tabKey];
                const isActive = activeTab === tabKey;

                return (
                  <button
                    key={tabKey}
                    type="button"
                    onMouseDown={suppressMouseFocus}
                    onClick={() => setActiveTab(tabKey)}
                    aria-pressed={isActive}
                    className={`relative mx-auto h-60 w-[220px] appearance-none overflow-hidden rounded-[30px] border-0 bg-transparent p-0 outline-none ring-0 shadow-none transition-all duration-500 ease-out focus:outline-none focus:ring-0 focus:shadow-none focus-visible:outline-none focus-visible:ring-0 focus-visible:shadow-none active:outline-none active:ring-0 active:shadow-none ${isActive
                      ? "-translate-y-1 scale-[1.04]"
                      : "hover:-translate-y-1"
                      }`}
                    style={{ WebkitTapHighlightColor: "transparent" }}
                  >
                    <div
                      className={`absolute bottom-0 left-0 h-[150px] w-full rounded-[30px] transition-colors duration-500 ${isActive ? "bg-[#ff850b]" : "bg-[#620909]"
                        }`}
                    ></div>
                    <div
                      className={`absolute bottom-0 left-0 h-[150px] w-full rounded-[30px] bg-gradient-to-b from-transparent via-transparent transition-opacity duration-500 ${isActive
                        ? "to-[rgba(255,133,11,0.58)]"
                        : "to-[rgba(78,1,1,0.8)]"
                        }`}
                    ></div>
                    <div className="absolute inset-x-0 bottom-0 h-60 w-full">
                      <Image
                        src={tab.tabVector}
                        alt={tab.label}
                        fill
                        loading="lazy"
                        sizes="220px"
                        className="object-contain object-bottom"
                      />
                    </div>
                    <span
                      className={`absolute inset-x-0 bottom-4 text-center text-[18px] font-semibold text-white transition duration-500 lg:text-[20px] ${isActive
                        ? "drop-shadow-[0_2px_12px_rgba(255,133,11,0.45)]"
                        : ""
                        }`}
                    >
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="pointer-events-none absolute inset-x-0 -bottom-8 h-[45px]">
              <div
                className={`absolute top-0 transition-opacity duration-150 ease-out ${isArrowVisible ? "opacity-100" : "opacity-0"
                  }`}
                style={{ left: `calc(${connectorLeft} - 25px)` }}
              >
                <Image
                  src="/images/Arrow-vector.png"
                  alt=""
                  width={25}
                  height={45}
                  className="h-[45px] w-[25px]"
                />
              </div>
            </div>
          </div>



          {/* Tab Content Card - Desktop */}
          <div className="hidden min-h-[467px] w-full overflow-hidden rounded-[32px] bg-[#4e0101] md:block">
            <div className="relative min-h-[467px] w-full">
              <div className="absolute inset-y-0 left-[84px] w-[150px] bg-[#ff850b]"></div>

              <Image
                key={activeTab}
                src={activeTabData.image}
                alt={activeTabData.label}
                width={410}
                height={459}
                className="absolute bottom-0 left-[60px] h-auto w-[360px] object-contain"
                loading="lazy"
                sizes="360px"
                quality={75}
              />

              <div className="absolute left-[430px] top-1/2 flex w-[calc(100%-470px)] -translate-y-1/2 flex-col gap-6 pr-12">
                {activeTabData.benefits.map((benefit, index) => (
                  <div key={`${activeTab}-${index}`} className="flex items-start gap-4">
                    <Image
                      src={benefitIcons[index] ?? benefitIcons[benefitIcons.length - 1]}
                      alt=""
                      width={32}
                      height={32}
                      loading="lazy"
                      className="mt-0.5 h-8 w-8 shrink-0 object-contain"
                    />
                    <p className="text-[17px] font-semibold leading-[1.45] text-white lg:text-[18px]">
                      {benefit}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tab Content - Mobile */}
          <div className="mx-auto flex max-w-[355px] flex-col gap-6 md:hidden">
            <div className="relative h-[467px] w-full overflow-hidden rounded-[24px] bg-[#4E0101]">
              <div className="absolute inset-y-0 left-1/2 w-[180px] -translate-x-1/2 bg-[#FF850B]" />
              <div className="absolute inset-0">
                <Image
                  src={activeTabData.image}
                  alt={activeTabData.label}
                  fill
                  className="h-full w-full object-cover"
                  loading="lazy"
                  sizes="(max-width: 767px) 100vw, 355px"
                  quality={75}
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {weddingTabOrder.map((tab) => {
                const isActive = activeTab === tab;

                return (
                  <button
                    key={tab}
                    type="button"
                    onMouseDown={suppressMouseFocus}
                    onClick={() => setActiveTab(tab)}
                    style={{ WebkitTapHighlightColor: "transparent" }}
                    className={`flex items-center justify-center rounded-[12px] px-3 py-[14px] text-center text-[16px] font-semibold leading-none text-white transition-colors ${isActive ? "bg-[#FF850B]" : "bg-[#4E0101]"
                      }`}
                  >
                    {tabsData[tab].label}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col gap-2">
              {activeTabData.benefits.map((benefit, index) => {
                const isPrimary = index === 0;

                return (
                  <div
                    key={`${activeTab}-${index}`}
                    className={`flex items-center gap-3 rounded-[14px] border border-[#FF850B] px-3 py-3 ${isPrimary ? "bg-[#FF850B]" : "bg-white"
                      }`}
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] ${isPrimary ? "bg-white" : "bg-transparent"
                        }`}
                    >
                      <Image
                        src={benefitIcons[index] ?? benefitIcons[benefitIcons.length - 1]}
                        alt=""
                        width={32}
                        height={32}
                        loading="lazy"
                        className="h-8 w-8 object-contain"
                      />
                    </div>
                    <p
                      className={`flex-1 text-[14px] font-medium leading-[1.15] ${isPrimary ? "text-white" : "text-black"
                        }`}
                      style={{ fontFamily: 'var(--font-epilogue), Epilogue, sans-serif' }}
                    >
                      {benefit}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ================= MOBILE ONLY SVG ================= */}

      <section className="block md:hidden w-full">

        <Image
          src="https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/home/wedding/section-29-1776941173451.jpg"
          alt="Five Cycle Program"
          width={420}
          height={700}
          className="w-full h-auto"
          loading="lazy"
          sizes="100vw"
        />

      </section>



      {/* ================= DESKTOP VERSION ================= */}
      <section className="site-shell hidden bg-white py-20 md:block">
        <div className="site-fill rounded-[28px] overflow-hidden">
          <Image
            src="https://ik.imagekit.io/br0mssyqj/DTPS-Ecommerce/static/home/wedding/section-29-1776941173451.jpg"
            alt="Our Five-Cycle Program"
            width={1200}
            height={700}
            className="w-full h-auto"
            loading="lazy"
            sizes="(max-width: 1200px) 100vw, 1200px"
          />
        </div>
      </section>


      {/* We Do Not Push Section */}
      <section className="site-shell bg-white py-14 md:py-20">

        <div className="site-fill px-5 md:px-0">
          <div className="overflow-hidden rounded-[30px] bg-[#EAEEF1] md:px-12 md:pt-12 md:pb-0">

            <div className="px-[10px] pb-4 md:hidden">
              <div className="flex flex-col items-center gap-6">
                <div className="relative h-[416px] w-full max-w-[315px] overflow-hidden rounded-[16px] bg-[linear-gradient(180deg,#EAEEF1_0%,#FFFFFF_100%)]">
                  <div className="absolute left-[52px] top-0 h-full w-[137px] bg-[#FF850B]" />
                  <Image
                    src="/images/edit%201.png"
                    alt="Bride"
                    width={228}
                    height={416}
                    className="absolute left-[75px] top-0 h-[416px] w-auto max-w-none object-contain"
                    loading="lazy"
                    sizes="228px"
                    quality={75}
                  />
                </div>

                <div className="flex w-full flex-col items-center gap-8">
                  <h2
                    className="text-center text-[32px] font-bold leading-[1.1] text-[#1E1E1E]"
                    style={{ fontFamily: 'var(--font-epilogue), Epilogue, sans-serif' }}
                  >
                    We Do Not Push
                  </h2>

                  <div className="flex w-full flex-col gap-4 px-2">
                    {noPushItems.map((item) => (
                      <div key={item.text} className="rounded-[16px] bg-[#4E0101] p-2">
                        <div className="flex items-center gap-3">
                          <div className="flex h-[100px] w-[100px] shrink-0 items-center justify-center overflow-hidden rounded-[12px] bg-[#FF850B]">
                            <Image
                              src={item.icon}
                              alt={item.alt}
                              width={56}
                              height={56}
                              className="h-[56px] w-[56px] object-contain"
                              loading="lazy"
                            />
                          </div>
                          <p
                            className="flex-1 text-[20px] font-semibold leading-[1.08] text-white"
                            style={{ fontFamily: 'var(--font-epilogue), Epilogue, sans-serif' }}
                          >
                            {item.text}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="hidden md:grid md:grid-cols-2 md:items-center md:gap-10">

              {/* LEFT IMAGE */}
              <div className="flex justify-center md:justify-start">
                <div className="relative h-[620px] w-[320px] rounded-[22px] md:h-[700px] md:w-[500px]">
                  <div className="absolute bottom-0 top-[-24px] left-1/4 w-[130px] -translate-x-1/2 bg-[#ff850b] md:left-[8px] md:top-[-48px] md:w-[150px] md:translate-x-0"></div>
                  <Image
                    src="/images/edit%201.png"
                    alt="Bride"
                    width={500}
                    height={660}
                    className="absolute left-1/2 top-0 h-full w-auto -translate-x-1/2"
                    loading="lazy"
                    sizes="(max-width: 767px) 320px, 500px"
                    quality={75}
                  />
                </div>
              </div>

              {/* RIGHT SIDE */}
              <div>
                <h2 className="mb-8 text-3xl font-bold text-[#333] md:text-5xl">
                  We Do Not Push
                </h2>

                <div className="flex flex-col gap-6">
                  {noPushItems.map((item) => (
                    <div key={item.text} className="flex items-center gap-5 rounded-2xl bg-[#FF850B] p-4 md:p-5">
                      <div className="flex items-center justify-center rounded-xl bg-[#E7E7E7] p-3">
                        <Image
                          src={item.icon}
                          alt={item.alt}
                          width={40}
                          height={40}
                          loading="lazy"
                          className="h-10 w-10 object-contain"
                        />
                      </div>

                      <p className="text-base font-semibold text-white md:text-lg">
                        {item.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </div>

      </section>

      {/* 100% Personalised Ghar Ka Khana Section */}
      <section className="site-shell bg-white py-14 md:py-20">
        <div className="site-fill">
          <div className="bg-[#4E0101] rounded-[24px] md:rounded-[30px] px-6 py-10 md:px-16 md:py-14">

            {/* Heading */}
            <h2 className="text-center text-[22px] md:text-[42px] font-extrabold text-white leading-tight mb-8 md:mb-14">
              100% Personalised<br />
              <span className="text-[#FF850B]">GHAR KA KHANA</span> Diet Plan
            </h2>

            {/* Desktop: 3 Icons Row */}
            <div className="hidden md:flex items-start justify-center gap-16 mb-14">
              <div className="flex flex-col items-center gap-4">

                <div className="w-[90px] h-[90px] bg-white rounded-full flex items-center justify-center shadow-lg ring-2 ring-[#B22222] ring-offset-4 ring-offset-[#4E0101]">
                  <Image src="https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c66fa14dfc9fbf5ad4f6.jpg" alt="Fully Customised Diet Plan" width={44} height={44} loading="lazy" />
                </div>
                <p className="text-white text-base font-medium text-center leading-snug">
                  Fully Customised<br />Diet Plan
                </p>
              </div>

              <div className="flex flex-col items-center gap-4">
                <div className="w-[90px] h-[90px] bg-white rounded-full flex items-center justify-center shadow-lg ring-2 ring-[#B22222] ring-offset-4 ring-offset-[#4E0101]">
                  <Image src="https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c6e6a14dfc9fbf5ad594.jpg" alt="Shaadi-Ready Custom Diet Plan" width={44} height={44} loading="lazy" />
                </div>
                <p className="text-white text-base font-medium text-center leading-snug">
                  Shaadi-Ready<br />Custom Diet Plan
                </p>
              </div>

              <div className="flex flex-col items-center gap-4">
                <div className="w-[90px] h-[90px] bg-white rounded-full flex items-center justify-center shadow-lg ring-2 ring-[#B22222] ring-offset-4 ring-offset-[#4E0101]">
                  <Image src="https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c6b3a14dfc9fbf5ad560.jpg" alt="Medical-Aware Personalised Plan" width={44} height={44} loading="lazy" />
                </div>
                <p className="text-white text-base font-medium text-center leading-snug">
                  Medical-Aware<br />Personalised Plan
                </p>
              </div>
            </div>

            {/* Mobile: Icons with label on right */}
            <div className="flex md:hidden flex-col gap-5 mb-8 mx-auto items-center">
              <div className="flex items-center gap-4">
                <div className="w-[56px] h-[56px] min-w-[56px] bg-white rounded-full flex items-center justify-center shadow-lg ring-2 ring-[#B22222] ring-offset-4 ring-offset-[#4E0101]">
                  <Image src="https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c66fa14dfc9fbf5ad4f6.jpg" alt="Fully Customised Diet Plan" width={28} height={28} loading="lazy" />
                </div>
                <p className="text-white text-sm font-medium leading-snug">
                  Fully Customised<br />Diet Plan
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-[56px] h-[56px] min-w-[56px] bg-white rounded-full flex items-center justify-center shadow-lg ring-2 ring-[#B22222] ring-offset-4 ring-offset-[#4E0101]">
                  <Image src="https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c6e6a14dfc9fbf5ad594.jpg" alt="Shaadi-Ready Custom Diet Plan" width={28} height={28} loading="lazy" />
                </div>
                <p className="text-white text-sm font-medium leading-snug">
                  Shaadi-Ready<br />Custom Diet Plan
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-[56px] h-[56px] min-w-[56px] bg-white rounded-full flex items-center justify-center shadow-lg ring-2 ring-[#B22222] ring-offset-4 ring-offset-[#4E0101]">
                  <Image src="https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c6b3a14dfc9fbf5ad560.jpg" alt="Medical-Aware Personalised Plan" width={28} height={28} loading="lazy" />
                </div>
                <p className="text-white text-sm font-medium leading-snug">
                  Medical-Aware<br />Personalised Plan
                </p>
              </div>
            </div>

            {/* To lose weight box - Desktop */}
            <div className="hidden md:block border border-[rgba(255,255,255,0.25)] rounded-2xl px-10 py-8 mb-10 max-w-[700px] mx-auto">
              <h3 className="text-white text-2xl font-bold text-center mb-5">
                To lose weight, you don&apos;t need
              </h3>
              <div className="flex items-center justify-center gap-10">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 bg-[#E53935] rounded-lg flex items-center justify-center text-white text-sm font-bold">✕</span>
                  <span className="text-white text-base font-semibold">Heavy Exercise</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 bg-[#E53935] rounded-lg flex items-center justify-center text-white text-sm font-bold">✕</span>
                  <span className="text-white text-base font-semibold">Expensive Supplements</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 bg-[#E53935] rounded-lg flex items-center justify-center text-white text-sm font-bold">✕</span>
                  <span className="text-white text-base font-semibold">Starvation</span>
                </div>
              </div>
            </div>

            {/* To lose weight box - Mobile */}
            <div className="md:hidden border border-[rgba(255,255,255,0.25)] rounded-2xl px-5 py-6 mb-8 max-w-[280px] mx-auto">
              <h3 className="text-white text-lg font-bold text-center mb-4 leading-snug">
                To lose weight,<br />you don&apos;t need
              </h3>
              <div className="flex flex-col gap-3 pl-2">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 min-w-[24px] bg-[#E53935] rounded-md flex items-center justify-center text-white text-xs font-bold">✕</span>
                  <span className="text-white text-sm font-medium">Heavy Exercise</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 min-w-[24px] bg-[#E53935] rounded-md flex items-center justify-center text-white text-xs font-bold">✕</span>
                  <span className="text-white text-sm font-medium">Expensive Supplements</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 min-w-[24px] bg-[#E53935] rounded-md flex items-center justify-center text-white text-xs font-bold">✕</span>
                  <span className="text-white text-sm font-medium">Starvation</span>
                </div>
              </div>
            </div>

            {/* Bottom tagline */}
            <p className="text-center text-sm md:text-lg font-semibold text-white leading-relaxed">
              Sirf <span className="text-[#FF850B] font-bold">GHAR KE KHANE</span><br className="md:hidden" />
              {" "}se bhi ho sakta hai amazing<br className="md:hidden" />
              {" "}<span className="text-[#FF850B] font-bold">WEIGHT LOSS</span>!
            </p>

          </div>
        </div>
      </section>

      {/* Why People Trust DTPS Section */}
      <section className="site-shell bg-white py-14 md:py-20">
        <div className="site-fill">

          {/* Heading */}
          <h2 className="text-center text-2xl md:text-[42px] font-bold text-black leading-tight mb-8 md:mb-12">
            Why people trust <span className="text-[#FF850B]">DTPS</span>?
          </h2>

          {/* Desktop: Horizontal cards */}
          <div className="hidden md:flex flex-col items-center gap-5 w-full">
            <div className="w-full max-w-[840px] bg-[#4E0101] rounded-2xl flex items-center gap-6 px-8 py-6">
              <div className="w-[80px] h-[80px] min-w-[80px] bg-white rounded-xl flex items-center justify-center">
                <Image src="https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c716a14dfc9fbf5ad6c9.jpg" alt="Personalised" width={48} height={48} loading="lazy" />
              </div>
              <p className="text-white text-base md:text-lg font-medium leading-snug">
                Personalised plan built around<br />your taste, work hours, travel, and culture
              </p>
            </div>

            <div className="w-full max-w-[840px] bg-[#4E0101] rounded-2xl flex items-center gap-6 px-8 py-6">
              <div className="w-[80px] h-[80px] min-w-[80px] bg-white rounded-xl flex items-center justify-center">
                <Image src="https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c70fa14dfc9fbf5ad69b.jpg" alt="Medical" width={48} height={48} loading="lazy" />
              </div>
              <p className="text-white text-base md:text-lg font-medium leading-snug">
                Medical aware for PCOS, thyroid,<br />and diabetes with reports considered
              </p>
            </div>

            <div className="w-full max-w-[840px] bg-[#4E0101] rounded-2xl flex items-center gap-6 px-8 py-6">
              <div className="w-[80px] h-[80px] min-w-[80px] bg-white rounded-xl flex items-center justify-center">
                <Image src="https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c6e9a14dfc9fbf5ad5a3.jpg" alt="No supplements" width={48} height={48} loading="lazy" />
              </div>
              <p className="text-white text-base md:text-lg font-medium leading-snug">
                We don&apos;t recommend eating expensive<br />fat-burning supplements
              </p>
            </div>

            <div className="w-full max-w-[840px] bg-[#4E0101] rounded-2xl flex items-center gap-6 px-8 py-6">
              <div className="w-[80px] h-[80px] min-w-[80px] bg-white rounded-xl flex items-center justify-center">
                <Image src="https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c66fa14dfc9fbf5ad4fa.jpg" alt="No heavy workouts" width={48} height={48} loading="lazy" />
              </div>
              <p className="text-white text-base md:text-lg font-medium leading-snug">
                We don&apos;t promote any<br />heavy workouts or starvation
              </p>
            </div>
          </div>

          {/* Mobile: Stacked cards */}
          <div className="md:hidden flex flex-col gap-4">
            <div className="bg-[#4E0101] rounded-2xl flex items-center gap-4 px-5 py-5">
              <div className="w-[60px] h-[60px] min-w-[60px] bg-white rounded-xl flex items-center justify-center">
                <Image src="https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c716a14dfc9fbf5ad6c9.jpg" alt="Personalised" width={36} height={36} loading="lazy" />
              </div>
              <p className="text-white text-sm font-medium leading-snug">
                Personalised plan built around your taste, work hours, travel, and culture
              </p>
            </div>

            <div className="bg-[#4E0101] rounded-2xl flex items-center gap-4 px-5 py-5">
              <div className="w-[60px] h-[60px] min-w-[60px] bg-white rounded-xl flex items-center justify-center">
                <Image src="https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c70fa14dfc9fbf5ad69b.jpg" alt="Medical" width={36} height={36} loading="lazy" />
              </div>
              <p className="text-white text-sm font-medium leading-snug">
                Medical aware for PCOS, thyroid, and diabetes with reports considered
              </p>
            </div>

            <div className="bg-[#4E0101] rounded-2xl flex items-center gap-4 px-5 py-5">
              <div className="w-[60px] h-[60px] min-w-[60px] bg-white rounded-xl flex items-center justify-center">
                <Image src="https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c6e9a14dfc9fbf5ad5a3.jpg" alt="No supplements" width={36} height={36} loading="lazy" />
              </div>
              <p className="text-white text-sm font-medium leading-snug">
                We don&apos;t recommend eating expensive fat-burning supplements
              </p>
            </div>

            <div className="bg-[#4E0101] rounded-2xl flex items-center gap-4 px-5 py-5">
              <div className="w-[60px] h-[60px] min-w-[60px] bg-white rounded-xl flex items-center justify-center">
                <Image src="https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c66fa14dfc9fbf5ad4fa.jpg" alt="No heavy workouts" width={36} height={36} loading="lazy" />
              </div>
              <p className="text-white text-sm font-medium leading-snug">
                We don&apos;t promote any heavy workouts or starvation
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Expert's Guidance Section */}
      <section className="site-shell bg-white">
        <ExpertGuidanceSection variant="maroon" />
      </section>

      {/* Over 1,00,000+ People Enjoy Weight Loss */}
      <TestimonialSliderSection
        page="wedding"
        maxItems={6}
        header={
          <div className="text-center md:text-left">
            <h2 className="mt-2 text-2xl font-bold leading-tight text-[#1E1E1E] md:text-[42px]">
              Over <span className="text-[#FF850B]">1,00,000+</span>
              <br />
              People Enjoy Weight Loss
            </h2>
          </div>
        }
      />

      {/* Pricing Section */}
      <section id="plans-section" className="site-shell scroll-mt-24 bg-white py-12 md:py-16">
        <div className="w-full flex flex-col items-center justify-center text-center">
          <div className="flex items-center flex-col gap- mb-1 md:flex md:items-center md:gap-2 md:justify-normal justify-center">
            <div className='flex gap-2 items-center' >
              <span className="text-[#f5a623] text-lg">✦</span>
              <span className="text-teal-600 text-base font-semibold">
                Our Plans
              </span>
            </div>
            <SectionTitle className="text-[#1E1E1E] mt-4">Our Pricing</SectionTitle>
            <p className="text-[#828283]  text-center text-[12px] md:text-[14px] mt-2" style={{ fontFamily: 'Inter, sans-serif' }}>
              Choose a plan as per your requirements and start your wellness journey. See you around!
            </p>

          </div>
          <div className="w-full flex justify-center">
            <div className="w-full">
              <DynamicPlansDisplay
                category="new-wedding-plan"
                showHeader={false}
                columns="3-2"
                onSelectPlan={(plan) => {
                  const product = {
                    id: `wedding-${plan.planName
                      .toLowerCase()
                      .replace(/\s+/g, "-")}`,
                    name: `Wedding Prep Plan - ${plan.planName}`,
                    price: plan.price,
                    quantity: 1,
                  };
                  sessionStorage.setItem(
                    "checkoutProducts",
                    JSON.stringify([product])
                  );
                  window.location.href = "/checkout";
                }}
              />
            </div>
          </div>
        </div>
      </section>



      <style jsx>{`
        .wedding-hero-wrapper {
          width: 100%;
          padding: 16px 18px 0;
          background: #ffffff;
        }

        .wedding-hero-section {
          position: relative;
          width: 100%;
          max-width: 1490px;
          margin: 0 auto;
          min-height: 650px;
          border-radius: 22px;
          overflow: hidden;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          background: #4e0101;
        }

        .wedding-hero-image {
          object-fit: cover;
          object-position: center top;
          z-index: 1;
          transform: scale(1.01);
        }

        .wedding-hero-bottom-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 50%;
          z-index: 2;
          background: linear-gradient(
            to top,
            rgba(78, 1, 1, 1) 0%,
            rgba(78, 1, 1, 0.85) 25%,
            rgba(78, 1, 1, 0.5) 50%,
            rgba(78, 1, 1, 0) 100%
          );
          pointer-events: none;
        }

        .wedding-navbar-layer {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          z-index: 5;
        }

        .wedding-hero-content {
          position: relative;
          z-index: 4;
          width: 100%;
          max-width: 980px;
          margin: 0 auto;
          padding: 0 24px 46px;
          text-align: center;
        }

        .wedding-hero-title {
          margin: 0;
          color: #ffffff;
          font-size: 56px;
          line-height: 1.08;
          font-weight: 800;
          font-style: normal;
          letter-spacing: -0.03em;
          text-align: center;
        }

        .wedding-highlight {
          color: #ff8a00;
        }

        .wedding-hero-subtitle {
          margin: 18px 0 0;
          color: #ffffff;
          font-size: 18px;
          line-height: 1.45;
          font-weight: 400;
          text-align: center;
        }

        @media (max-width: 1280px) {
          .wedding-hero-section {
            min-height: 600px;
          }

          .wedding-hero-title {
            font-size: 50px;
          }
        }

        @media (max-width: 1024px) {
          .wedding-hero-section {
            min-height: 560px;
            border-radius: 20px;
          }

          .wedding-hero-title {
            font-size: 44px;
          }

          .wedding-hero-content {
            max-width: 860px;
            padding: 0 24px 40px;
          }
        }

@media (max-width:767px){

.wedding-hero-wrapper{
  padding:14px;
}

/* Reduce hero height */
.wedding-hero-section{
  height:420px;   /* earlier ~650px which caused stretching */
  border-radius:22px;
}

/* Keep image natural */
.wedding-hero-image{
  object-fit:cover;
  object-position:center top;
}

/* Adjust text position */
.wedding-hero-content{
  padding:0 20px 28px;
}

.wedding-hero-title{
  font-size:26px;
  line-height:1.2;
}

.wedding-hero-subtitle{
  font-size:13px;
}

}
        @media (max-width: 420px) {
          .wedding-hero-section {
            min-height: 660px;
          }

          .wedding-hero-title {
            font-size: 28px;
          }

          .wedding-hero-content {
            padding: 0 16px 26px;
          }
        }
      `}</style>
    </main>
  );
}