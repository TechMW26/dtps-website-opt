'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';

// Dynamic imports for below-fold components
const TransformationGallery = dynamic(() => import('@/components/TransformationGallery'), {
  loading: () => <div className="min-h-[400px] animate-pulse bg-gray-100 rounded-[20px]" />,
  ssr: true,
});

const DynamicPlansDisplay = dynamic(() => import('@/components/DynamicPlansDisplay'), {
  loading: () => <div className="min-h-[300px] animate-pulse bg-gray-100 rounded-[20px]" />,
  ssr: true,
});

const ExpertGuidanceSection = dynamic(() => import('@/components/ExpertGuidanceSection'), {
  loading: () => <div className="min-h-[300px] animate-pulse bg-gray-100 rounded-[20px]" />,
  ssr: true,
});

const whatYouGet = [
  { icon: '📊', title: 'Ongoing Support', desc: 'Regular follow-ups to adapt your diet plan as needed and ensure progress results.' },
  { icon: '❤️', title: 'Specialised Care', desc: 'Your diet is managed by dietitians who are specialised in hormonal disorders.' },
  { icon: '⭐', title: 'Tailored to You', desc: 'Every diet plan is crafted to meet your unique health needs and lifestyle preferences.' },
  { icon: '🧪', title: 'Sustainable Weight Management', desc: 'We focus on long-term lifestyle changes for lasting success.' },
];

const gkkBenefits = [
  { title: 'Inflammation down', desc: 'Less bloating, less pain, better skin', icon: 'https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c70ea14dfc9fbf5ad691.jpg' },
  { title: 'Hormones Balanced', desc: 'Regular cycles, better mood', icon: 'https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c6ffa14dfc9fbf5ad637.jpg' },
  { title: 'Energy Boost', desc: 'Feel more active and vibrant', icon: 'https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c70ea14dfc9fbf5ad699.jpg' },
  { title: 'Weight Loss', desc: 'Sustainable and healthy reduction', icon: 'https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c709a14dfc9fbf5ad677.jpg' },
  { title: 'Better Skin', desc: 'Clear, glowing, and healthy', icon: 'https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c70fa14dfc9fbf5ad69f.jpg' },
];

