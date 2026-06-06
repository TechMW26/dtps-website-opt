'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import AboutUsSection from '@/components/AboutUsSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import YouTubeShortsSlider from '@/components/YouTubeShortsSlider';
import LeadFormMultiStep from '@/components/weight-loss/LeadFormMultiStep';
import ResponsiveWhyChooseDtpsTable from '@/components/weight-loss/ResponsiveWhyChooseDtpsTable';

const NAVBAR_LOGO_SRC = 'https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c675a14dfc9fbf5ad523.jpg';
const HOME_HERO_IMAGE_MOBILE = 'https://ik.imagekit.io/br0mssyqj/tr:w-400,q-75,f-auto/DTPS-Ecommerce/static/home/hero/dtps-hero-poonam-sagar-v2.png';
const HOME_HERO_IMAGE_DESKTOP = 'https://ik.imagekit.io/br0mssyqj/tr:w-600,q-80,f-auto/DTPS-Ecommerce/static/home/hero/dtps-hero-poonam-sagar-v2.png';

interface Props {
    formId?: string;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <div className="mb-2 flex items-center gap-2">
            <span className="text-lg text-[#F5A623]">✦</span>
            <span className="text-base font-semibold text-[#0D9488]">{children}</span>
        </div>
    );
}

export default function LeadFormLandingPage({ formId = '1' }: Props) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [offerSeconds, setOfferSeconds] = useState(4 * 60 + 58);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isFormOpen) return;

        const previousBodyOverflow = document.body.style.overflow;
        const previousHtmlOverflow = document.documentElement.style.overflow;
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsFormOpen(false);
            }
        };

        window.addEventListener('keydown', handleEscape);
        return () => {
            document.body.style.overflow = previousBodyOverflow;
            document.documentElement.style.overflow = previousHtmlOverflow;
            window.removeEventListener('keydown', handleEscape);
        };
    }, [isFormOpen]);

    useEffect(() => {
        if (!isMounted) return;

        const timer = window.setInterval(() => {
            setOfferSeconds((current) => (current > 0 ? current - 1 : 0));
        }, 1000);

        return () => window.clearInterval(timer);
    }, [isMounted]);

    const offerMinutes = String(Math.floor(offerSeconds / 60)).padStart(2, '0');
    const offerRemainingSeconds = String(offerSeconds % 60).padStart(2, '0');
    const displayOfferMinutes = isMounted ? offerMinutes : '04';
    const displayOfferRemainingSeconds = isMounted ? offerRemainingSeconds : '58';

    return (
        <div className="site-shell bg-white pb-36 pt-4 md:pb-40 md:pt-[60px] lg:pb-44">
            <section className="relative overflow-hidden rounded-[28px] bg-[#045F5E] px-4 pb-0 pt-5 text-white sm:px-6 md:px-10 md:pt-8 lg:px-12 lg:pt-8">
                <div className="pointer-events-none absolute left-12 top-40 hidden h-16 w-16 opacity-15 lg:block">
                    <svg viewBox="0 0 64 64" fill="none" className="h-full w-full stroke-white">
                        <path d="M52 12C32 14 18 28 12 52C32 50 46 36 52 12Z" strokeWidth="2" />
                        <path d="M22 42C26 34 34 26 42 22" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                </div>
                <div className="pointer-events-none absolute right-6 top-7 hidden h-20 w-20 opacity-15 lg:block">
                    <svg viewBox="0 0 64 64" fill="none" className="h-full w-full stroke-white">
                        <path d="M52 12C32 14 18 28 12 52C32 50 46 36 52 12Z" strokeWidth="2" />
                        <path d="M22 42C26 34 34 26 42 22" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                </div>

                <div className="relative z-10 flex justify-center">
                    <Link href="/" className="flex items-center shrink-0">
                        <Image
                            src={NAVBAR_LOGO_SRC}
                            alt="Dietitian Poonam Sagar"
                            width={180}
                            height={60}
                            className="h-[42px] w-auto xl:h-[48px]"
                            priority
                        />
                    </Link>
                </div>

                <div className="-mx-4 mt-4 h-px w-[calc(100%+2rem)] bg-white/10 sm:-mx-6 sm:w-[calc(100%+3rem)] md:-mx-10 md:w-[calc(100%+5rem)] lg:-mx-12 lg:w-[calc(100%+6rem)]" />

                <div className="relative z-10 grid items-end gap-6 pt-8 md:gap-8 md:pt-10 lg:grid-cols-[minmax(0,1fr)_500px] xl:grid-cols-[minmax(0,1fr)_540px]">
                    <div className="order-2 pb-8 text-center lg:order-1 lg:max-w-[410px] lg:pb-24 lg:pl-6 lg:text-left xl:pl-10">
                        <h1
                            className="mx-auto max-w-[300px] text-[30px] font-extrabold leading-[1.08] text-white sm:max-w-[360px] sm:text-[38px] md:max-w-[390px] md:text-[46px] lg:mx-0 lg:max-w-[390px] lg:text-[52px] lg:leading-[1.06] xl:text-[58px]"
                            style={{ fontFamily: 'var(--font-epilogue), Epilogue, sans-serif' }}
                        >
                            <span className="block whitespace-nowrap">Guaranteed</span>
                            <span className="block whitespace-nowrap">Weight Loss with</span>
                            <span className="block whitespace-nowrap">Ghar Ka Khana</span>
                            <span className="block whitespace-nowrap">Diet Plan</span>
                        </h1>

                        <p className="mx-auto mt-4 max-w-[380px] text-[9px] leading-5 text-white/72 sm:max-w-[430px] sm:text-[10px] lg:mx-0 lg:mt-5 lg:max-w-[430px] lg:text-[12px] lg:leading-5">
                            <span className="block whitespace-nowrap">Achieve your wellness goals with personalized guidance, expert support, and</span>
                            <span className="block whitespace-nowrap">sustainable habits for a healthier, happier you.</span>
                        </p>

                        <button
                            type="button"
                            onClick={() => setIsFormOpen(true)}
                            className="mt-6 inline-flex items-center justify-center rounded-full bg-[#FF8A14] px-9 py-3.5 text-[13px] font-semibold text-white shadow-[0_14px_30px_rgba(255,138,20,0.28)] transition hover:bg-[#ea7c10] sm:px-10 sm:text-[14px] lg:mt-7 lg:px-11 lg:py-4 lg:text-[15px]"
                        >
                            Book Appointment
                        </button>
                    </div>

                    <div className="order-1 flex justify-center lg:order-2 lg:justify-end lg:self-end">
                        <div className="relative w-full max-w-[320px] sm:max-w-[360px] lg:max-w-[430px] xl:max-w-[470px]">
                            <Image
                                src={HOME_HERO_IMAGE_MOBILE}
                                alt="Dietitian Poonam Sagar"
                                width={340}
                                height={380}
                                className="h-auto w-full lg:hidden"
                                priority
                            />
                            <Image
                                src={HOME_HERO_IMAGE_DESKTOP}
                                alt="Dietitian Poonam Sagar"
                                width={600}
                                height={600}
                                className="hidden h-auto w-full lg:block"
                                priority
                            />

                            <div className="absolute right-0 top-[48%] rounded-[12px] bg-[#FF8A14] px-4 py-2.5 shadow-[0_16px_30px_rgba(255,138,20,0.3)] sm:right-1 lg:right-[4px] lg:top-[52%]">
                                <div className="flex items-center gap-2">
                                    <span className="text-[24px] font-extrabold leading-none text-white sm:text-[30px]">
                                        25+
                                    </span>
                                    <span className="text-[9px] font-medium leading-[1.15] text-white sm:text-[11px]">
                                        Years of
                                        <br />
                                        experience
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="fixed inset-x-0 bottom-0 z-40">
                <div className="flex min-h-[78px] items-center justify-between border border-[#F3C496] border-t-2 border-t-[#FFB16B] bg-white px-4 py-4 shadow-[0_-2px_12px_rgba(0,0,0,0.04)] sm:min-h-[86px] sm:px-6 sm:py-[18px] md:min-h-[94px] md:px-8 md:py-5 lg:px-10">
                    <div className="text-[12px] leading-[1.2] text-[#6B7280] md:text-[13px]">
                        <p className="font-medium">Offer Will Expire in</p>
                        <p className="mt-1 text-[20px] font-bold leading-none text-[#1F2937] md:text-[22px]" suppressHydrationWarning>
                            <span className="text-[#FF8A14]">{displayOfferMinutes}</span> Minutes <span className="text-[#FF8A14]">{displayOfferRemainingSeconds}</span> Seconds
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setIsFormOpen(true)}
                        className="rounded-full bg-[#FF8A14] px-6 py-3 text-[11px] font-semibold text-white transition hover:bg-[#ea7c10] sm:px-7 sm:py-3 sm:text-[12px] md:px-8 md:py-3.5 md:text-[13px]"
                    >
                        Book Your Free Consultation
                    </button>
                </div>
            </div>

            <div className="mt-10 md:mt-16">
                <AboutUsSection />
            </div>

            <section className="mt-10 md:mt-16">
                <div className="hidden overflow-hidden rounded-[28px] lg:block">
                    <Image
                        src="/Section%2028.jpg"
                        alt="Our 5-Cycle, Science Based Weight Loss Process"
                        width={1882}
                        height={1068}
                        className="h-auto w-full"
                        loading="lazy"
                    />
                </div>

                <div className="overflow-hidden rounded-[24px] lg:hidden">
                    <Image
                        src="/Section%2025.jpg"
                        alt="Our 5-Cycle, Science Based Weight Loss Process"
                        width={790}
                        height={697}
                        className="h-auto w-full"
                        loading="lazy"
                    />
                </div>
            </section>

            <div className="mt-10 md:mt-16">
                <ResponsiveWhyChooseDtpsTable />
            </div>

            <section className="mt-10 rounded-[28px] bg-white py-6 md:mt-16 md:py-10">
                <div className="site-fill">
                    <div className="mb-6 flex items-start justify-between gap-4">
                        <div>
                            <SectionLabel>Our Programs</SectionLabel>
                            <h2
                                className="text-[1.9rem] font-bold leading-tight text-[#1E1E1E] md:text-[2.6rem]"
                                style={{ fontFamily: 'var(--font-epilogue), Epilogue, sans-serif' }}
                            >
                                Tailored programs for
                                <br />
                                your wellness
                            </h2>
                        </div>
                    </div>

                    <YouTubeShortsSlider desktopVisibleCount={3} />
                </div>
            </section>

            <div className="mt-10 md:mt-16">
                <TestimonialsSection />
            </div>

            {isFormOpen && (
                <>
                    <div
                        className="fixed inset-0 z-50 bg-black/60 transition-opacity duration-300"
                        onClick={() => setIsFormOpen(false)}
                        aria-hidden="true"
                    />

                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 lg:p-6">
                        <div className="mx-auto flex w-full max-w-[1120px] items-center justify-center">
                            <div className="max-h-[calc(100vh-24px)] w-full overflow-y-auto sm:max-h-[calc(100vh-32px)] lg:max-h-[calc(100vh-48px)]">
                                <LeadFormMultiStep
                                    formId={formId}
                                    variant="sheet"
                                    onClose={() => setIsFormOpen(false)}
                                />
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}