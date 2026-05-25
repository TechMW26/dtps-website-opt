'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';

type FaqItem = {
    question: string;
    answer: string;
};

const faqs: FaqItem[] = [
    {
        question: 'Will I get a personal dietitian after enrollment?',
        answer:
            'Yes, a dedicated dietitian will be assigned to guide you throughout your journey. Your dietitian will understand your health goals, lifestyle, food preferences, and medical conditions (if any) to create a personalized diet plan for you.',
    },
    {
        question: 'Are the results guaranteed?',
        answer:
            'Results may vary from person to person depending on factors such as body type, metabolism, medical conditions, lifestyle, consistency, and how well the plan is followed. At DTPS, we focus on providing personalized guidance, balanced nutrition, and continuous support to help you achieve sustainable and healthy results in the best possible way.',
    },
    {
        question: 'How will I receive my diet plan?',
        answer:
            'Your personalized diet plan will be shared through the DTPS Application after your enrollment process is completed. You can easily access your diet charts, meal updates, progress tracking, and guidance directly from the app anytime during your program.',
    },
    {
        question: 'What is included in the 10-day trial plan?',
        answer:
            'The 10-day trial plan includes a personalized diet plan. This trial is designed to help you understand the program structure, experience the diet pattern, and begin your healthy weight management journey.',
    },
    {
        question: 'Will I regain weight after completing the program?',
        answer:
            'The DTPS program focuses on building sustainable eating habits and lifestyle changes rather than temporary dieting. However, maintaining results also depends on long-term consistency and lifestyle management.',
    },
    {
        question: 'What are the customer support timings?',
        answer:
            'DTPS customer support is available from 10:00 AM to 6:00 PM, Monday to Saturday. You can connect with the support team during working hours for any assistance related to your plan, app, payments, or consultations.',
    },
    {
        question: 'What happens if I am not satisfied with the service?',
        answer:
            'If you are not satisfied with the service, you can connect with your assigned dietitian, Health Counselor or the DTPS support team to share your concerns. The team will review the issue and try to provide the best possible resolution, guidance, or necessary adjustments to improve your experience.',
    },
    {
        question: 'Can I pause my plan if I am traveling?',
        answer:
            'Yes, in certain situations, your plan can be paused if you are traveling or have unavoidable commitments. You can inform your assigned dietitian or Health counselor in advance, and they will guide you according to the plan policy and available pause options.',
    },
    {
        question: 'Is the diet plan scientifically designed?',
        answer:
            'Yes, the DTPS diet plans are designed using scientifically balanced nutrition principles and are personalized according to your body type, lifestyle, eating habits, and health goals. The focus is on creating sustainable, practical, and healthy eating patterns rather than extreme dieting or starvation methods.',
    },
];

