"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import LoseWeightSection from "@/components/LoseWeightSection";
import DynamicPlansDisplay from "@/components/DynamicPlansDisplay";
import { getPricingByCategory } from "@/lib/api";
import type { Pricing } from "@/lib/api";
import TransformationGallery from "@/components/TransformationGallery";
import ExpertGuidanceSection from "@/components/ExpertGuidanceSection";

// Tab data for "What Happens" section
const tabsData: Record<string, { image: string; benefits: string[] }> = {
  brides: {
    image:
      "https://staging.dtpoonamsagar.com/wp-content/uploads/2025/11/Bride.png",
    benefits: [
      "You'll drop those extra inches with real, home-cooked food.",
      "Skin looks clearer and naturally glowing.",
      "Hair feels stronger and healthier from within.",
      "Energy stays consistent through long functions.",
      "You feel fresh, light, and comfortable in your outfits.",
    ],
  },
  grooms: {
    image:
      "https://staging.dtpoonamsagar.com/wp-content/uploads/2025/11/Groom.png",
    benefits: [
      "Better sherwani fit and confident posture.",
      "Sharper jawline and reduced puffiness.",
      "Stamina improves during busy wedding days.",
      "Better digestion with clean meals.",
      "You look naturally sharp in pictures.",
    ],
  },
  couples: {
    image:
      "https://staging.dtpoonamsagar.com/wp-content/uploads/2025/11/Couple.png",
    benefits: [
      "Both partners feel fit & confident.",
      "Shared food routine improves bonding.",
      "Glow shows naturally in wedding photos.",
      "No starving — full satisfying meals.",
      "You look and feel great together.",
    ],
  },
  family: {
    image:
      "https://staging.dtpoonamsagar.com/wp-content/uploads/2025/11/Guest-1.png",
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

export default function WeddingPlanPage() {
  const [activeTab, setActiveTab] = useState("brides");
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

  return (
    <main className="bg-white">
      {/* Hero Section with Navbar */}
      <section className="hero-section pt-[60px] px-4 md:px-[60px] lg:px-[120px]">
        <div className="bg-[#014E4E] rounded-3xl overflow-hidden w-full relative">
          {/* Background Image */}
          <Image
            src="https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c727a14dfc9fbf5ad706.jpg"
            alt="Wedding couple"
            fill
            priority
            className="object-cover opacity-40"
            sizes="100vw"
            quality={80}
          />

          <div className="relative w-full z-10">
            {/* Navbar */}
            <Navbar />

            {/* Mobile Layout */}
            <div className="md:hidden w-full py-12 px-6 flex flex-col items-center text-center">
              <h1 className="text-[1.8rem] font-bold text-white leading-[1.3] mb-2">
                India&apos;s Only <span className="text-[#FF850B]">&ldquo;Ghar Ka Khana&rdquo;</span>
              </h1>
              <h2 className="text-[1.8rem] font-bold text-white leading-[1.3] mb-6">
                Diet Plan That Gets You <span className="text-[#FF850B]">Wedding-Ready.</span>
              </h2>

              <p className="text-white/80 text-[15px] leading-[1.6] mb-8">
                Because you shouldn&apos;t have to suffer to look beautiful.
              </p>

              {/* Button */}
              <Link
                href="/checkout?plan=wedding"
                className="bg-[#FF850B] hover:bg-[#E57A09] text-white font-semibold py-3 px-8 rounded-full text-sm transition-colors"
              >
                Buy Wedding Plan Now
              </Link>
            </div>

            {/* Desktop Layout */}
            <div className="hidden md:flex w-full py-16 lg:py-20 flex-col items-center text-center">
              <h1 className="text-[2.5rem] lg:text-[3rem] xl:text-[3.5rem] font-bold text-white leading-[1.2] mb-2">
                India&apos;s Only <span className="text-[#FF850B]">&ldquo;Ghar Ka Khana&rdquo;</span> Diet Plan
              </h1>
              <h2 className="text-[2.5rem] lg:text-[3rem] xl:text-[3.5rem] font-bold text-white leading-[1.2] mb-8">
                That Gets You <span className="text-[#FF850B]">Wedding-Ready.</span>
              </h2>

              <p className="text-white/80 text-[18px] leading-[1.7] mb-8 max-w-[580px]">
                Because you shouldn&apos;t have to suffer to look beautiful.
              </p>

              {/* Button */}
              <Link
                href="/checkout?plan=wedding"
                className="bg-[#FF850B] hover:bg-[#E57A09] text-white font-semibold py-3.5 px-10 rounded-full text-base transition-colors"
              >
                Buy Wedding Plan Now
              </Link>
            </div>
          </div>
        </div>
      </section>
      {/* Wedding Transformations Section */}
      <section className="bg-[#f7f7f7] py-14 md:py-20">
        <div className="max-w-[1200px] mx-auto px-5">

          <TransformationGallery
            page="wedding"
            title="Lose 5–7 Kilos in just 30 Days"
            subtitle="& Still Eat the Food You Love!"
            maxItems={6}
          />

        </div>
      </section>
      {/* What Happens When You Start Section */}
      <section className="bg-white py-12">
        <div className="max-w-[1200px] mx-auto px-5">
          <h2 className="text-center text-2xl md:text-5xl font-bold text-black leading-tight mb-8 md:mb-16">
            What Happens
            <br />
            When You Start the{" "}
            <span className="text-[#ff850b]">DTPS Wedding Plan</span>
          </h2>

          {/* Desktop Tabs */}
          <div className="hidden md:flex justify-between gap-5 max-w-[996px] mx-auto mb-8">
            {/* Brides Tab */}
            <div
              onClick={() => setActiveTab("brides")}
              className={`h-60 w-[220px] relative rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 ${activeTab === "brides" ? "-translate-y-1.5 scale-[1.06]" : ""
                }`}
            >
              <div
                className={`absolute bottom-0 left-0 rounded-3xl w-full h-[180px] transition-colors duration-300 ${activeTab === "brides" ? "bg-[#ff850b]" : "bg-[#4e0101]"
                  }`}
              ></div>
              <div className="absolute bottom-0 left-[calc(50%-79px)] w-[159px] h-60">
                <Image
                  src="https://staging.dtpoonamsagar.com/wp-content/uploads/2025/11/Images-2.png"
                  alt="Brides"
                  fill
                  loading="lazy"
                  sizes="159px"
                  className="object-cover"
                />
              </div>
              <div
                className={`absolute bottom-0 left-0 rounded-3xl w-full h-[180px] ${activeTab === "brides"
                  ? "bg-gradient-to-b from-transparent via-transparent to-[rgba(255,133,11,0.55)]"
                  : "bg-gradient-to-b from-transparent via-transparent to-[#4e0101]"
                  }`}
              ></div>
              <div
                className={`absolute top-[203px] left-[calc(50%-38px)] font-semibold text-white text-2xl ${activeTab === "brides"
                  ? "drop-shadow-[0_1px_10px_rgba(255,133,11,0.45)]"
                  : ""
                  }`}
              >
                Brides
              </div>
            </div>

            {/* Grooms Tab */}
            <div
              onClick={() => setActiveTab("grooms")}
              className={`h-60 w-[220px] relative rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 ${activeTab === "grooms" ? "-translate-y-1.5 scale-[1.06]" : ""
                }`}
            >
              <div
                className={`absolute bottom-0 left-0 rounded-3xl w-full h-[180px] transition-colors duration-300 ${activeTab === "grooms" ? "bg-[#ff850b]" : "bg-[#4e0101]"
                  }`}
              ></div>
              <div className="absolute bottom-0 left-[calc(50%-100px)] w-[201px] h-60">
                <Image
                  src="https://staging.dtpoonamsagar.com/wp-content/uploads/2025/11/Images-3.png"
                  alt="Grooms"
                  fill
                  loading="lazy"
                  sizes="201px"
                  className="object-cover"
                />
              </div>
              <div
                className={`absolute bottom-0 left-0 rounded-3xl w-full h-[180px] ${activeTab === "grooms"
                  ? "bg-gradient-to-b from-transparent via-transparent to-[rgba(255,133,11,0.55)]"
                  : "bg-gradient-to-b from-transparent via-transparent to-[#4e0101]"
                  }`}
              ></div>
              <div
                className={`absolute top-[203px] left-[calc(50%-47px)] font-semibold text-white text-2xl ${activeTab === "grooms"
                  ? "drop-shadow-[0_1px_10px_rgba(255,133,11,0.45)]"
                  : ""
                  }`}
              >
                Grooms
              </div>
            </div>

            {/* Couples Tab */}
            <div
              onClick={() => setActiveTab("couples")}
              className={`h-60 w-[220px] relative rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 ${activeTab === "couples" ? "-translate-y-1.5 scale-[1.06]" : ""
                }`}
            >
              <div
                className={`absolute bottom-0 left-0 rounded-3xl w-full h-[180px] transition-colors duration-300 ${activeTab === "couples" ? "bg-[#ff850b]" : "bg-[#4e0101]"
                  }`}
              ></div>
              <div className="absolute bottom-0 left-[calc(50%-80px)] w-[161px] h-60">
                <Image
                  src="https://staging.dtpoonamsagar.com/wp-content/uploads/2025/11/Images-4.png"
                  alt="Couples"
                  fill
                  loading="lazy"
                  sizes="161px"
                  className="object-cover"
                />
              </div>
              <div
                className={`absolute bottom-0 left-0 rounded-3xl w-full h-[180px] ${activeTab === "couples"
                  ? "bg-gradient-to-b from-transparent via-transparent to-[rgba(255,133,11,0.55)]"
                  : "bg-gradient-to-b from-transparent via-transparent to-[#4e0101]"
                  }`}
              ></div>
              <div
                className={`absolute top-[203px] left-[calc(50%-49px)] font-semibold text-white text-2xl ${activeTab === "couples"
                  ? "drop-shadow-[0_1px_10px_rgba(255,133,11,0.45)]"
                  : ""
                  }`}
              >
                Couples
              </div>
            </div>

            {/* Family Tab */}
            <div
              onClick={() => setActiveTab("family")}
              className={`h-60 w-[220px] relative rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 ${activeTab === "family" ? "-translate-y-1.5 scale-[1.06]" : ""
                }`}
            >
              <div
                className={`absolute bottom-0 left-0 rounded-3xl w-full h-[180px] transition-colors duration-300 ${activeTab === "family" ? "bg-[#ff850b]" : "bg-[#4e0101]"
                  }`}
              ></div>
              <div className="absolute bottom-0 left-[calc(50%-100.5px)] w-[202px] h-60">
                <Image
                  src="https://staging.dtpoonamsagar.com/wp-content/uploads/2025/11/Images-5.png"
                  alt="Family"
                  fill
                  loading="lazy"
                  sizes="202px"
                  className="object-cover"
                />
              </div>
              <div
                className={`absolute bottom-0 left-0 rounded-3xl w-full h-[180px] ${activeTab === "family"
                  ? "bg-gradient-to-b from-transparent via-transparent to-[rgba(255,133,11,0.55)]"
                  : "bg-gradient-to-b from-transparent via-transparent to-[#4e0101]"
                  }`}
              ></div>
              <div
                className={`absolute top-[203px] left-[calc(50%-43px)] font-semibold text-white text-2xl ${activeTab === "family"
                  ? "drop-shadow-[0_1px_10px_rgba(255,133,11,0.45)]"
                  : ""
                  }`}
              >
                Family
              </div>
            </div>
          </div>



          {/* Tab Content Card - Desktop */}
          <div className="hidden md:block bg-[#4e0101] rounded-3xl overflow-hidden relative min-h-[467px] max-w-[1200px] mx-auto">
            <div className="absolute top-0 left-[102px] bg-[#ff850b] w-[180px] h-full"></div>

            <Image
              src={tabsData[activeTab].image}
              alt={activeTab}
              width={410}
              height={459}
              className="absolute bottom-0 left-[102px] object-cover"
              loading="lazy"
              sizes="410px"
              quality={75}
            />

            <div className="absolute top-[126px] left-[510px] w-[580px] flex flex-col gap-6">
              {tabsData[activeTab].benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Image
                    src="https://staging.dtpoonamsagar.com/wp-content/uploads/2025/11/ion_diamond.svg"
                    alt="Diamond"
                    width={24}
                    height={24}
                    loading="lazy"
                  />
                  <div className="font-semibold capitalize text-white text-base">
                    {benefit}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tab Content - Mobile */}
          <div className="md:hidden">
            {/* Image with orange strip */}
            <div className="relative flex justify-center mb-6">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-[#ff850b] w-[130px] h-full rounded-lg"></div>
              <Image
                src={tabsData[activeTab].image}
                alt={activeTab}
                width={220}
                height={280}
                className="relative z-10 object-cover"
                loading="lazy"
                sizes="220px"
                quality={75}
              />
            </div>

            {/* Tab buttons */}
            <div className="flex flex-wrap justify-center gap-3 mb-6">
              {(["brides", "grooms", "couples", "family"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-2 px-5 rounded-full text-sm font-semibold capitalize transition-all duration-300 ${activeTab === tab
                    ? "bg-[#1a1a1a] text-white"
                    : "bg-white text-[#1a1a1a] border border-[#e0e0e0]"
                    }`}
                >
                  {tab === "family" ? "Family" : tab}
                </button>
              ))}
            </div>

            {/* Benefit cards */}
            <div className="flex flex-col gap-3">
              {tabsData[activeTab].benefits.map((benefit, index) => (
                <div key={index} className="bg-white rounded-xl border border-[#f0f0f0] shadow-sm px-4 py-3.5 flex items-start gap-3">
                  <div className="w-8 h-8 min-w-[32px] bg-[#FFF3E0] rounded-lg flex items-center justify-center">
                    <Image
                      src="https://staging.dtpoonamsagar.com/wp-content/uploads/2025/11/ion_diamond.svg"
                      alt=""
                      width={16}
                      height={16}
                      loading="lazy"
                    />
                  </div>
                  <p className="text-[#333] text-sm font-medium leading-snug pt-1">
                    {benefit}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= MOBILE ONLY SVG ================= */}

      <section className="block md:hidden w-full">

        <Image
          src="https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c70fa14dfc9fbf5ad6a1.jpg"
          alt="Five Cycle Program"
          width={420}
          height={700}
          className="w-full h-auto"
          loading="lazy"
          sizes="100vw"
        />

      </section>



      {/* ================= DESKTOP VERSION ================= */}

      <section className="hidden md:block bg-white py-20 px-4">

        <div className="max-w-[1200px] mx-auto bg-[#4E0101] rounded-[28px] py-16 px-8 relative">

          {/* Heading */}
          <div className="text-center mb-16">

            <h2 className="text-5xl font-bold text-white mb-4">
              Our <span className="text-[#ff850b]">Five-Cycle</span> Program
            </h2>

            <p className="text-[#ff850b] text-2xl">
              A science-based process that prepares your body
            </p>

            <p className="text-[#ff850b] text-2xl">
              for sustainable weight loss.
            </p>

          </div>


          {/* Orbit Container */}
          <div className="relative h-[520px] flex items-center justify-center">

            {/* Dotted Ring */}
            <div className="absolute w-[420px] h-[420px] border-2 border-dashed border-white rounded-full"></div>


            {/* Center Circle */}
            <div className="absolute w-[150px] h-[150px] bg-white rounded-full flex items-center justify-center text-[#FF850B] font-bold text-2xl text-center shadow-xl">
              WEIGHT<br />LOSS
            </div>



            {/* Detox */}
            <div className="absolute top-[20px] left-1/2 -translate-x-1/2 flex flex-col items-center">

              <div className="bg-[#5c0a0a] border border-[#8a3b3b] rounded-xl px-6 py-3 mb-3 text-center">
                <h3 className="text-white font-semibold text-sm">Detoxification</h3>
                <p className="text-[#ff850b] text-xs">
                  This initial phase gently cleanses your body
                </p>
              </div>

              <div className="w-[70px] h-[70px] bg-white rounded-full flex items-center justify-center border-4 border-white">
                <img src="https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c6ffa14dfc9fbf5ad637.jpg" className="w-7" loading="lazy" decoding="async" alt="Detox" />
              </div>

            </div>



            {/* Anti Inflammatory */}
            <div className="absolute right-[120px] top-[150px] flex items-center gap-4">

              <div className="w-[70px] h-[70px] bg-white rounded-full flex items-center justify-center border-4 border-white">
                <img src="https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c70ea14dfc9fbf5ad691.jpg" className="w-7" loading="lazy" decoding="async" alt="Anti-Inflammatory" />
              </div>

              <div className="bg-[#5c0a0a] border border-[#8a3b3b] rounded-xl px-6 py-3 w-[220px]">
                <h3 className="text-white font-semibold text-sm">Anti-Inflammatory Reset</h3>
                <p className="text-[#ff850b] text-xs">
                  Anti-inflammatory foods to reduce inflammation
                </p>
              </div>

            </div>



            {/* Fat Burning */}
            <div className="absolute right-[120px] bottom-[140px] flex items-center gap-4">

              <div className="w-[70px] h-[70px] bg-white rounded-full flex items-center justify-center border-4 border-white">
                <img src="https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c709a14dfc9fbf5ad677.jpg" className="w-7" loading="lazy" decoding="async" alt="Fat Burning" />
              </div>

              <div className="bg-[#5c0a0a] border border-[#8a3b3b] rounded-xl px-6 py-3 w-[220px]">
                <h3 className="text-white font-semibold text-sm">Fat-Burning Activation</h3>
                <p className="text-[#ff850b] text-xs">
                  Dynamic cycle focused on maximizing fat burning
                </p>
              </div>

            </div>



            {/* Metabolic */}
            <div className="absolute left-[120px] bottom-[140px] flex items-center gap-4 flex-row-reverse">

              <div className="w-[70px] h-[70px] bg-white rounded-full flex items-center justify-center border-4 border-white">
                <img src="https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c70fa14dfc9fbf5ad69f.jpg" className="w-7" loading="lazy" decoding="async" alt="Metabolic" />
              </div>

              <div className="bg-[#5c0a0a] border border-[#8a3b3b] rounded-xl px-6 py-3 w-[220px] text-right">
                <h3 className="text-white font-semibold text-sm">Metabolic Optimisation</h3>
                <p className="text-[#ff850b] text-xs">
                  Rev up your metabolism with booster cycle
                </p>
              </div>

            </div>



            {/* Maintenance */}
            <div className="absolute left-[120px] top-[150px] flex items-center gap-4 flex-row-reverse">

              <div className="w-[70px] h-[70px] bg-white rounded-full flex items-center justify-center border-4 border-white">
                <img src="https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c70ea14dfc9fbf5ad699.jpg" className="w-7" loading="lazy" decoding="async" alt="Maintenance" />
              </div>

              <div className="bg-[#5c0a0a] border border-[#8a3b3b] rounded-xl px-6 py-3 w-[220px] text-right">

                <h3 className="text-white font-semibold text-sm">
                  Maintenance & Progression
                </h3>

                <p className="text-[#ff850b] text-xs">
                  Celebrate success and maintain weight loss
                </p>

              </div>

            </div>

          </div>
        </div>
      </section>


      {/* We Do Not Push Section */}
      <section className="bg-white py-14 md:py-20">

        <div className="max-w-[1200px] mx-auto px-5">
          <div className="bg-[#E7E7E7] rounded-[30px] pt-6 pb-0 md:pt-12 md:pb- px-6 md:px-12">

            <div className="grid md:grid-cols-2 gap-10 items-center">

              {/* LEFT IMAGE */}
              <div className="flex justify-center md:justify-start">
                <div className="relative w-[280px] md:w-[420px] h-[620px] md:h-[700px] rounded-[22px]">
                  <Image
                    src="https://staging.dtpoonamsagar.com/wp-content/uploads/2025/11/Bride-Cross.png"
                    alt="Bride"
                    width={420}
                    height={580}
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 z-10 w-[280px] md:w-[420px] h-auto"
                    loading="lazy"
                    sizes="(max-width: 767px) 280px, 420px"
                    quality={75}
                  />
                </div>


              </div>


              {/* RIGHT SIDE */}
              <div>

                <h2 className="text-3xl md:text-5xl font-bold text-[#333] mb-8">
                  We Do Not Push
                </h2>

                <div className="flex flex-col gap-6">

                  {/* CARD 1 */}
                  <div className="flex items-center gap-5 bg-[#FF850B] rounded-2xl p-4 md:p-5">

                    <div className="bg-[#E7E7E7] rounded-xl p-3 flex items-center justify-center">

                      <Image
                        src="https://staging.dtpoonamsagar.com/wp-content/uploads/2025/11/no_meals.svg"
                        alt="No meals"
                        width={40}
                        height={40}
                        loading="lazy"
                      />


                    </div>

                    <p className="text-white font-semibold text-base md:text-lg">
                      Crash diets. Starvation.
                    </p>

                  </div>


                  {/* CARD 2 */}
                  <div className="flex items-center gap-5 bg-[#FF850B] rounded-2xl p-4 md:p-5">

                    <div className="bg-[#E7E7E7] rounded-xl p-3 flex items-center justify-center">

                      <Image
                        src="https://staging.dtpoonamsagar.com/wp-content/uploads/2025/11/pill-1.svg"
                        alt="Pills"
                        width={40}
                        height={40}
                        loading="lazy"
                      />

                    </div>

                    <p className="text-white font-semibold text-base md:text-lg">
                      Glutathione. Fat-burner pills. Detox teas.
                    </p>

                  </div>


                  {/* CARD 3 */}
                  <div className="flex items-center gap-5 bg-[#FF850B] rounded-2xl p-4 md:p-5">

                    <div className="bg-[#E7E7E7] rounded-xl p-3 flex items-center justify-center">

                      <Image
                        src="https://staging.dtpoonamsagar.com/wp-content/uploads/2025/11/cardio_load.svg"
                        alt="Cardio"
                        width={40}
                        height={40}
                        loading="lazy"
                      />

                    </div>

                    <p className="text-white font-semibold text-base md:text-lg">
                      Heavy gym plans if you do not want them.
                    </p>

                  </div>


                  {/* CARD 4 */}
                  <div className="flex items-center gap-5 bg-[#FF850B] rounded-2xl p-4 md:p-5">

                    <div className="bg-[#E7E7E7] rounded-xl p-3 flex items-center justify-center">

                      <Image
                        src="https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c709a14dfc9fbf5ad671.jpg"
                        alt="Fad Diet"
                        width={40}
                        height={40}
                        loading="lazy"
                      />

                    </div>

                    <p className="text-white font-semibold text-base md:text-lg">
                      Fad expensive salad or juice-only diet.
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </div>
        </div>

      </section>

      {/* 100% Personalised Ghar Ka Khana Section */}
      <section className="bg-white py-14 md:py-20">
        <div className="max-w-[1200px] mx-auto px-5">
          <div className="bg-[#4E0101] rounded-[24px] md:rounded-[30px] px-6 py-10 md:px-16 md:py-14">

            {/* Heading */}
            <h2 className="text-center text-[22px] md:text-[42px] font-extrabold text-white leading-tight mb-8 md:mb-14">
              100% Personalised<br />
              <span className="text-[#FF850B]">GHAR KA KHANA</span> Diet Plan
            </h2>

            {/* Desktop: 3 Icons Row */}
            <div className="hidden md:flex items-start justify-center gap-16 mb-14">
              <div className="flex flex-col items-center gap-4">
                <div className="w-[90px] h-[90px] bg-white rounded-full flex items-center justify-center shadow-lg">
                  <Image src="https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c66fa14dfc9fbf5ad4f6.jpg" alt="Fully Customised Diet Plan" width={50} height={50} loading="lazy" />
                </div>
                <p className="text-white text-base font-medium text-center leading-snug">
                  Fully Customised<br />Diet Plan
                </p>
              </div>

              <div className="flex flex-col items-center gap-4">
                <div className="w-[90px] h-[90px] bg-white rounded-full flex items-center justify-center shadow-lg">
                  <Image src="https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c6e6a14dfc9fbf5ad594.jpg" alt="Shaadi-Ready Custom Diet Plan" width={50} height={50} loading="lazy" />
                </div>
                <p className="text-white text-base font-medium text-center leading-snug">
                  Shaadi-Ready<br />Custom Diet Plan
                </p>
              </div>

              <div className="flex flex-col items-center gap-4">
                <div className="w-[90px] h-[90px] bg-white rounded-full flex items-center justify-center shadow-lg">
                  <Image src="https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c6b3a14dfc9fbf5ad560.jpg" alt="Medical-Aware Personalised Plan" width={50} height={50} loading="lazy" />
                </div>
                <p className="text-white text-base font-medium text-center leading-snug">
                  Medical-Aware<br />Personalised Plan
                </p>
              </div>
            </div>

            {/* Mobile: Icons with label on right */}
            <div className="flex md:hidden flex-col gap-5 mb-8 max-w-[260px] mx-auto">
              <div className="flex items-center gap-4">
                <div className="w-[56px] h-[56px] min-w-[56px] bg-white rounded-full flex items-center justify-center shadow-lg">
                  <Image src="https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c66fa14dfc9fbf5ad4f6.jpg" alt="Fully Customised Diet Plan" width={32} height={32} loading="lazy" />
                </div>
                <p className="text-white text-sm font-medium leading-snug">
                  Fully Customised<br />Diet Plan
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-[56px] h-[56px] min-w-[56px] bg-white rounded-full flex items-center justify-center shadow-lg">
                  <Image src="https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c6e6a14dfc9fbf5ad594.jpg" alt="Shaadi-Ready Custom Diet Plan" width={32} height={32} loading="lazy" />
                </div>
                <p className="text-white text-sm font-medium leading-snug">
                  Shaadi-Ready<br />Custom Diet Plan
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-[56px] h-[56px] min-w-[56px] bg-white rounded-full flex items-center justify-center shadow-lg">
                  <Image src="https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c6b3a14dfc9fbf5ad560.jpg" alt="Medical-Aware Personalised Plan" width={32} height={32} loading="lazy" />
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
              Sirf <span className="text-[#FF850B] italic">GHAR KE KHANE</span><br className="md:hidden" />
              {" "}se bhi ho sakta hai amazing<br className="md:hidden" />
              {" "}<span className="text-[#FF850B] font-bold">WEIGHT LOSS</span>!
            </p>

          </div>
        </div>
      </section>

      {/* Why People Trust DTPS Section */}
      <section className="bg-white py-14 md:py-20">
        <div className="max-w-[1200px] mx-auto px-5">

          {/* Heading */}
          <h2 className="text-center text-2xl md:text-[42px] font-bold text-black leading-tight mb-8 md:mb-12">
            Why people trust <span className="text-[#FF850B]">DTPS</span>?
          </h2>

          {/* Desktop: Horizontal cards */}
          <div className="hidden md:flex flex-col gap-5 max-w-[850px] mx-auto">
            <div className="bg-[#4E0101] rounded-2xl flex items-center gap-6 px-8 py-6">
              <div className="w-[80px] h-[80px] min-w-[80px] bg-white rounded-xl flex items-center justify-center">
                <Image src="https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c716a14dfc9fbf5ad6c9.jpg" alt="Personalised" width={48} height={48} loading="lazy" />
              </div>
              <p className="text-white text-base md:text-lg font-medium leading-snug">
                Personalised plan built around<br />your taste, work hours, travel, and culture
              </p>
            </div>

            <div className="bg-[#4E0101] rounded-2xl flex items-center gap-6 px-8 py-6">
              <div className="w-[80px] h-[80px] min-w-[80px] bg-white rounded-xl flex items-center justify-center">
                <Image src="https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c70fa14dfc9fbf5ad69b.jpg" alt="Medical" width={48} height={48} loading="lazy" />
              </div>
              <p className="text-white text-base md:text-lg font-medium leading-snug">
                Medical aware for PCOS, thyroid,<br />and diabetes with reports considered
              </p>
            </div>

            <div className="bg-[#4E0101] rounded-2xl flex items-center gap-6 px-8 py-6">
              <div className="w-[80px] h-[80px] min-w-[80px] bg-white rounded-xl flex items-center justify-center">
                <Image src="https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c6e9a14dfc9fbf5ad5a3.jpg" alt="No supplements" width={48} height={48} loading="lazy" />
              </div>
              <p className="text-white text-base md:text-lg font-medium leading-snug">
                We don&apos;t recommend eating expensive<br />fat-burning supplements
              </p>
            </div>

            <div className="bg-[#4E0101] rounded-2xl flex items-center gap-6 px-8 py-6">
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
      <section className="bg-white px-4 md:px-5">
        <ExpertGuidanceSection variant="maroon" />
      </section>

      {/* Over 75,000+ People Enjoy Weight Loss */}
      <section className="py-12 md:py-20 px-4 md:px-12 lg:px-[120px]">
        <div className="max-w-[1000px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10 md:mb-14">
            <div className="max-w-[630px]">
              <span className="text-[#FF850B] text-sm md:text-base font-semibold">Our Testimonials</span>
              <h2 className="text-2xl md:text-[42px] font-bold text-[#1E1E1E] leading-tight mt-2">
                Over 75,000+<br />
                People Enjoy Weight Loss
              </h2>
              <p className="text-[#828283] text-xs md:text-sm mt-2">
                Join our Plan today and embark on a journey to better health with our weight loss plan!
              </p>
            </div>
          </div>
          <TransformationGallery
            page="wedding"
            title=""
            subtitle=""
            maxItems={6}
          />
        </div>
      </section>

      {/* Pricing Section */}
      <section className="bg-white py-12 md:py-16 px-5">
        <div className="w-full flex flex-col items-center justify-center text-center">
          <span className="text-[#ff850b] text-sm md:text-base font-semibold leading-relaxed">
            Our Pricing
          </span>

          <h2 className="text-2xl md:text-5xl font-bold text-black leading-tight my-2.5 max-w-full md:max-w-[56%]">
            Take the First Step to a{" "}
            <span className="text-[#ff850b]">Healthier Future</span>
          </h2>

          <p className="text-sm md:text-base font-light leading-relaxed text-[#828283] max-w-full md:max-w-[65%] mx-auto mb-6 md:mb-10">
            Join our Plan today and embark on a journey to better health with
            our wedding plan!
          </p>

          <div className="w-full flex justify-center px-5">
            <div className="max-w-[1100px] w-full">
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