export default function PCODPage() {
  const [activeCard, setActiveCard] = useState(3);

  useEffect(() => {
    const order = [3, 1, 0, 2, 4];
    let i = 0;
    const timer = setInterval(() => {
      setActiveCard(order[i]);
      i = (i + 1) % order.length;
    }, 2400);
    return () => clearInterval(timer);
  }, []);

  return (
    <main className="bg-white">
      {/* Hero Section with Navbar */}
      <section className="hero-section pt-4 md:pt-[60px] px-3 md:px-[60px] lg:px-[120px]">
        <div className="bg-[#014E4E] rounded-3xl overflow-hidden w-full">
          <div className="relative w-full">
            {/* Navbar */}
            <Navbar />

            {/* Mobile Layout */}
            <div className="flex flex-col items-center w-full px-6 py-12 text-center md:hidden">
              <h1 className="text-[1.8rem] font-bold text-white leading-[1.3] mb-2">
                98% Of Our <span className="text-[#FF850B]">PCOD Clients</span> See
              </h1>
              <h2 className="text-[1.8rem] font-bold text-white leading-[1.3] mb-2">
                Major <span className="text-[#FF850B]">Weight Loss & Better Periods</span>
              </h2>
              <h3 className="text-[1.8rem] font-bold text-white leading-[1.3]">
                With Our Diet Plan.
              </h3>
            </div>

            {/* Desktop Layout */}
            <div className="flex-col items-center hidden w-full py-16 text-center md:flex lg:py-20">
              <h1 className="text-[2.5rem] lg:text-[3rem] xl:text-[3.5rem] font-bold text-white leading-[1.2] mb-2">
                98% Of Our <span className="text-[#FF850B]">PCOD Clients</span> See
              </h1>
              <h2 className="text-[2.5rem] lg:text-[3rem] xl:text-[3.5rem] font-bold text-white leading-[1.2] mb-2">
                Major <span className="text-[#FF850B]">Weight Loss & Better Periods</span>
              </h2>
              <h3 className="text-[2.5rem] lg:text-[3rem] xl:text-[3.5rem] font-bold text-white leading-[1.2]">
                With Our Diet Plan.
              </h3>
            </div>
          </div>
        </div>
      </section>








      <section className="py-16 md:py-24 px-3 md:px-[60px] lg:px-[120px] bg-[#F5F5F5]" id="benefits">

        <div className="max-w-[1230px] mx-auto">

          <h2 className="text-center text-[28px] md:text-[44px] font-bold text-black">
            Role of Diet in <span className="text-[#FF8A00]">PCOD/PCOS</span>
          </h2>

          <p className="text-center text-gray-500 text-sm md:text-base mt-3 max-w-[700px] mx-auto">
            Diet plays a crucial role in managing PCOS, as it can help mitigate some of the symptoms and associated health risks.
          </p>


          <div className="grid grid-cols-1 gap-8 mt-14 sm:grid-cols-2">


            {/* CARDS */}


              {/* CARD 1 */}

              <div className="rounded-[20px] overflow-hidden bg-white shadow-lg flex flex-col">

                <div className="h-[200px] bg-gray-100">
                  <Image
                    src="https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c669a14dfc9fbf5ad4e3.jpg"
                    width={500}
                    height={300}
                    alt="Balancing Blood Sugar"
                    className="object-cover w-full h-full"
                    loading="lazy"
                    sizes="(max-width: 639px) 100vw, 50vw"
                    quality={75}
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIhAAAgEDAwUBAAAAAAAAAAAAAQIDAAQRBQYhEhMxQVFh/8QAFQEBAQAAAAAAAAAAAAAAAAAAAwT/xAAaEQACAgMAAAAAAAAAAAAAAAABAgADBBES/9oADAMBAAIRAxEAPwCzq+6ru21m5tLa1tYYYpGRXaNi7gEgFiSOT9wKiHerEkm0tySegf2lKYUNB5ZOiVYfJ//Z"
                  />
                </div>

                <div className="bg-[#FF8A00] text-white p-6 flex-1">

                  <div className="w-10 h-[2px] bg-white mb-4"></div>

                  <h3 className="mb-2 text-lg font-semibold">
                    Balancing Blood Sugar Levels
                  </h3>

                  <p className="text-sm opacity-90">
                    Women with PCOS often experience insulin resistance, where the body's cells do not respond normally to insulin.
                  </p>

                </div>

              </div>



              {/* CARD 2 */}

              <div className="rounded-[20px] overflow-hidden bg-white shadow-lg flex flex-col">

                <div className="h-[200px] bg-gray-100">
                  <Image
                    src="https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c68ba14dfc9fbf5ad53d.jpg"
                    width={500}
                    height={300}
                    alt="Managing Weight"
                    className="object-cover w-full h-full"
                    loading="lazy"
                    sizes="(max-width: 639px) 100vw, 50vw"
                    quality={75}
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIhAAAgEDAwUBAAAAAAAAAAAAAQIDAAQRBQYhEhMxQVFh/8QAFQEBAQAAAAAAAAAAAAAAAAAAAwT/xAAaEQACAgMAAAAAAAAAAAAAAAABAgADBBES/9oADAMBAAIRAxEAPwCzq+6ru21m5tLa1tYYYpGRXaNi7gEgFiSOT9wKiHerEkm0tySegf2lKYUNB5ZOiVYfJ//Z"
                  />
                </div>

                <div className="bg-[#FF8A00] text-white p-6 flex-1">

                  <div className="w-10 h-[2px] bg-white mb-4"></div>

                  <h3 className="mb-2 text-lg font-semibold">
                    Managing Weight
                  </h3>

                  <p className="text-sm opacity-90">
                    Losing even a small amount of weight if you are overweight can help manage PCOS symptoms.
                  </p>

                </div>

              </div>



              {/* CARD 3 */}

              <div className="rounded-[20px] overflow-hidden bg-white shadow-lg flex flex-col">

                <div className="h-[200px] bg-gray-100">
                  <Image
                    src="https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c6d1a14dfc9fbf5ad572.jpg"
                    width={500}
                    height={300}
                    alt="Reducing Inflammation"
                    className="object-cover w-full h-full"
                    loading="lazy"
                    sizes="(max-width: 639px) 100vw, 50vw"
                    quality={75}
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIhAAAgEDAwUBAAAAAAAAAAAAAQIDAAQRBQYhEhMxQVFh/8QAFQEBAQAAAAAAAAAAAAAAAAAAAwT/xAAaEQACAgMAAAAAAAAAAAAAAAABAgADBBES/9oADAMBAAIRAxEAPwCzq+6ru21m5tLa1tYYYpGRXaNi7gEgFiSOT9wKiHerEkm0tySegf2lKYUNB5ZOiVYfJ//Z"
                  />
                </div>

                <div className="bg-[#FF8A00] text-white p-6 flex-1">

                  <div className="w-10 h-[2px] bg-white mb-4"></div>

                  <h3 className="mb-2 text-lg font-semibold">
                    Reducing Inflammation
                  </h3>

                  <p className="text-sm opacity-90">
                    PCOS is often linked with low-grade inflammation. Consuming a diet high in anti-inflammatory foods can be beneficial.
                  </p>

                </div>

              </div>



              {/* CARD 4 */}

              <div className="rounded-[20px] overflow-hidden bg-white shadow-lg flex flex-col">

                <div className="h-[200px] bg-gray-100">
                  <Image
                    src="https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c66fa14dfc9fbf5ad500.jpg"
                    width={500}
                    height={300}
                    alt="Increasing Fertility"
                    className="object-cover w-full h-full"
                    loading="lazy"
                    sizes="(max-width: 639px) 100vw, 50vw"
                    quality={75}
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIhAAAgEDAwUBAAAAAAAAAAAAAQIDAAQRBQYhEhMxQVFh/8QAFQEBAQAAAAAAAAAAAAAAAAAAAwT/xAAaEQACAgMAAAAAAAAAAAAAAAABAgADBBES/9oADAMBAAIRAxEAPwCzq+6ru21m5tLa1tYYYpGRXaNi7gEgFiSOT9wKiHerEkm0tySegf2lKYUNB5ZOiVYfJ//Z"
                  />
                </div>

                <div className="bg-[#FF8A00] text-white p-6 flex-1">

                  <div className="w-10 h-[2px] bg-white mb-4"></div>

                  <h3 className="mb-2 text-lg font-semibold">
                    Increasing Fertility
                  </h3>

                  <p className="text-sm opacity-90">
                    PCOS is one of the leading causes of infertility in women due to hormonal imbalances affecting ovulation.
                  </p>

                </div>

              </div>

          </div>

        </div>

      </section>


      {/* Symptoms Image Section */}

      <div className="px-3 md:px-[60px] lg:px-[120px] pcod-symptoms-image">

        {/* Desktop Banner */}
        <Image
          src="https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c719a14dfc9fbf5ad6d7.jpg"
          alt="Symptoms & Nutritional Concerns"
          width={1200}
          height={600}
          className="hidden object-contain w-full h-auto md:block"
          loading="lazy"
          sizes="100vw"
          quality={75}
        />

        {/* Mobile Banner */}
        <Image
          src="https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c71fa14dfc9fbf5ad6ec.jpg"
          alt="Symptoms & Nutritional Concerns"
          width={800}
          height={800}
          className="block object-contain w-full h-auto md:hidden"
          loading="lazy"
          sizes="100vw"
          quality={75}
        />

      </div>


      {/* WHAT YOU WILL GET SECTION */}

      <section className="w-full py-8 md:py-14 px-3 md:px-[60px] lg:px-[120px]">

        <div className="max-w-[1200px] mx-auto">

          {/* grey container */}
          <div className="bg-[#EAEEF1] rounded-[24px] p-4 md:p-10">

            <div className="grid items-center grid-cols-1 gap-8 md:grid-cols-2">

              {/* LEFT IMAGE */}

              <div className="flex justify-center">

                <div className="bg-[#EAEEF1] rounded-[18px] overflow-hidden w-full max-w-[330px] md:max-w-[520px] border border-gray-300">

                  <Image
                    src="https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c654a14dfc9fbf5ad4ad.jpg"
                    alt="Dietician Team"
                    width={600}
                    height={800}
                    className="object-contain w-full h-auto"
                    loading="lazy"
                    sizes="(max-width: 767px) 330px, 520px"
                    quality={75}
                  />

                </div>

              </div>

              {/* RIGHT SIDE */}

              <div className="flex flex-col items-center md:items-start">

                {/* TITLE */}

                <h2 className="text-[24px] md:text-[46px] font-bold text-center md:text-left mb-6">

                  <span className="text-[#1E1E1E]">What You Will </span>

                  <span className="text-[#FF850B]">Get</span>

                  <span className="text-[#1E1E1E]">?</span>

                </h2>

                {/* CARDS */}

                <div className="flex flex-col w-full gap-4">

                  {[
                    {
                      title: "Ongoing Support",
                      desc: "Regular follow-ups to adapt your diet plan as needed and ensure progress results.",
                      icon: "https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c6b6a14dfc9fbf5ad565.jpg",
                    },
                    {
                      title: "Specialised Care",
                      desc: "Your diet is managed by dietitians who are specialised in hormonal disorders.",
                      icon: "https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c6e6a14dfc9fbf5ad596.jpg",
                    },
                    {
                      title: "Tailored to You",
                      desc: "Every diet plan is crafted to meet your unique health needs and lifestyle preferences.",
                      icon: "https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c725a14dfc9fbf5ad6fc.jpg",
                    },
                    {
                      title: "Sustainable Weight Management",
                      desc: "We focus on long-term lifestyle changes for lasting success.",
                      icon: "https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c6e6a14dfc9fbf5ad598.jpg",
                    },
                  ].map((item, index) => (

                    <div
                      key={index}
                      className="flex items-center gap-4 bg-[#FF850B] rounded-[16px] p-4"
                    >

                      {/* ICON BOX */}

                      <div className="bg-[#014E4E] w-[60px] h-[60px] md:w-[100px] md:h-[100px] rounded-[12px] flex items-center justify-center flex-shrink-0">

                        <Image
                          src={item.icon}
                          alt={item.title}
                          width={50}
                          height={50}
                          className="object-contain"
                          loading="lazy"
                        />

                      </div>

                      {/* TEXT */}

                      <div className="text-left">

                        <h4 className="text-white font-bold text-[16px] md:text-[20px] leading-tight">

                          {item.title}

                        </h4>

                        <p className="text-white text-[12px] md:text-[13px] leading-[18px] mt-1">

                          {item.desc}

                        </p>

                      </div>

                    </div>

                  ))}

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* Ghar Ka Khana Section */}
      <section className="px-3 md:px-[60px] lg:px-[120px] py-16">
        <div className="max-w-[1280px] mx-auto">
          {/* Desktop Image - Hidden on Mobile */}
          <div className="hidden md:block">
            <Image
              src="https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c713a14dfc9fbf5ad6b7.jpg"
              alt="How Ghar Ka Khana Diet Plan Fixes PCOD & Weight"
              width={1280}
              height={800}
              className="w-full h-auto"
              loading="lazy"
              sizes="(max-width: 1280px) 100vw, 1280px"
            />
          </div>

          {/* Mobile Image - Hidden on Desktop */}
          <div className="block md:hidden">
            <Image
              src="https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c714a14dfc9fbf5ad6c0.jpg"
              alt="How Ghar Ka Khana Diet Plan Fixes PCOD & Weight"
              width={400}
              height={600}
              className="w-full h-auto"
              loading="lazy"
              sizes="100vw"
            />
          </div>
        </div>
      </section>

      {/* Expert Guidance Section */}
      <section className="px-3 md:px-[60px] lg:px-[120px]">
        <ExpertGuidanceSection />
      </section>

      {/* TESTIMONIALS GALLERY */}
      <section className="py-12 md:py-20 px-3 md:px-[60px] lg:px-[120px]">
        <div className="max-w-[1000px] mx-auto">
          <div className="flex flex-col gap-4 mb-10 md:flex-row md:items-end md:justify-between md:mb-14">
            <div className="max-w-[630px]">
              <div className="text-[#FF850B] text-xs md:text-sm font-semibold tracking-wide uppercase">Success Stories</div>
              <h2 className="text-[#1E1E1E] text-[28px] md:text-[44px] font-bold leading-[1.2] mt-2">
                Over 75,000+<br />People Manage PCOD Successfully
              </h2>
              <p className="text-[#828283] text-[12px] md:text-[14px] mt-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                Join our Plan today and embark on a journey to better health with our PCOD diet plan!
              </p>
            </div>
            {/* Dots indicator */}
            <div className="flex items-center gap-1">
              {[6, 6, 6, 18, 6, 6].map((w, i) => (
                <div key={i} className={`h-[6px] rounded-full ${w === 18 ? 'bg-[#FF850B] w-[18px]' : 'bg-[#014E4E] w-[6px]'}`} />
              ))}
            </div>
          </div>
          {/* TransformationGallery for PCOD */}
          <TransformationGallery
            page="pcod"
            title=""
            subtitle=""
            maxItems={6}
          />
        </div>
      </section>

      {/* Pricing Section - Mobile */}
      <section className="px-3 md:px-[60px] lg:px-[120px] py-8 wl-section md:hidden">
        <div className="container">
          <div className="wl-section-label wl-center">
            <span className="wl-star wl-teal-text">✦</span> <span className="text-xs wl-teal-text">PRICING</span>
          </div>
          <h2 className="mb-2 text-xl wl-section-title wl-center">Take the first step towards a healthier Future</h2>
          <p className="mb-4 text-xs wl-section-desc wl-center">
            Join our Plan today and embark on a journey to better health with our PCOD diet plan!
          </p>
          <div className="flex justify-center w-full">
            <div className="w-full">
              <DynamicPlansDisplay
                category="pcod"
                showHeader={false}
                columns="1"
                onSelectPlan={(plan) => {
                  const product = {
                    id: `pcod-${plan.planName.toLowerCase().replace(/\s+/g, '-')}`,
                    name: `PCOD Management Plan - ${plan.planName}`,
                    price: plan.price,
                    quantity: 1
                  };
                  sessionStorage.setItem('checkoutProducts', JSON.stringify([product]));
                  window.location.href = '/checkout';
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section - Desktop */}
      <section className="hidden wl-section md:block">
        <div className="container">
          <div className="wl-section-label wl-center">
            <span className="wl-star wl-teal-text">✦</span> <span className="wl-teal-text">PRICING</span>
          </div>
          <h2 className="wl-section-title wl-center">Take the first step towards a healthier Future</h2>
          <p className="wl-section-desc wl-center">
            Join our Plan today and embark on a journey to better health with our PCOD diet plan!
          </p>
          <div className="flex justify-center w-full">
            <div className="max-w-[1200px] w-full">
              <DynamicPlansDisplay
                category="pcod"
                showHeader={false}
                columns="3"
                onSelectPlan={(plan) => {
                  const product = {
                    id: `pcod-${plan.planName.toLowerCase().replace(/\s+/g, '-')}`,
                    name: `PCOD Management Plan - ${plan.planName}`,
                    price: plan.price,
                    quantity: 1
                  };
                  sessionStorage.setItem('checkoutProducts', JSON.stringify([product]));
                  window.location.href = '/checkout';
                }}
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
