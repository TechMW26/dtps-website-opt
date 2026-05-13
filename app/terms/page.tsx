import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
    title: 'Terms & Conditions',
    description:
        'Read the Terms & Conditions, including Refund Policy and Cancellation terms for Dietitian Poonam Sagar services.',
    alternates: { canonical: '/terms' },
    robots: { index: true, follow: true },
};

const SITE_NAME = 'Dietitian Poonam Sagar';
const EFFECTIVE_DATE = '13 May 2026';

export default function TermsPage() {
    return (
        <div className="bg-white">
            <section className="hero-section site-shell pt-4 md:pt-[60px]">
                <div className="bg-[#014E4E] rounded-3xl overflow-hidden w-full">
                    <div className="relative w-full">
                        <Navbar />

                        <div className="flex flex-col items-center w-full px-6 py-12 text-center md:hidden">
                            <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#FF850B] mb-3">
                                Legal
                            </p>
                            <h1 className="text-[1.8rem] font-bold text-white leading-[1.3] mb-2">
                                Terms &amp; <span className="text-[#FF850B]">Conditions</span>
                            </h1>
                            <p className="mt-3 text-[13px] leading-[1.65] text-white/80 max-w-[36ch]">
                                Refund policy and cancellation terms for your purchase.
                            </p>
                            <p className="mt-4 text-[11px] text-white/60">
                                Effective date: {EFFECTIVE_DATE}
                            </p>
                        </div>

                        <div
                            className="flex-col items-center hidden w-full py-16 text-center md:flex lg:py-20"
                            suppressHydrationWarning
                        >
                            <p className="text-[13px] font-semibold uppercase tracking-[0.2em] text-[#FF850B] mb-4">
                                Legal
                            </p>
                            <h1 className="text-[2.5rem] lg:text-[3rem] xl:text-[3.5rem] font-bold text-white leading-[1.2] mb-2">
                                Terms &amp; <span className="text-[#FF850B]">Conditions</span>
                            </h1>
                            <p className="mt-4 max-w-2xl px-6 text-[15px] lg:text-[16px] leading-[1.7] text-white/80">
                                Please review our refund policy and cancellation conditions carefully
                                before purchasing any plan from {SITE_NAME}.
                            </p>
                            <p className="mt-5 text-[12px] text-white/60">
                                Effective date: {EFFECTIVE_DATE}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="site-shell py-10 md:py-16">
                <article className="prose prose-slate mx-auto max-w-3xl text-[15px] leading-[1.75] text-[#1F2937] md:text-[16px]">
                    <h2 className="mt-0 text-[#014E4E]">
                        <span className="inline-block rounded-md bg-[#FFF3D6] px-2 py-1 font-extrabold text-[#014E4E]">
                            Refund Policy &amp; Cancellation
                        </span>
                    </h2>
                    <p>
                        This section explains the <strong>money-back guarantee</strong>,
                        refund request process, and applicable exclusions.
                    </p>

                    <h3 className="text-[#014E4E]">
                        <span className="inline-block rounded bg-[#FFF3D6] px-2 py-0.5 font-bold">
                            1. Introduction
                        </span>
                    </h3>
                    <p>
                        This policy outlines the conditions under which customers may be
                        eligible for a refund under our money-back guarantee, the required
                        proof for review, and the exclusions that apply.
                    </p>

                    <h3 className="text-[#014E4E]">2. Eligibility for Money-Back Guarantee</h3>
                    <p>
                        To qualify for our <strong>money-back guarantee</strong>, you must
                        meet all of the following conditions:
                    </p>
                    <ul>
                        <li>
                            <strong>Adherence to Diet Plan:</strong> You must properly follow
                            the diet plan provided. This includes:
                            <ul>
                                <li>
                                    Consuming only the foods and quantities specified in the diet
                                    plan.
                                </li>
                                <li>
                                    Avoiding any foods or beverages that are excluded from the
                                    diet.
                                </li>
                                <li>
                                    Following all other instructions and recommendations included
                                    in the diet plan, including meal timing and preparation
                                    methods.
                                </li>
                            </ul>
                        </li>
                        <li>
                            <strong>Continuous Adherence:</strong> There must be no
                            interruptions or pauses in following the diet plan during the
                            specified period. The diet plan must be followed consistently
                            without any breaks.
                        </li>
                        <li>
                            <strong>Regular Documentation:</strong> You are required to share
                            clear and accurate photographs of your meals regularly throughout
                            the duration of the diet plan. These photos should align with the
                            prescribed diet and be submitted as directed.
                        </li>
                        <li>
                            <strong>Medical Conditions:</strong> The money-back guarantee is
                            not applicable if you have pre-existing medical conditions such as
                            thyroid disorders, PCOD (Polycystic Ovary Syndrome), PCOS
                            (Polycystic Ovary Syndrome), diabetes, or similar health issues.
                        </li>
                    </ul>

                    <h3 className="text-[#014E4E]">3. Requesting a Refund</h3>
                    <p>To request a refund under the money-back guarantee:</p>
                    <ul>
                        <li>
                            <strong>Timely Request:</strong> You must submit your refund
                            request within the specified period as outlined at the time of
                            purchase, usually within 30 or 60 days.
                        </li>
                        <li>
                            <strong>Proof of Adherence:</strong> You must provide evidence
                            that you have followed the diet plan according to the conditions
                            set forth. This includes submitting the required meal photographs
                            and demonstrating continuous adherence without pauses.
                        </li>
                        <li>
                            <strong>Eligibility Review:</strong> Your adherence to the diet
                            plan will be reviewed. We will assess the provided documentation
                            and confirm whether the terms and conditions have been met.
                        </li>
                    </ul>

                    <h3 className="text-[#014E4E]">4. Exclusions and Limitations</h3>
                    <ul>
                        <li>
                            <strong>Non-Eligibility:</strong> Refunds will not be issued if:
                            <ul>
                                <li>The diet plan has not been followed as instructed.</li>
                                <li>
                                    There have been pauses or interruptions in adherence to the
                                    plan.
                                </li>
                                <li>
                                    Required documentation (e.g., meal photos) has not been
                                    provided.
                                </li>
                                <li>
                                    You have a pre-existing medical condition that was not
                                    disclosed prior to purchase.
                                </li>
                            </ul>
                        </li>
                        <li>
                            <strong>Partial Refunds:</strong> Partial refunds are not
                            available. The money-back guarantee covers a full refund of the
                            amount paid.
                        </li>
                        <li>
                            <strong>Modification of Terms:</strong> We reserve the right to
                            modify these terms and conditions at any time. Any changes will be
                            communicated to you and will apply to new purchases.
                        </li>
                    </ul>
                </article>
            </section>
        </div>
    );
}
