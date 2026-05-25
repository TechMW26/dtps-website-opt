import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
    title: 'Terms & Conditions',
    description:
        'Read the Terms & Conditions, including Refund Policy and Cancellation terms for Dietitian Poonam Sagar services.',
    alternates: { canonical: '/terms' },
    robots: { index: true, follow: true },
};

export default function TermsPage() {
    return (
        <div className="bg-[#F5F5F5]">
            <section className="hero-section site-shell pt-4 md:pt-[60px]">
                <div className="w-full overflow-hidden rounded-3xl bg-[#014E4E]">
                    <div className="relative w-full">
                        <Navbar />

                        <div className="flex w-full flex-col items-center px-6 py-12 text-center md:hidden">
                            <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#FF850B] mb-3">
                                Legal
                            </p>
                            <h1 className="text-[1.8rem] font-bold text-white leading-[1.3] mb-2">
                                Terms &amp; <span className="text-[#FF850B]">Policy</span>
                            </h1>
                            <p className="mt-3 max-w-[38ch] text-[13px] leading-[1.65] text-white/80">
                                How Dietitian Poonam Sagar collects, uses, stores and protects your
                                personal and health information across our website, consultations and
                                services.
                            </p>
                        </div>

                        <div
                            className="hidden w-full flex-col items-center py-16 text-center md:flex lg:py-[82px]"
                            suppressHydrationWarning
                        >
                            <p className="mb-4 text-[13px] font-semibold uppercase tracking-[0.22em] text-[#FF850B]">
                                Legal
                            </p>
                            <h1 className="mb-2 text-[3.35rem] font-bold leading-[1.15] text-white">
                                Terms &amp; <span className="text-[#FF850B]">Conditions</span>
                            </h1>
                            <p className="mt-4 max-w-[640px] px-6 text-[15px] leading-[1.7] text-white/80">
                                Please review our refund policy and cancellation conditions carefully
                                before purchasing any plan from Dietitian Poonam Sagar.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="site-shell pb-20 pt-8 md:pb-24 md:pt-16">
                <article className="mx-auto max-w-[860px] text-[14px] leading-[1.75] text-[#27343A] md:text-[16px]">
                    <div className="mb-7 h-[3px] w-full max-w-[620px] bg-[#0A5B5B] md:mb-9" />

                    <h2 className="mb-6 max-w-full break-words text-[1.8rem] ml-2 font-bold leading-[1.18] text-[#093F46] sm:text-[2rem] md:mb-8 md:text-[50px]">
                        Refund Policy &amp; Cancellation
                    </h2>

                    <section className="mb-11 md:mb-12">
                        <h3 className="mb-3.5 max-w-full break-words text-[1.05rem] font-bold leading-[1.32] text-[#093F46] sm:text-[1.2rem] md:mb-5 md:text-[43px]">
                            1. Eligibility for Money-Back Guarantee
                        </h3>
                        <p className="mb-4 md:mb-5">
                            To qualify for our money-back guarantee, you must meet the following
                            conditions:
                        </p>
                        <ul className="list-disc space-y-3.5 pl-5 marker:text-[#0A5B5B] md:space-y-4 md:pl-6">
                            <li>
                                <strong>Adherence to Diet Plan:</strong> You must properly follow the
                                diet plan provided. This includes:
                                <ul className="mt-2.5 list-disc space-y-2 pl-5 marker:text-[#0A5B5B] md:mt-3 md:pl-6">
                                    <li>
                                        Consuming only the foods and quantities specified in the diet
                                        plan.
                                    </li>
                                    <li>
                                        Avoiding any foods or beverages that are excluded from the diet.
                                    </li>
                                    <li>
                                        Following all other instructions and recommendations included in
                                        the diet plan, including meal timing and preparation methods.
                                    </li>
                                </ul>
                            </li>
                            <li>
                                <strong>Continuous Adherence:</strong> There must be no interruptions or
                                pauses in following the diet plan during the specified period. The diet
                                plan must be followed consistently without any breaks.
                            </li>
                            <li>
                                <strong>Regular Documentation:</strong> You are required to share clear
                                and accurate photographs of your meals regularly throughout the duration
                                of the diet plan. These photos should align with the prescribed diet and
                                be submitted as directed.
                            </li>
                            <li>
                                <strong>Medical Conditions:</strong> The money-back guarantee is not
                                applicable if you have pre-existing medical conditions such as thyroid
                                disorders, PCOD (Polycystic Ovary Syndrome), PCOS (Polycystic Ovary
                                Syndrome), diabetes, or similar health issues.
                            </li>
                        </ul>
                    </section>

                    <section className="mb-11 md:mb-12">
                        <h3 className="mb-3.5 max-w-full break-words text-[1.05rem] font-bold leading-[1.32] text-[#093F46] sm:text-[1.2rem] md:mb-5 md:text-[43px]">
                            2. Requesting a Refund
                        </h3>
                        <p className="mb-4 md:mb-5">To request a refund under the money-back guarantee:</p>
                        <ul className="list-disc space-y-3.5 pl-5 marker:text-[#0A5B5B] md:space-y-4 md:pl-6">
                            <li>
                                <strong>Timely Request:</strong> You must submit your refund request
                                within the specified period as outlined at the time of purchase, usually
                                within 30 or 60 days.
                            </li>
                            <li>
                                <strong>Proof of Adherence:</strong> You must provide evidence that you
                                have followed the diet plan according to the conditions set forth. This
                                includes submitting the required meal photographs and demonstrating
                                continuous adherence without pauses.
                            </li>
                            <li>
                                <strong>Eligibility Review:</strong> Your adherence to the diet plan will
                                be reviewed. We will assess the provided documentation and confirm
                                whether the terms and conditions have been met.
                            </li>
                            <li>
                                If a client has used the
                                freeze facility even for 1 day, they will not be eligible for any refund
                                in the future in case of any plan-related issue.
                            </li>
                            <li>
                                Clients must
                                inform the team in advance via email regarding any freeze or pause
                                request to ensure smooth plan management.
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="mb-3.5 max-w-full break-words text-[1.05rem] font-bold leading-[1.32] text-[#093F46] sm:text-[1.2rem] md:mb-5 md:text-[43px]">
                            3. Exclusions and Limitations
                        </h3>
                        <ul className="list-disc space-y-3.5 pl-5 marker:text-[#0A5B5B] md:space-y-4 md:pl-6">
                            <li>
                                <strong>Non-Eligibility: Refunds will not be issued if:</strong>
                                <ul className="mt-2.5 list-disc space-y-2 pl-5 marker:text-[#0A5B5B] md:mt-3 md:pl-6">
                                    <li>The diet plan has not been followed as instructed.</li>
                                    <li>
                                        There have been pauses or interruptions in adherence to the plan.
                                    </li>
                                    <li>
                                        Required documentation (e.g., meal photos) has not been provided.
                                    </li>
                                    <li>
                                        You have a pre-existing medical condition that was not disclosed
                                        prior to purchase.
                                    </li>
                                </ul>
                            </li>
                            <li>
                                <strong>Partial Refunds:</strong> Partial refunds are not available. The
                                money-back guarantee covers a full refund of the amount paid.
                            </li>
                            <li>
                                <strong>Modification of Terms:</strong> We reserve the right to modify
                                these terms and conditions at any time. Any changes will be communicated
                                to you and will apply to new purchases.
                            </li>
                        </ul>
                    </section>
                </article>
            </section>
        </div>
    );
}
