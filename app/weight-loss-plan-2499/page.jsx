"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';

import PageWrapper from '@/components/PageWrapper';
import ExpertGuidanceSection from '@/components/ExpertGuidanceSection';
import YouTubeShortsSlider from '@/components/YouTubeShortsSlider';
import TestimonialsSection from '@/components/TestimonialsSection';
import TransformationGallery from '@/components/TransformationGallery';

const SECTION_GAP = 'mt-10 md:mt-14';
const THALI_IMAGE_URL = 'https://ik.imagekit.io/br0mssyqj/DTPS-Ecommerce/static/weight-loss/4ca0ad9f-3706-4478-9c4b-6de3909f56c2-1.png';
const RECTANGLE_IMAGE_URL = 'https://ik.imagekit.io/br0mssyqj/DTPS-Ecommerce/static/weight-loss/weight-loss-plan-2499-frame-427318463.png';

const desktopPricingFeatures = [
    'Daily Expert Access (10AM - 6PM) - Dedicated Dietitian & Health Counsellor',
    '6 Private 1-on-1 Consultations - 30 to 60 Min Sessions Every Month',
    'Fully Personalized Diet Plan based on your health, taste, routine & lifestyle',
    'Weekly Progress Tracking with App-Based Monitoring & Smart Guidance',
    'Advanced 5-Phase Proven Weight Loss System for faster visible results',
    'Day 1 Gut Health, Metabolism & Hormone Balance Optimization',
    'Strategic Nutrition Plan to reduce inflammation & support recovery',
    'Multiple Food Choices for Every Meal - no boring fixed diets',
    '100% Home Food Based Plan - practical, tasty & sustainable',
    'No Bounce Back Strategy - results designed to stay long-term',
    'Craving & Hunger Control Meal Structuring',
    'Belly Fat Focused Nutrition Approach',
    'Festival / Travel Friendly Diet Flexibility',
    'Mindful Eating Guidance for Better Control',
    '50+ Premium Fat Loss Recipes eBook FREE',
    'Priority 24x7 Chat Support whenever you need help',
];

function TickIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            className="h-4 w-4 shrink-0"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <circle cx="12" cy="12" r="12" fill="#FF850B" />
            <path
                d="M7 12.3L10.1 15.2L17 8.5"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function SectionTitle({ children, className = '' }) {
    return (
        <h2
            className={`text-[28px] md:text-[36px] lg:text-[46px] font-extrabold leading-[1.12] ${className}`}
            style={{ fontFamily: 'var(--font-epilogue), Epilogue, sans-serif' }}
        >
            {children}
        </h2>
    );
}

function SectionHeading({ label, title, description }) {
    return (
        <div className="mb-5 md:mb-8">
            <div className="mb-2 flex items-center gap-2">
                <span className="text-lg text-[#F5A623]">✦</span>
                <span className="text-base font-semibold text-[#016666]">{label}</span>
            </div>
            <SectionTitle className="text-[#1E1E1E]">{title}</SectionTitle>
            {description ? (
                <p className="mt-2 max-w-[760px] text-[13px] text-[#6B7280] md:text-[15px]">
                    {description}
                </p>
            ) : null}
        </div>
    );
}

function CheckIcon24() {
    return <TickIcon />;
}

function HeroMealArtwork() {
    return (
        <div className="relative mx-auto h-[280px] w-[280px] text-[#011666] sm:h-[300px] sm:w-[300px] md:h-[360px] md:w-[360px] lg:h-[400px] lg:w-[400px]">
            <Image
                src={THALI_IMAGE_URL}
                alt="Ghar Ka Khana thali"
                fill

                className="h-full w-full object-contain"
                quality={95}
                priority
            />
        </div>
    );
}

