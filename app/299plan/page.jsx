"use client";

import Image from 'next/image';

import PageWrapper from '@/components/PageWrapper';
import ExpertGuidanceSection from '@/components/ExpertGuidanceSection';
import YouTubeShortsSlider from '@/components/YouTubeShortsSlider';
import TestimonialsSection from '@/components/TestimonialsSection';
import TransformationGallery from '@/components/TransformationGallery';

const PAGE_GUTTER = 'px-5 md:px-[70px]';
const SECTION_GAP = 'mt-10 md:mt-14';

const pricingFeatures = [
    'Chat support',
    'Dietitian Consultation (02)',
    'Customized Meal Plan',
    'Progress Tracking',
    'Diet Recipe eBook (10+)',
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
                <span className="text-base font-semibold text-[#0D9488]">{label}</span>
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

function HeroPricingCard({ onCheckout }) {
    return (
        <div className="w-full max-w-[238px] rounded-[10px] bg-white px-[16px] py-[14px] shadow-[0_10px_26px_rgba(0,0,0,0.14)] md:max-w-[238px] md:px-[16px] md:py-[14px]">
            <p className="text-[10px] font-medium uppercase tracking-[0.03em] text-[#6B7280]">
                10 DAYS TRIAL
            </p>
            <p className="mt-1 text-[14px] font-bold uppercase leading-none text-[#1F2937]">
                PLAN
            </p>

            <div className="mt-4 flex items-end gap-1.5">
                <span className="text-[28px] font-extrabold leading-none text-[#014E4E] md:text-[29px]">
                    ₹299
                </span>
                <span className="pb-0.5 text-[13px] font-semibold leading-none text-[#8A8F98] line-through">
                    ₹999
                </span>
            </div>

            <div className="my-4 h-px bg-[#E8E8E8]" />

            <h3 className="text-[13px] font-bold text-[#252525]">What you&apos;ll get:</h3>

            <div className="mt-3 space-y-2">
                {pricingFeatures.map((feature) => (
                    <div key={`hero-${feature}`} className="flex items-start gap-2 text-[12px] leading-[1.35] text-[#7A7A7A]">
                        <CheckIcon24 />
                        <span>{feature}</span>
                    </div>
                ))}
            </div>

            <p className="mt-4 text-[10px] leading-[1.45] text-[#8B8B8B]">
                Stay on track: weekly check-ins to ensure your progress.
            </p>

            <button
                type="button"
                onClick={onCheckout}
                className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-[#FF8A14] px-4 py-3 text-[11px] font-bold uppercase tracking-[0.03em] text-white transition-colors hover:bg-[#ea7c10]"
            >
                Buy Now
            </button>
        </div>
    );
}

export default function Plan299Page() {
    const handleCheckout = () => {
        const product = {
            id: '299-plan-healthy-monthly',
            name: '299 Plan - Healthy Monthly Program',
            price: 299,
            quantity: 1,
        };

        sessionStorage.setItem('checkoutProducts', JSON.stringify([product]));
        window.location.href = '/checkout';
    };

    return (
        <section className="site-shell bg-white pb-8 pt-4 md:pb-14 md:pt-[60px]">
            <section>
                <PageWrapper>
                    <div className="relative overflow-hidden rounded-[28px] bg-[#045C5C] px-5 py-7 md:px-8 md:py-8 lg:px-8 lg:py-5">
                        <div className="relative z-10 flex flex-col gap-8 lg:grid lg:grid-cols-[minmax(0,1fr)_238px] lg:items-center lg:gap-10">
                            <div className="flex flex-col items-center justify-center text-center lg:px-6 lg:py-10">
                                <h1 className="max-w-[720px] text-[2rem] font-extrabold leading-[1.08] text-white md:text-[3.15rem] lg:text-[3.55rem]">
                                    Guaranteed <span className="text-[#FF8A14]">Weight Loss</span>
                                    <br />
                                    with <span className="text-[#FF8A14]">Ghar Ka Khana</span> Diet Plan
                                </h1>

                                <div className="mt-7 inline-flex min-h-[54px] items-center justify-center gap-2 rounded-full border border-white px-5 py-2.5 md:min-h-[58px] md:gap-3 md:px-9 lg:min-w-[370px] lg:px-10">
                                    <span className="text-[15px] font-semibold uppercase leading-none tracking-[0.02em] text-white md:text-[18px]">
                                        UPTO
                                    </span>
                                    <span className="text-[56px] font-extrabold leading-none text-[#FF8A14] md:text-[68px]">
                                        5
                                    </span>
                                    <span className="text-[15px] font-semibold uppercase leading-none tracking-[0.02em] text-white md:text-[18px]">
                                        KGS IN A MONTH
                                    </span>
                                </div>
                            </div>

                            <div className="mx-auto lg:mx-0 lg:justify-self-end">
                                <HeroPricingCard onCheckout={handleCheckout} />
                            </div>
                        </div>
                    </div>
                </PageWrapper>
            </section>

            <section className="py-12 md:py-20">
                <div className="site-fill">
                    <div className="mb-10 flex flex-col gap-4 md:mb-14 md:flex-row md:items-end md:justify-between">
                        <div className="max-w-[630px]">
                            <div className="flex items-center gap-2">
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
            </section>

            <section>
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
            </section>

            <section className="py-14 md:py-24">
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
            </section>

            <section>
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
            </section>

            <section className="py-12 md:py-20">
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
            </section>

            <div>
                <ExpertGuidanceSection />
            </div>

            <div className="site-shell">
                <section className="overflow-hidden rounded-[30px] bg-white py-16 md:py-20">
                    <div className="site-fill">
                        <div className="mb-6 flex flex-wrap items-start justify-between gap-4 md:mb-10">
                            <div>
                                <div className="mb-2 flex items-center gap-2">
                                    <span className="text-[#ff9100] text-xl">✦</span>
                                    <span className="text-teal-600 text-base font-semibold">Hear from our Happy Clients</span>
                                </div>
                                <h2 className="text-[1.5rem] font-bold leading-tight text-gray-900 md:text-[2.5rem]">
                                    Tailored programs for<br />your wellness
                                </h2>
                            </div>
                        </div>
                        <YouTubeShortsSlider />
                    </div>
                </section>
            </div>

            <section className={`${PAGE_GUTTER} ${SECTION_GAP}`}>
                <div className="bg-white py-[72px] md:py-[120px]">
                    <div className="mx-auto max-w-[860px] text-center">
                        <div className="mb-1 flex items-center justify-center gap-1.5">
                            <span className="text-[10px] text-[#f5a623]">✦</span>
                            <span className="text-[10px] font-medium text-[#0D9488] md:text-[11px]">Our Testimonials</span>
                        </div>

                        <h2 className="text-[2rem] font-extrabold leading-none text-[#252525] md:text-[3rem]">
                            Our Pricing
                        </h2>

                        <p className="mx-auto mt-2 max-w-[520px] text-[11px] text-[#8B8B8B] md:text-[12px]">
                            Join our Plan today and embark on a journey to better health with our weight loss plan!
                        </p>

                        <div className="mx-auto mt-10 max-w-[690px] rounded-[14px] border border-[#E8E8E8] bg-white p-6 shadow-[0_4px_18px_rgba(0,0,0,0.05)] md:p-6">
                            <div className="grid gap-6 md:grid-cols-[0.95fr_1.05fr] md:gap-7">
                                <div className="border-b border-[#EAEAEA] pb-6 text-left md:border-b-0 md:border-r md:pb-0 md:pr-7">
                                    <div className="mb-6 flex items-start justify-between gap-4">
                                        <div>
                                            <p className="text-[13px] font-semibold uppercase tracking-[0.02em] text-[#6B7280]">
                                                10 DAYS TRIAL
                                            </p>
                                            <p className="text-[34px] font-semibold leading-none text-[#1E1E1E] md:text-[16px] md:leading-tight">
                                                PLAN
                                            </p>
                                        </div>
                                        <span className="inline-flex rounded-full border border-[#FF850B] px-4 py-1 text-[10px] font-bold uppercase tracking-[0.05em] text-[#1E1E1E]">
                                            Trial
                                        </span>
                                    </div>

                                    <div className="mb-8 flex items-end gap-2">
                                        <span className="text-[52px] font-bold leading-none text-[#014E4E] md:text-[48px]">
                                            ₹299
                                        </span>
                                        <span className="pb-1 text-[17px] font-semibold text-[#8A8F98] line-through">
                                            ₹999
                                        </span>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleCheckout}
                                        className="inline-flex min-w-[138px] items-center justify-center rounded-full bg-[#FF8A14] px-8 py-3 text-[12px] font-bold uppercase tracking-[0.03em] text-white transition-colors hover:bg-[#ea7c10]"
                                    >
                                        Buy Now
                                    </button>
                                </div>

                                <div className="text-left">
                                    <h3 className="mb-4 text-[26px] font-semibold leading-none text-[#252525] md:text-[16px]">
                                        What you&apos;ll get:
                                    </h3>

                                    <div className="space-y-2.5">
                                        {pricingFeatures.map((feature) => (
                                            <div key={feature} className="flex items-start gap-2.5 text-[14px] text-[#6B7280] md:text-[13px]">
                                                <CheckIcon24 />
                                                <span>{feature}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <p className="mt-4 max-w-[250px] text-[11px] leading-[1.45] text-[#8B8B8B]">
                                        Stay on track: weekly check-ins to ensure your progress.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className={SECTION_GAP}>
                <TestimonialsSection />
            </section>
        </section>
    );
}
