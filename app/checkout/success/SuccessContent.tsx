'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import FAQSection from '@/components/FAQSection';

interface Order {
  _id: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  total: number;
  paymentStatus: string;
  createdAt: string;
  products: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
}

const HERO_LOGO =
  'https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c675a14dfc9fbf5ad523.jpg';

const STEPS = [
  {
    title: 'Health Counsellor Connect',
    description:
      'Our health counsellor connects with you to understand your lifestyle and concerns.',
    icon: 'https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/home/how-it-work/step-icon-choose-plan-v2.png',
    alt: 'Health counsellor connect icon',
  },
  {
    title: 'Choose Your Plan',
    description:
      'Select a diet plan based on your goal, health condition, and duration.',
    icon: 'https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/home/how-it-work/step-icon-followups-tracking-v2.png',
    alt: 'Choose your plan icon',
  },
  {
    title: 'Dietitian Assessment Call',
    description:
      'Your assigned dietitian speaks with you to understand your lifestyle, food choices and health goals before planning your diet.',
    icon: 'https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/home/how-it-work/step-icon-counsellor-connect-v2.png',
    alt: 'Dietitian assessment call icon',
  },
  {
    title: 'Personalised Plan Delivery',
    description:
      'Your customised diet plan is shared on OUR APP within 24 hours of the assessment.',
    icon: 'https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/home/how-it-work/step-icon-dietitian-assessment-v2.png',
    alt: 'Personalised plan delivery icon',
  },
  {
    title: 'Follow-Ups & Tracking',
    description:
      'Weekly or requirement-based follow-ups to track progress and make timely adjustments.',
    icon: 'https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/home/how-it-work/step-icon-plan-delivery-v2.png',
    alt: 'Follow-ups and tracking icon',
  },
];