export default function HelpPage() {
    const [openIndex, setOpenIndex] = useState<number>(0);

    return (
        <main className="min-h-screen bg-[#F3F4F5]">
            <section className="hero-section site-shell pt-4 md:pt-[60px]">
                <div className="w-full overflow-hidden rounded-3xl bg-[#014E4E]">
                    <div className="relative w-full">
                        <Navbar />

                        <div className="flex w-full flex-col items-center px-5 pb-14 pt-10 text-center md:hidden">
                            <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.2em] text-[#FF850B]">
                                Help
                            </p>
                            <h1 className="mb-3 max-w-[9.5ch] text-[2.85rem] font-bold leading-[1.08] text-white">
                                How can we <span className="text-[#FF850B]">help</span> you?
                            </h1>
                            <p className="mt-1 max-w-[29ch] text-[13px] leading-[1.6] text-white/80">
                                Search our knowledge base or browse
                                categories below.
                            </p>
                        </div>

                        <div className="hidden w-full flex-col items-center py-16 text-center md:flex lg:py-[82px]">
                            <p className="mb-4 text-[13px] font-semibold uppercase tracking-[0.22em] text-[#FF850B]">
                                Help
                            </p>
                            <h1 className="mb-2 text-[3.35rem] font-bold leading-[1.15] text-white">
                                How can we <span className="text-[#FF850B]">help</span> you?
                            </h1>
                            <p className="mt-4 max-w-[640px] px-6 text-[15px] leading-[1.7] text-white/80">
                                Search our knowledge base or browse categories below.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="site-shell pb-20 pt-8 md:pb-24 md:pt-16">
                <article className="mx-auto max-w-[860px] text-[14px] leading-[1.75] text-[#27343A] md:text-[16px]">
                    <h2 className="mb-4 max-w-full break-words text-[1.75rem] font-bold leading-[1.2] text-[#093F46] sm:text-[2rem] md:mb-8 md:text-[50px]">
                        General Questions
                    </h2>

                    <div className="mb-5 h-[1px] w-full bg-[#DBDFE2] md:mb-9" />

                    <div className="space-y-3 md:space-y-4">
                        {faqs.map((item, index) => {
                            const isOpen = index === openIndex;

                            return (
                                <article
                                    key={item.question}
                                    className="overflow-hidden rounded-xl border border-[#DDE1E4] bg-white"
                                >
                                    <button
                                        type="button"
                                        onClick={() => setOpenIndex((prev) => (prev === index ? -1 : index))}
                                        className="flex w-full items-center justify-between gap-3 px-4 py-[14px] text-left md:px-6 md:py-5"
                                        aria-expanded={isOpen}
                                    >
                                        <span className="max-w-full break-words text-[1.04rem] font-bold leading-[1.45] text-[#093F46] sm:text-[1.2rem] md:text-[22px]">
                                            {item.question}
                                        </span>
                                        <span className="shrink-0 text-[#0A5B5B]">
                                            <svg
                                                width="18"
                                                height="18"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                                className={isOpen ? 'rotate-180 transition-transform duration-300' : 'transition-transform duration-300'}
                                            >
                                                <path
                                                    d="M6 9L12 15L18 9"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        </span>
                                    </button>

                                    <div
                                        className={`grid overflow-hidden transition-all duration-300 ease-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                                            }`}
                                    >
                                        <div className={`min-h-0 ${isOpen ? 'border-t border-[#E8ECEE]' : 'border-t border-transparent'}`}>
                                            <div className="px-4 pb-4 pt-3 md:px-6 md:pb-5 md:pt-4">
                                                <p className="text-[12px] leading-[1.65] text-[#27343A] md:text-[16px]">{item.answer}</p>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </article>

                <div className="mx-auto mt-8 max-w-[860px] rounded-[18px] bg-[#E7E9EB] px-4 py-8 md:mt-14 md:rounded-2xl md:px-8 md:py-10">
                    <div className="text-center">
                        <h3 className="mb-2 max-w-full break-words text-[1.45rem] font-bold leading-[1.2] text-[#093F46] sm:text-[1.55rem] md:mb-5 md:text-[43px]">
                            Still have questions?
                        </h3>
                        <p className="text-[13px] leading-[1.55] text-[#4D5A60] md:text-[16px] md:leading-[1.75]">
                            Our team is here to support your journey to better health.
                        </p>
                    </div>

                    <div className="mt-6 grid gap-3.5 md:mt-8 md:grid-cols-2 md:gap-5">
                        <div className="rounded-md border border-[#E4E7E9] bg-white px-5 py-8 text-center md:rounded-xl md:px-8 md:py-8">
                            <div className="mx-auto inline-flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#FF850B] text-white">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M4 6H20V18H4V6Z" stroke="currentColor" strokeWidth="2" />
                                    <path d="M4 7L12 13L20 7" stroke="currentColor" strokeWidth="2" />
                                </svg>
                            </div>
                            <h4 className="mt-4 text-[1.2rem] font-bold leading-[1.28] text-[#093F46] sm:text-[1.25rem] md:text-[24px]">Email Support</h4>
                            <p className="mt-1 text-[13px] leading-[1.5] text-[#27343A] md:text-[16px]">Drop us a line anytime</p>
                            <a href="mailto:support@dtpoonamsagar.com" className="mt-3 block text-[13px] font-semibold text-[#0A5B5B] md:text-[16px]">
                                support@dtpoonamsagar.com
                            </a>
                        </div>

                        <div className="rounded-md border border-[#E4E7E9] bg-white px-5 py-8 text-center md:rounded-xl md:px-8 md:py-8">
                            <div className="mx-auto inline-flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#FF850B] text-white">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M6 5H18C19.1046 5 20 5.89543 20 7V14C20 15.1046 19.1046 16 18 16H12L8 19V16H6C4.89543 16 4 15.1046 4 14V7C4 5.89543 4.89543 5 6 5Z"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </div>
                            <h4 className="mt-4 text-[1.2rem] font-bold leading-[1.28] text-[#093F46] sm:text-[1.25rem] md:text-[24px]">Call/WhatsApp</h4>
                            <p className="mt-1 text-[13px] leading-[1.5] text-[#27343A] md:text-[16px]">Mon-Sat, 9:00 AM - 7:00 PM IST</p>
                            <a href="tel:+919893027688" className="mt-3 block text-[13px] font-semibold text-[#0A5B5B] md:text-[16px]">
                                +91 98930 27688
                            </a>
                        </div>

                        <div className="rounded-md border border-[#E4E7E9] bg-white px-5 py-8 text-center md:col-span-2 md:rounded-xl md:px-8 md:py-8">
                            <div className="mx-auto inline-flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#FF850B] text-white">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M12 13.5C13.3807 13.5 14.5 12.3807 14.5 11C14.5 9.61929 13.3807 8.5 12 8.5C10.6193 8.5 9.5 9.61929 9.5 11C9.5 12.3807 10.6193 13.5 12 13.5Z"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    />
                                    <path
                                        d="M4.5 10.5C4.5 6.35786 7.85786 3 12 3C16.1421 3 19.5 6.35786 19.5 10.5C19.5 15.4196 14.3333 19.875 12.8 21.1038C12.3333 21.4774 11.6667 21.4774 11.2 21.1038C9.66667 19.875 4.5 15.4196 4.5 10.5Z"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    />
                                </svg>
                            </div>
                            <h4 className="mt-4 text-[1.2rem] font-bold leading-[1.28] text-[#093F46] sm:text-[1.25rem] md:text-[24px]">Visit Clinic</h4>
                            <p className="mt-1 text-[13px] leading-[1.5] text-[#27343A] md:text-[16px]">226, Gufa Mandir Rd, Bhopal</p>
                            <a
                                href="https://maps.google.com/?q=226,+Gufa+Mandir+Rd,+Bhopal"
                                target="_blank"
                                rel="noreferrer"
                                className="mt-3 block text-[13px] font-semibold text-[#0A5B5B] md:text-[16px]"
                            >
                                Get Directions
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