function HeroPlanSummaryCard({ onCheckout }) {
    return (
        <div className="mx-auto mt-6 w-full max-w-[1040px] overflow-hidden rounded-[24px] border border-[#E5E7EB] bg-white shadow-[0_18px_50px_rgba(17,24,39,0.08)] md:mt-8">
            <div className="grid lg:grid-cols-[220px_minmax(0,1fr)]">
                <div className="relative hidden overflow-hidden bg-[linear-gradient(180deg,#f6f1e7_0%,#fffaf1_100%)] lg:block">
                    <div className="absolute inset-x-0 bottom-0 top-0 bg-[radial-gradient(circle_at_top,_rgba(255,138,20,0.14),_transparent_58%)]" />
                    <Image
                        src={RECTANGLE_IMAGE_URL}
                        alt="Weight loss plan visual"
                        fill
                        sizes="220px"
                        className="object-contain object-center p-4"
                        quality={85}
                    />
                </div>

                <div className="p-5 md:p-7 lg:px-10 lg:py-8">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex h-full flex-col lg:max-w-[250px] lg:pr-4">
                            <span className="inline-flex rounded-full bg-[#FFF0E0] px-3 py-1 text-[11px] font-extrabold uppercase
                             tracking-[0.08em] text-[#FF8A14]">
                                Bestseller
                            </span>

                            <p className="mt-4 text-[13px] font-bold uppercase tracking-[0.08em] text-[#252525]">
                                Plan
                            </p>
                            <div className="mt-2 flex items-end gap-2.5">
                                <span className="text-[42px] font-extrabold leading-none text-[#045F5E] md:text-[48px]">
                                    ₹2,499
                                </span>
                                <span className="pb-1 text-[20px] font-semibold leading-none text-[#7A8291] line-through md:text-[22px]">
                                    ₹3,000
                                </span>
                            </div>

                            <p className="mt-3 max-w-[220px] text-[13px] leading-[1.5] text-[#6B7280]">
                                Personalized ghar ka khana based fat-loss plan with expert tracking, consultations, and daily support.
                            </p>

                            <button
                                type="button"
                                onClick={onCheckout}
                                className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-[#FF8A14] px-6 py-3.5 text-[14px] font-extrabold uppercase tracking-[0.03em] text-white transition-colors hover:bg-[#ea7c10] lg:mt-auto lg:max-w-[220px]"
                            >
                                Buy Now
                            </button>
                        </div>

                        <div className="min-w-0 flex-1">
                            <h3 className="text-[24px] font-extrabold leading-none text-[#252525] md:text-[28px]">
                                What you&apos;ll get:
                            </h3>

                            <div className="mt-5 grid gap-x-5 gap-y-3 sm:grid-cols-2">
                                {desktopPricingFeatures.map((feature) => (
                                    <div key={`summary-${feature}`} className="flex items-start gap-2.5 text-[13px] leading-[1.4] text-[#6B7280] md:text-[14px]">
                                        <CheckIcon24 />
                                        <span>{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function HeroOfferPill() {
    return (
        <div className="mt-6 inline-flex min-h-[58px] items-center justify-center gap-2 rounded-full border border-white/45 px-5 py-2.5 text-center md:gap-3 md:px-7 md:py-3">
            <span className="text-[13px] font-semibold uppercase tracking-[0.06em] text-white md:text-[14px]">
                Upto
            </span>
            <span className="text-[46px] font-extrabold leading-none text-[#FF8A14] md:text-[58px]">
                5
            </span>
            <span className="text-[13px] font-semibold uppercase tracking-[0.06em] text-white md:text-[14px]">
                Kgs in a month
            </span>
        </div>
    );
}

function HeroBanner() {
    return (
        <div className="overflow-hidden rounded-[12px] px-3 py-6 sm:px-5 sm:py-8 md:px-8 md:py-10 lg:px-12 lg:py-11">
            <div className="mx-auto w-full max-w-[980px]">
                <div className="grid items-center justify-center gap-4 sm:gap-6 md:gap-10 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-10">
                    <div className="order-1 flex h-full w-full justify-center">
                        <HeroMealArtwork />
                    </div>

                    <div className="order-2 text-center">
                        <h1
                            className="mx-auto max-w-[720px] text-[24px] font-[700] leading-[30px] text-white sm:text-[28px] sm:leading-[34px] md:hidden"
                            style={{ fontFamily: 'var(--font-epilogue), Epilogue, sans-serif' }}
                        >
                            <span className="block text-[26px] sm:text-[23px]">Guaranteed</span>
                            <span className="block">
                                <span className="text-[26px] text-white sm:text-[23px]">Weight Loss</span> with
                            </span>
                            <span className="block text-[42px] leading-[42px] text-[#FF8A14] sm:text-[40px] sm:leading-[36px]">Ghar Ka Khana</span>
                            <span className="block text-[42px] sm:text-[40px]">Diet Plan</span>
                        </h1>

                        <h1
                            className="hidden max-w-[720px] text-[40px] font-[700] leading-[46px] text-white md:block lg:text-[48px] lg:leading-[54px]"
                            style={{ fontFamily: 'var(--font-epilogue), Epilogue, sans-serif' }}
                        >
                            <span className="block whitespace-nowrap">
                                Guaranteed <span className="text-[#FF8A14]">Weight Loss</span>
                            </span>
                            <span className="block whitespace-nowrap">
                                with <span className="text-[#FF8A14]">Ghar Ka Khana</span> Diet Plan
                            </span>
                        </h1>

                        <div className="mx-auto mt-5 inline-flex w-full max-w-[94vw] min-h-[50px] flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-full border border-white px-3 py-2 sm:mt-7 sm:max-w-[336px] sm:min-h-[54px] sm:flex-nowrap sm:gap-2 sm:px-5 sm:py-2.5 md:min-h-[58px] md:max-w-none md:gap-3 md:px-9 lg:min-w-[370px] lg:px-10">
                            <span className="text-[10px] font-semibold uppercase leading-none tracking-[0.02em] text-white sm:text-[15px] md:text-[18px]">
                                UPTO
                            </span>
                            <span className="text-[34px] font-extrabold leading-none text-[#FF8A14] sm:text-[56px] md:text-[68px]">
                                5
                            </span>
                            <span className="text-[10px] font-semibold uppercase leading-none tracking-[0.02em] text-white sm:text-[15px] md:text-[18px]">
                                KGS IN A MONTH
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function WeightLossPlan2499Page() {
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        setIsHydrated(true);
    }, []);

    const handleCheckout = () => {
        const product = {
            id: '2499-plan-1-monthly',
            name: '2499 Plan - 1 Month Weight-Loss Program',
            duration: '1 Month',
            price: 2499,
            quantity: 1,
        };

        sessionStorage.setItem('checkoutProducts', JSON.stringify([product]));
        window.location.href = '/checkout';
    };

    return (
        <div className="bg-white site-shell pb-8 pt-4 md:pb-14 md:pt-[60px]">
            <div>
                <PageWrapper>
                    <div className="py-5 md:py-8 lg:py-6">
                        <section aria-label="Hero section">
                            <HeroBanner />
                        </section>
                    </div>
                </PageWrapper>
            </div>

            <section className="mt-6 w-full rounded-[16px] overflow-hidden md:mt-8" aria-label="Pricing section">
                {isHydrated ? (
                    <div className="w-full overflow-hidden p-0 md:p-3 lg:p-0">
                        <div className="lg:hidden">
                            <div className="w-full space-y-2.5">
                                <div className="relative h-[530px] w-full overflow-hidden rounded-[12px] border border-[#E4E4E4] shadow-[0_10px_24px_rgba(17,24,39,0.08)] sm:h-[300px]">
                                    <Image
                                        src={RECTANGLE_IMAGE_URL}
                                        alt="Weight loss plan preview"
                                        fill
                                        sizes="(max-width: 640px) 92vw, 360px"
                                        quality={90}
                                        className="object-cover object-top"
                                    />
                                </div>

                                <div className="relative overflow-hidden rounded-[12px] border border-[#E4E4E4] bg-white px-3 pb-3 pt-4 shadow-[0_10px_24px_rgba(17,24,39,0.08)]">
                                    <div className="pointer-events-none absolute -right-6 -top-10 z-10 h-[140px] w-[140px] rounded-full bg-[#FF850B]" />
                                    <span className="pointer-events-none absolute right-2 top-10 z-20 text-[14px] font-extrabold uppercase tracking-[0.02em] leading-none text-white">
                                        BESTSELLER
                                    </span>

                                    <div className="pr-16 mt-6">
                                        <p className="text-[10px] font-bold uppercase text-[#252525]">PLAN</p>
                                        <div className="mt-2 flex items-end gap-1.5">
                                            <span className="text-[42px] font-extrabold leading-none text-[#014E4E]">₹2,499</span>
                                            <span className="pb-1 text-[13px] font-semibold leading-none text-[#6B7280] line-through">₹3,000</span>
                                        </div>
                                    </div>

                                    <div className="mt-3 h-px w-full bg-black/30" />

                                    <h3 className="mt-3 text-[14px] font-extrabold text-[#1E1E1E]">What you&apos;ll get:</h3>
                                    <div className="mt-2.5 grid grid-cols-2 gap-1.5">
                                        {desktopPricingFeatures.map((feature) => (
                                            <div key={`hero-mobile-${feature}`} className="rounded-[6px] bg-[#F4F4F4] px-1.5 py-1.5">
                                                <div className="flex flex-col items-start gap-1 text-[8.5px] leading-[1.3] text-[#6B7280]">
                                                    <CheckIcon24 />
                                                    <span>{feature}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleCheckout}
                                        className="mt-3 inline-flex w-full items-center justify-center rounded-full bg-[#FF850B] px-4 py-2.5 text-[10px] font-bold uppercase text-white transition-colors hover:bg-[#ea7c10]"
                                    >
                                        BUY NOW
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="hidden w-full gap-6 lg:grid lg:grid-cols-[minmax(280px,28%)_minmax(0,1fr)] xl:gap-7 xl:grid-cols-[minmax(320px,30%)_minmax(0,1fr)] 2xl:grid-cols-[minmax(360px,30%)_minmax(0,1fr)]">
                            <div className="relative min-h-[600px] w-full overflow-hidden rounded-[12px] bg-[#F7F7F7] xl:min-h-[660px] 2xl:min-h-[720px]">
                                <Image
                                    src={RECTANGLE_IMAGE_URL}
                                    alt="Weight loss plan artwork"
                                    fill
                                    sizes="(max-width: 1279px) 28vw, (max-width: 1535px) 30vw, 30vw"
                                    quality={92}
                                    className="object-cover object-top"
                                />
                            </div>

                            <div className="relative flex min-h-[600px] w-full flex-col gap-8 overflow-hidden rounded-[12px] border border-[#E4E4E4] bg-white px-6 py-8 shadow-[0_0_4px_rgba(0,0,0,0.25)] xl:min-h-[660px] xl:px-8 xl:py-10 2xl:min-h-[720px]">
                                <div className="pointer-events-none absolute right-0 top-0 h-[140px] w-[140px] rounded-bl-[120px] bg-[#FF850B]" />
                                <span className="absolute right-4 top-8 z-10 text-[14px] font-semibold uppercase tracking-[0.02em] text-white">
                                    BESTSELLER
                                </span>

                                <div className="relative flex items-start justify-between gap-10">
                                    <div>
                                        <p className="text-[18px] font-semibold uppercase text-[#1E1E1E]">PLAN</p>
                                        <div className="mt-3 flex items-end gap-2">
                                            <span className="text-[48px] font-semibold leading-none text-[#014E4E] 2xl:text-[56px]">₹2,499</span>
                                            <span className="pb-1 text-[24px] font-semibold leading-none text-[#6B7280] line-through 2xl:text-[28px]">₹3,000</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="h-px w-[308px] bg-black/50" />

                                <div className="flex flex-1 flex-col">
                                    <h3 className="text-[20px] font-semibold leading-6 text-[#1E1E1E]">What you&apos;ll get:</h3>
                                    <div className="mt-4 grid grid-cols-4 gap-2 xl:gap-2.5">
                                        {desktopPricingFeatures.map((feature) => (
                                            <div key={`hero-desktop-${feature}`} className="rounded-[8px] bg-[#F4F4F4] px-2.5 py-2.5">
                                                <div className="flex flex-col items-start gap-1.5 text-[12px] leading-[1.45] text-[#6B7280]">
                                                    <CheckIcon24 />
                                                    <span>{feature}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleCheckout}
                                    className="inline-flex w-full items-center justify-center rounded-full bg-[#FF850B] px-4 py-3.5 text-[12px] font-bold uppercase text-white transition-colors hover:bg-[#ea7c10]"
                                >
                                    BUY NOW
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-full w-full rounded-[16px] bg-white/80" />
                )}
            </section>

            <div className="py-12 md:py-20">
                <div className="site-fill">
                    <div className="mb-10 flex flex-col gap-4 md:mb-14 md:flex-row md:items-end md:justify-between">
                        <div className="max-w-[630px] text-center md:text-left">
                            <div className="flex items-center justify-center gap-2 md:justify-start">
                                <span className="text-[#f5a623] text-lg">✦</span>
                                <span className="text-teal-600 text-base font-semibold">Our Testimonials</span>
                            </div>

                            <SectionTitle className="mt-2 text-[#1E1E1E]">
                                Success stories from our clients
                            </SectionTitle>

                            <p
                                className="mt-2 text-[12px] text-[#828283] md:text-[14px]"
                                style={{ fontFamily: 'Inter, sans-serif' }}
                            >
                                Choose a plan as per your requirements and start your wellness journey. See you around!
                            </p>
                        </div>
                    </div>

                    <TransformationGallery
                        page="weight-loss"
                        maxItems={6}
                        cardBackgroundClassName="bg-transparent"
                    />
                </div>
            </div>

            <div>
                <div className="hidden overflow-hidden rounded-[20px] bg-gray-100 lg:block">
                    <Image
                        src="https://ik.imagekit.io/br0mssyqj/tr:w-1200,q-75,f-auto,pr-true/DTPS-Ecommerce/static/gridfs-69b7c6b6a14dfc9fbf5ad567.jpg"
                        alt="Our Five-Cycle Program - Desktop"
                        width={1200}
                        height={600}
                        loading="lazy"
                        decoding="async"
                        sizes="(max-width: 1200px) 100vw, 1200px"
                        quality={75}
                        className="h-auto w-full"
                        placeholder="blur"
                        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIhAAAgEDAwUBAAAAAAAAAAAAAQIDAAQRBQYhEhMxQVFh/8QAFQEBAQAAAAAAAAAAAAAAAAAAAwT/xAAaEQACAgMAAAAAAAAAAAAAAAABAgADBBES/9oADAMBAAIRAxEAPwCzq+6ru21m5tLa1tYYYpGRXaNi7gEgFiSOT9wKiHerEkm0tySegf2lKYUNB5ZOiVYfJ//Z"
                    />
                </div>

                <div className="overflow-hidden rounded-[16px] bg-gray-100 lg:hidden">
                    <Image
                        src="https://ik.imagekit.io/br0mssyqj/tr:w-600,q-70,f-auto,pr-true/DTPS-Ecommerce/static/gridfs-69b7c6caa14dfc9fbf5ad56f.jpg"
                        alt="Our Five-Cycle Program - Mobile"
                        width={600}
                        height={800}
                        loading="lazy"
                        decoding="async"
                        sizes="100vw"
                        quality={70}
                        className="h-auto w-full"
                        placeholder="blur"
                        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIhAAAgEDAwUBAAAAAAAAAAAAAQIDAAQRBQYhEhMxQVFh/8QAFQEBAQAAAAAAAAAAAAAAAAAAAwT/xAAaEQACAgMAAAAAAAAAAAAAAAABAgADBBES/9oADAMBAAIRAxEAPwCzq+6ru21m5tLa1tYYYpGRXaNi7gEgFiSOT9wKiHerEkm0tySegf2lKYUNB5ZOiVYfJ//Z"
                    />
                </div>
            </div>



            <div className="py-14 md:py-24">
                <div className="site-fill">
                    <div className="mx-auto hidden w-[70%] overflow-hidden rounded-[20px] lg:block">
                        <Image
                            src="https://ik.imagekit.io/br0mssyqj/tr:w-900,q-75,f-auto,pr-true/DTPS-Ecommerce/static/gridfs-69b7c729a14dfc9fbf5ad70f.jpg"
                            alt="What to Expect - Desktop"
                            width={900}
                            height={450}
                            loading="lazy"
                            decoding="async"
                            sizes="(max-width: 1200px) 70vw, 840px"
                            quality={75}
                            className="h-auto w-full"
                            placeholder="blur"
                            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIhAAAgEDAwUBAAAAAAAAAAAAAQIDAAQRBQYhEhMxQVFh/8QAFQEBAQAAAAAAAAAAAAAAAAAAAwT/xAAaEQACAgMAAAAAAAAAAAAAAAABAgADBBES/9oADAMBAAIRAxEAPwCzq+6ru21m5tLa1tYYYpGRXaNi7gEgFiSOT9wKiHerEkm0tySegf2lKYUNB5ZOiVYfJ//Z"
                        />
                    </div>

                    <div className="overflow-hidden rounded-[16px] lg:hidden">
                        <Image
                            src="/images/what-to-expect-mobile.png"
                            alt="What to Expect - Mobile"
                            width={600}
                            height={800}
                            loading="lazy"
                            decoding="async"
                            sizes="100vw"
                            quality={70}
                            className="h-auto w-full"
                            placeholder="blur"
                            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIhAAAgEDAwUBAAAAAAAAAAAAAQIDAAQRBQYhEhMxQVFh/8QAFQEBAQAAAAAAAAAAAAAAAAAAAwT/xAAaEQACAgMAAAAAAAAAAAAAAAABAgADBBES/9oADAMBAAIRAxEAPwCzq+6ru21m5tLa1tYYYpGRXaNi7gEgFiSOT9wKiHerEkm0tySegf2lKYUNB5ZOiVYfJ//Z"
                        />
                    </div>
                </div>
            </div>

            <div>
                <div className="site-fill">
                    <div className="hidden overflow-hidden rounded-[20px] bg-gray-100 lg:block">
                        <Image
                            src="https://ik.imagekit.io/br0mssyqj/tr:w-1200,q-75,f-auto,pr-true/DTPS-Ecommerce/static/gridfs-69b7c710a14dfc9fbf5ad6a4.jpg"
                            alt="100% Money Back Guarantee - Desktop"
                            width={1200}
                            height={600}
                            loading="lazy"
                            decoding="async"
                            sizes="(max-width: 1200px) 100vw, 1200px"
                            quality={75}
                            className="h-auto w-full"
                            placeholder="blur"
                            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIhAAAgEDAwUBAAAAAAAAAAAAAQIDAAQRBQYhEhMxQVFh/8QAFQEBAQAAAAAAAAAAAAAAAAAAAwT/xAAaEQACAgMAAAAAAAAAAAAAAAABAgADBBES/9oADAMBAAIRAxEAPwCzq+6ru21m5tLa1tYYYpGRXaNi7gEgFiSOT9wKiHerEkm0tySegf2lKYUNB5ZOiVYfJ//Z"
                        />
                    </div>

                    <div className="overflow-hidden rounded-[16px] bg-gray-100 lg:hidden">
                        <Image
                            src="https://ik.imagekit.io/br0mssyqj/tr:w-600,q-70,f-auto,pr-true/DTPS-Ecommerce/static/gridfs-69b7c711a14dfc9fbf5ad6ab.jpg"
                            alt="100% Money Back Guarantee - Mobile"
                            width={600}
                            height={800}
                            loading="lazy"
                            decoding="async"
                            sizes="100vw"
                            quality={70}
                            className="h-auto w-full"
                            placeholder="blur"
                            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIhAAAgEDAwUBAAAAAAAAAAAAAQIDAAQRBQYhEhMxQVFh/8QAFQEBAQAAAAAAAAAAAAAAAAAAAwT/xAAaEQACAgMAAAAAAAAAAAAAAAABAgADBBES/9oADAMBAAIRAxEAPwCzq+6ru21m5tLa1tYYYpGRXaNi7gEgFiSOT9wKiHerEkm0tySegf2lKYUNB5ZOiVYfJ//Z"
                        />
                    </div>
                </div>
            </div>

            <div className="py-12 md:py-20">
                <div className="site-fill">
                    <div className="hidden overflow-hidden rounded-[20px] bg-gray-100 lg:block">
                        <Image
                            src="https://ik.imagekit.io/br0mssyqj/tr:w-1200,q-75,f-auto,pr-true/DTPS-Ecommerce/static/gridfs-69b7c732a14dfc9fbf5ad73f.jpg"
                            alt="What You Get - Desktop"
                            width={1200}
                            height={600}
                            loading="lazy"
                            decoding="async"
                            sizes="(max-width: 1200px) 100vw, 1200px"
                            quality={75}
                            className="h-auto w-full"
                            placeholder="blur"
                            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIhAAAgEDAwUBAAAAAAAAAAAAAQIDAAQRBQYhEhMxQVFh/8QAFQEBAQAAAAAAAAAAAAAAAAAAAwT/xAAaEQACAgMAAAAAAAAAAAAAAAABAgADBBES/9oADAMBAAIRAxEAPwCzq+6ru21m5tLa1tYYYpGRXaNi7gEgFiSOT9wKiHerEkm0tySegf2lKYUNB5ZOiVYfJ//Z"
                        />
                    </div>

                    <div className="overflow-hidden rounded-[16px] bg-gray-100 lg:hidden">
                        <Image
                            src="https://ik.imagekit.io/br0mssyqj/tr:w-600,q-70,f-auto,pr-true/DTPS-Ecommerce/static/gridfs-69b7c73ca14dfc9fbf5ad766.jpg"
                            alt="What You Get - Mobile"
                            width={600}
                            height={800}
                            loading="lazy"
                            decoding="async"
                            sizes="100vw"
                            quality={70}
                            className="h-auto w-full"
                            placeholder="blur"
                            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIhAAAgEDAwUBAAAAAAAAAAAAAQIDAAQRBQYhEhMxQVFh/8QAFQEBAQAAAAAAAAAAAAAAAAAAAwT/xAAaEQACAgMAAAAAAAAAAAAAAAABAgADBBES/9oADAMBAAIRAxEAPwCzq+6ru21m5tLa1tYYYpGRXaNi7gEgFiSOT9wKiHerEkm0tySegf2lKYUNB5ZOiVYfJ//Z"
                        />
                    </div>
                </div>
            </div>

            <div>
                <ExpertGuidanceSection />
            </div>

            <div>
                <div className="overflow-hidden rounded-[30px] bg-white py-16 md:py-20">
                    <div className="site-fill">
                        <div className="mb-6 flex flex-wrap items-start justify-between gap-4 md:mb-10 md:ml-2">
                            <div>
                                <div className="mb-2  flex items-center gap-2">
                                    <span className="text-[#ff9100] text-xl">✦</span>
                                    <span className="text-teal-600 text-base font-semibold">Hear from our Happy Clients</span>
                                </div>
                                <h2 className="text-[1.5rem] font-bold leading-tight text-gray-900 md:text-[2.5rem]">
                                    Tailored programs for<br />your wellness
                                </h2>
                            </div>
                        </div>
                    </div>

                    <div className="px-4 md:px-8 lg:px-10 xl:px-14">
                        <YouTubeShortsSlider desktopVisibleCount={5} />
                    </div>
                </div>
            </div>
            <section className="mt-6 w-full md:mt-8" aria-label="Our pricing section">
                <div className="w-full px-4 py-8 md:px-8 md:py-8">
                    <div className="mx-auto w-full max-w-[1080px]">
                        <div className="mb-6 text-center md:mb-8">
                            <div className="flex items-center justify-center gap-2">
                                <span className="text-[#f5a623] text-lg">✦</span>
                                <span className="text-teal-600 text-base font-semibold">Our Plan</span>
                            </div>
                            <SectionTitle className="mt-2 text-[#1E1E1E]">
                                Our Pricing
                            </SectionTitle>
                            <p className="mx-auto mt-2 max-w-[620px] text-[12px] text-[#828283] md:text-[14px]">
                                Join our plan today and begin a guided fat-loss journey with practical home-food based nutrition.
                            </p>
                        </div>

                        <div className="mx-auto w-full max-w-[360px] overflow-hidden rounded-[12px] border border-[#E4E4E4] bg-[#F8F8F8] shadow-[0_8px_20px_rgba(17,24,39,0.06)] md:hidden">
                            <div className="relative px-4 pb-5 pt-20">
                                <div className="absolute left-0 top-0 h-[76px] w-[102px] rounded-br-[90px] bg-[#FF8A14]">
                                    <span className="absolute left-3 top-6 text-[11px] font-extrabold uppercase tracking-[0.01em] text-white">
                                        BESTSELLER
                                    </span>
                                </div>

                                <p className="text-[20px] font-bold uppercase tracking-[0.02em] text-[#252525]">PLAN</p>
                                <div className="mt-1.5 flex items-end gap-2">
                                    <span className="text-[48px] font-extrabold leading-none text-[#045F5E]">₹2,499</span>
                                    <span className="pb-1 text-[24px] font-semibold leading-none text-[#7A8291] line-through">₹3,000</span>
                                </div>

                                <div className="mt-3 h-px w-full bg-[#BFC4CA]" />

                                <h3 className="mt-3 text-[14px] font-extrabold text-[#252525]">
                                    What you&apos;ll get:
                                </h3>

                                <div className="mt-2.5 space-y-1.5">
                                    {desktopPricingFeatures.map((feature) => (
                                        <div key={`program-pricing-mobile-${feature}`} className="flex items-start gap-1.5 text-[8.5px] leading-[1.35] text-[#6B7280]">
                                            <span className="mt-[1px] inline-flex h-3 w-3 flex-none items-center justify-center rounded-full bg-[#FF8A14]">
                                                <svg viewBox="0 0 12 12" className="h-[8px] w-[8px]" aria-hidden="true" focusable="false">
                                                    <path d="M4.85 8.55L2.2 5.9l.85-.85 1.8 1.8 4.1-4.1.85.85-4.95 4.95z" fill="white" />
                                                </svg>
                                            </span>
                                            <span>
                                                <span>{feature}</span>
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    type="button"
                                    onClick={handleCheckout}
                                    className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-[#FF8A14] px-8 py-2.5 text-[10px] font-extrabold uppercase text-white transition-colors hover:bg-[#ea7c10]"
                                >
                                    BUY NOW
                                </button>
                            </div>
                        </div>

                        <div className="hidden overflow-hidden rounded-[18px] border border-[#E4E4E4] bg-white shadow-[0_10px_24px_rgba(17,24,39,0.08)] md:block">
                            <div className="grid md:grid-cols-[300px_minmax(0,1fr)]">
                                <div className="relative border-r border-[#EFEFEF] px-7 pb-10 pt-28 md:flex md:flex-col md:items-start md:justify-center md:gap-28">
                                    <div className="absolute left-0 top-0 h-[140px] w-[140px] rounded-br-[110px] bg-[#FF8A14]">
                                        <span className="absolute left-4 top-9 text-[18px] font-extrabold uppercase tracking-[0.02em] text-white">
                                            BESTSELLER
                                        </span>
                                    </div>

                                    <div className="mt-[140px] flex-col items-end  gap-12 ">
                                        <p className="text-[14px] text-left font-bold uppercase tracking-[0.02em] text-[#252525]">
                                            PLAN
                                        </p>
                                        <div className="flex items-end gap-2 mt-2">
                                            <span className="text-[46px] font-extrabold leading-none text-[#045F5E]">
                                                ₹2,499
                                            </span>
                                            <span className="pb-1 text-[29px] font-semibold leading-none text-[#7A8291] line-through">
                                                ₹3,000
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleCheckout}
                                        className="mt-10 inline-flex w-full items-center justify-center rounded-full bg-[#FF8A14] px-8 py-3 text-[13px] font-extrabold uppercase text-white transition-colors hover:bg-[#ea7c10]"
                                    >
                                        BUY NOW
                                    </button>
                                </div>

                                <div className="px-7 py-8">
                                    <h3 className="text-[28px] font-bold leading-none text-[#252525]">
                                        What you&apos;ll get:
                                    </h3>

                                    <div className="mt-5 space-y-2.5">
                                        {desktopPricingFeatures.map((feature) => (
                                            <div key={`program-pricing-${feature}`} className="flex items-start gap-2.5 text-[14px] leading-[1.35] text-[#6B7280]">
                                                <CheckIcon24 />
                                                <span>{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <div className={SECTION_GAP}>
                <TestimonialsSection />
            </div>
        </div>
    );
}