export function ThankYouHero({ order }: { order: Order | null }) {
  return (
    <section className="site-shell pt-4 md:pt-[40px] bg-white">
      <div className="relative overflow-hidden rounded-3xl bg-[#014E4E]">
        {/* Decorative leaves */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.10]">
          <div className="absolute left-[8%] top-[18%] h-[80px] w-[40px] rounded-full border border-white/30 rotate-[18deg]" />
          <div className="absolute right-[6%] top-[10%] h-[120px] w-[55px] rounded-full border border-white/25 rotate-[24deg]" />
          <div className="absolute left-[3%] bottom-[12%] h-[110px] w-[50px] rounded-full border border-white/25 rotate-[-18deg]" />
        </div>

        {/* Top centered logo */}
        <div className="relative z-[2] flex items-center justify-center pt-5 md:pt-7">
          <Link href="/" aria-label="Go to homepage" className="inline-flex">
            <Image
              src={HERO_LOGO}
              alt="Dietitian Poonam Sagar"
              width={180}
              height={60}
              className="h-[42px] w-auto md:h-[48px]"
              priority
            />
          </Link>
        </div>

        <div className="relative z-[2] hidden h-px w-full bg-white/10 md:mt-5 md:block" />

        {/* ================= MOBILE ================= */}
        <div className="relative z-[2] flex flex-col px-6 pb-8 md:hidden">
          <div className="relative mt-4 flex justify-center">
            <Image
              src="/images/thank-you-hero.svg"
              alt="Dietitian Poonam Sagar - 25 years of experience"
              width={415}
              height={539}
              className="h-auto w-full max-w-[420px]"
              priority
              unoptimized
            />
          </div>

          <div className="mt-4 text-left">
            <h1 className="text-[2rem] font-bold leading-[1.15] tracking-[-0.01em] text-white">
              Thank you!
              <br />
              You&apos;re on the path
              <br />
              to a positive change.
            </h1>
            <p className="mt-3 text-[0.85rem] leading-[1.65] text-white/80">
              Achieve your wellness goals with personalized guidance, expert support, and
              sustainable habits for a healthier, happier you.
            </p>
            {order ? (
              <div className="mt-4 inline-flex flex-wrap items-center gap-x-3 gap-y-1 rounded-full bg-white/10 px-3 py-1.5 text-[11px] text-white/90">
                <span>
                  Order <span className="font-semibold text-white">#{order.orderId}</span>
                </span>
                <span className="text-white/40">•</span>
                <span className="font-semibold text-[#FF9100]">
                  ₹{order.total.toLocaleString('en-IN')}
                </span>
              </div>
            ) : null}
          </div>
        </div>

        {/* ================= DESKTOP ================= */}
        <div className="relative z-[2] hidden md:grid md:grid-cols-2 md:items-end h-[520px] lg:h-[560px] xl:h-[600px] px-[52px] lg:px-[72px] xl:px-[96px]">
          {/* LEFT - Thank You text */}
          <div className="self-center pb-12 lg:pb-16 pr-6">
            <h1 className="text-[2.4rem] font-bold leading-[1.18] tracking-[-0.01em] text-white lg:text-[3rem] xl:text-[3.2rem]">
              Thank you!
              <br />
              You&apos;re on the path
              <br />
              to a positive change.
            </h1>
            <p className="mt-5 max-w-[460px] text-[0.95rem] leading-[1.75] text-white/75 lg:text-[1rem]">
              Achieve your wellness goals with personalized guidance, expert support, and
              sustainable habits for a healthier, happier you.
            </p>

            {order ? (
              <div className="mt-6 inline-flex flex-wrap items-center gap-x-4 gap-y-2 rounded-full bg-white/10 px-5 py-2.5 text-[13px] text-white/90 backdrop-blur-sm">
                <span>
                  Order <span className="font-semibold text-white">#{order.orderId}</span>
                </span>
                <span className="text-white/40">•</span>
                <span>
                  Paid{' '}
                  <span className="font-semibold text-[#FF9100]">
                    ₹{order.total.toLocaleString('en-IN')}
                  </span>
                </span>
                {order.products?.[0]?.name ? (
                  <>
                    <span className="text-white/40">•</span>
                    <span className="max-w-[260px] truncate">
                      Plan:{' '}
                      <span className="font-semibold text-white">
                        {order.products[0].name}
                        {order.products.length > 1 ? ` +${order.products.length - 1} more` : ''}
                      </span>
                    </span>
                  </>
                ) : null}
              </div>
            ) : null}
          </div>

          {/* RIGHT - SVG Composition */}
          <div className="relative flex items-end justify-end self-end">
            <Image
              src="/images/thank-you-hero.svg"
              alt="Dietitian Poonam Sagar - 25 years of experience"
              width={415}
              height={539}
              className="h-auto w-full max-w-[420px] lg:max-w-[460px] xl:max-w-[500px]"
              priority
              unoptimized
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export function WhatHappensNext() {
  return (
    <section className="site-shell mt-6 md:mt-10">
      {/* DESKTOP */}
      <div className="relative hidden md:block">
        <div
          className="relative overflow-hidden rounded-[30px] bg-[#014E4E] px-[52px] pt-[74px] pb-[80px]"
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
          <div className="site-fill">
            {/* Header */}
            <div className="flex items-start justify-between gap-10 px-[40px] lg:px-[80px]">
              <div className="max-w-[430px]">
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-[18px] leading-none text-[#FF850B]">✦</span>
                  <span className="text-[16px] font-semibold text-white">How It Work</span>
                </div>
                <h2 className="text-[40px] font-bold leading-[1.15] tracking-[-0.02em] text-white">
                  What
                  <br />
                  Happens Next
                </h2>
              </div>

              <p className="max-w-[415px] pt-8 text-[15px] leading-[1.75] text-white/90">
                Achieving your health goals has never been easier. Our step-by-step approach
                provides personalized guidance, actionable strategies, and ongoing support.
              </p>
            </div>

            {/* Steps */}
            <div className="relative mt-[60px] px-[40px] lg:px-[80px]">
              <div className="grid grid-cols-5 gap-6">
                {STEPS.map((step, index) => (
                  <div key={step.title} className="relative">
                    {index < STEPS.length - 1 ? (
                      <div
                        className="pointer-events-none absolute left-[74px] top-[32px] z-[1] flex items-center"
                        style={{ width: 'calc(100% - 50px)' }}
                      >
                        <Image
                          src="https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/home/how-it-work/step-connector-dashed-arrow-v2.png"
                          alt=""
                          width={170}
                          height={10}
                          className="h-auto w-full opacity-90"
                          aria-hidden="true"
                          loading="lazy"
                        />
                      </div>
                    ) : null}

                    <div className="relative mb-5 h-[72px]">
                      <div className="relative z-[2] flex h-[64px] w-[64px] items-center justify-center rounded-full">
                        <Image
                          src={step.icon}
                          alt={step.alt}
                          width={56}
                          height={56}
                          className="h-[56px] w-[56px] object-contain"
                          loading="lazy"
                        />
                      </div>

                      <div className="absolute left-[52px] top-[22px] z-[3] flex h-[20px] w-[20px] items-center justify-center rounded-full bg-[#FF850B] text-[10px] font-semibold text-white">
                        {index + 1}
                      </div>
                    </div>

                    <h3 className="text-[15px] font-semibold leading-[1.35] text-white">
                      {step.title}
                    </h3>
                    <p className="mt-2 max-w-[170px] text-[12.5px] leading-[1.6] text-white/85">
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE */}
      <div className="md:hidden">
        <div className="overflow-hidden rounded-[28px] bg-[#014E4E] px-4 pb-6 pt-7">
          <div className="mb-6 px-2">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-[13px] leading-none text-[#FF850B]">✦</span>
              <span className="text-[14px] font-semibold text-white">How It Work</span>
            </div>

            <h2 className="text-[30px] font-bold leading-[1.2] tracking-[-0.02em] text-white">
              Step-by-step guide to
              <br />
              your healthy journey
            </h2>

            <p className="mt-4 max-w-[320px] text-[12px] leading-[1.65] text-white/90">
              Achieving your health goals has never been easier. Our step-by-step approach
              provides personalized guidance, actionable strategies, and ongoing support.
            </p>
          </div>

          <div className="relative px-2">
            <div className="space-y-[18px]">
              {STEPS.map((step, index) => (
                <div key={step.title} className="relative flex items-start gap-[10px]">
                  {index < STEPS.length - 1 ? (
                    <div className="pointer-events-none absolute left-[11px] top-[54px] bottom-[-48px] border-l border-dotted border-white/45" />
                  ) : null}

                  <div className="relative z-[2] flex w-6 flex-shrink-0 justify-center pt-[30px]">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#FF850B] text-[12px] font-semibold leading-none text-white">
                      {index + 1}
                    </div>
                  </div>

                  <div className="min-w-0 flex-1 rounded-[16px] bg-[rgba(255,255,255,0.07)] px-3 py-3 shadow-[0_4px_6px_rgba(0,0,0,0.22)]">
                    <div className="flex items-center gap-3">
                      <Image
                        src={step.icon}
                        alt={step.alt}
                        width={64}
                        height={64}
                        className="h-16 w-16 flex-shrink-0 object-contain"
                        loading="lazy"
                      />
                      <div className="min-w-0">
                        <h3 className="text-[12px] font-semibold leading-[1.3] text-white">
                          {step.title}
                        </h3>
                        <p className="mt-1.5 text-[10px] leading-[1.4] text-white/90">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function OrderDetails({ order }: { order: Order }) {
  return (
    <section className="site-shell mt-6 md:mt-10">
      <div className="mx-auto max-w-[1010px] rounded-[22px] border border-[#F1F1F1] bg-white px-5 py-6 shadow-[0_0_20px_rgba(0,0,0,0.04)] md:px-8 md:py-7">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </span>
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-wide text-[#828283]">
                Payment Confirmed
              </p>
              <p className="text-[15px] font-semibold text-[#1E1E1E]">Order #{order.orderId}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] text-[#1E1E1E]">
            <div>
              <span className="text-[#828283]">Name: </span>
              <span className="font-semibold">{order.customerName}</span>
            </div>
            <div>
              <span className="text-[#828283]">Total: </span>
              <span className="font-bold text-[#FF850B]">
                ₹{order.total.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 border-t border-[#F1F1F1] pt-5 md:grid-cols-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#828283]">
              Email
            </p>
            <p className="mt-1 break-all text-[13px] font-medium text-[#1E1E1E]">
              {order.customerEmail}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#828283]">
              Phone
            </p>
            <p className="mt-1 text-[13px] font-medium text-[#1E1E1E]">{order.customerPhone}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#828283]">
              Plan(s)
            </p>
            <p className="mt-1 text-[13px] font-medium text-[#1E1E1E]">
              {order.products
                .map((p) => `${p.name}${p.quantity > 1 ? ` x${p.quantity}` : ''}`)
                .join(', ')}
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/"
            className="inline-flex h-[44px] items-center justify-center rounded-full bg-[#FF850B] px-6 text-[13px] font-bold text-white transition hover:opacity-95"
          >
            Back to Home
          </Link>
          <Link
            href="/contact"
            className="inline-flex h-[44px] items-center justify-center rounded-full border border-[#FF850B] px-6 text-[13px] font-bold text-[#FF850B] transition hover:bg-[#FFF3E6]"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/orders?orderId=${orderId}`);
        const data = await response.json();
        if (data.success && data.order) {
          setOrder(data.order);
        }
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-orange-600"></div>
        <p className="text-gray-600">Loading order details...</p>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <ThankYouHero order={order} />
      {order ? <OrderDetails order={order} /> : null}
      <WhatHappensNext />
      <FAQSection />
    </div>
  );
}
