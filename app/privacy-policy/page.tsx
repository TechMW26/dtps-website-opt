import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Read the Privacy Policy of Dietitian Poonam Sagar (dtpoonamsagar.com). Learn how we collect, use, store, and protect your personal and health information when you use our diet, nutrition, and consultation services.',
  alternates: { canonical: '/privacy-policy' },
  robots: { index: true, follow: true },
};

const SITE_NAME = 'Dietitian Poonam Sagar';
const CONTACT_EMAIL = 'support@dtpoonamsagar.com';
const CONTACT_PHONE = '+91 98930 27688';
const CONTACT_ADDRESS =
  '226, Gufa Mandir Rd, Jain Nagar, Lalghati, Bhopal, Madhya Pradesh 462001, India';
const EFFECTIVE_DATE = '27 April 2026';

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-[#F5F5F5]">
      <section className="hero-section site-shell pt-4 md:pt-[60px]">
        <div className="w-full overflow-hidden rounded-3xl bg-[#015A5A]">
          <div className="relative w-full">
            <Navbar />

            <div className="flex w-full flex-col items-center px-5 py-10 text-center md:hidden">
              <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#FF850B] mb-3">
                Legal
              </p>
              <h1 className="text-[1.95rem] font-bold text-white leading-[1.15] mb-3">
                Privacy <span className="text-[#FF850B]">Policy</span>
              </h1>
              <p className="max-w-[28ch] text-[12px] leading-[1.7] text-white/80 sm:max-w-[30ch]">
                How {SITE_NAME} collects, uses and protects your information.
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
                Privacy <span className="text-[#FF850B]">Policy</span>
              </h1>
              <p className="mt-4 max-w-[640px] px-6 text-[15px] leading-[1.7] text-white/80">
                How {SITE_NAME} collects, uses, stores and protects your personal and
                health information across our website, consultations and services.
              </p>
              <p className="mt-5 text-[12px] text-white/60">
                Effective date: {EFFECTIVE_DATE}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="site-shell pb-20 pt-8 md:pb-24 md:pt-16">
        <article className="mx-auto max-w-[860px] text-[#27343A]">

          <div className="mb-9 h-[3px] w-full max-w-[620px] bg-[#0A5B5B] md:mb-10" />

          <h2 className="mb-7 text-[clamp(1.75rem,3.2vw,2.9rem)] font-bold leading-[1.15] text-[#083F46] md:mb-10">
            Privacy Policy
          </h2>

          <section className="mb-10 md:mb-12">
            <div className="bg-[#F2F4F4] px-5 py-4 shadow-[0_0_0_1px_rgba(10,91,91,0.08)] md:px-6 md:py-5">
              <h3 className="mb-3 text-[clamp(1rem,1.6vw,1.3rem)] font-bold leading-[1.2] text-[#083F46]">
                1. Introduction
              </h3>
              <p className="text-[13px] leading-[1.7] text-[#2E3A3D] md:text-[15px]">
                This Privacy Policy (&ldquo;Policy&rdquo;) describes how {SITE_NAME}
                (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) collects, uses,
                discloses and protects information when you visit{' '}
                <strong>dtpoonamsagar.com</strong> (the &ldquo;Website&rdquo;), book an
                appointment, purchase a diet plan, or otherwise interact with our
                services (collectively, the &ldquo;Services&rdquo;). By using the Services
                you agree to this Policy.
              </p>
            </div>
          </section>

          <section className="mb-10 md:mb-12">
            <h3 className="mb-4 text-[clamp(1.05rem,1.9vw,1.45rem)] font-bold leading-[1.2] text-[#083F46]">
              2. Information We Collect
            </h3>
            <p className="mb-4 text-[13px] leading-[1.7] text-[#2E3A3D] md:text-[15px]">
              We collect the following categories of information:
            </p>
            <div className="grid gap-3 md:gap-4">
              <div className="border border-[#D7E0E0] bg-white px-4 py-3 md:px-5 md:py-4">
                <h4 className="mb-2 text-[14px] font-bold leading-[1.2] text-[#083F46] md:text-[15px]">
                  Identity &amp; contact data
                </h4>
                <p className="text-[12px] leading-[1.6] text-[#2E3A3D] md:text-[14px]">
                  name, email address, phone number, billing/shipping city, and country,
                  which you provide when filling out forms (appointment, contact,
                  checkout) or creating an account.
                </p>
              </div>
              <div className="border border-[#D7E0E0] bg-white px-4 py-3 md:px-5 md:py-4">
                <h4 className="mb-2 text-[14px] font-bold leading-[1.2] text-[#083F46] md:text-[15px]">
                  Health &amp; lifestyle data
                </h4>
                <p className="text-[12px] leading-[1.6] text-[#2E3A3D] md:text-[14px]">
                  information you voluntarily share with our dietitians and counsellors
                  during consultations or via our app (e.g. age, gender, weight,
                  dietary preferences, medical history, goals). This is processed only
                  for the purpose of providing personalised nutrition guidance.
                </p>
              </div>
              <div className="border border-[#D7E0E0] bg-white px-4 py-3 md:px-5 md:py-4">
                <h4 className="mb-2 text-[14px] font-bold leading-[1.2] text-[#083F46] md:text-[15px]">
                  Transaction data
                </h4>
                <p className="text-[12px] leading-[1.6] text-[#2E3A3D] md:text-[14px]">
                  order details, plan purchased, amount paid, coupon used, and payment
                  status. Card or bank details are never stored by us — they are handled
                  directly by our PCI-DSS compliant payment processor (Razorpay).
                </p>
              </div>
              <div className="border border-[#D7E0E0] bg-white px-4 py-3 md:px-5 md:py-4">
                <h4 className="mb-2 text-[14px] font-bold leading-[1.2] text-[#083F46] md:text-[15px]">
                  Technical &amp; usage data
                </h4>
                <p className="text-[12px] leading-[1.6] text-[#2E3A3D] md:text-[14px]">
                  IP address, approximate location (city/country derived from IP), device
                  and browser type, pages visited, referring URL, and timestamps.
                </p>
              </div>
              <div className="border border-[#D7E0E0] bg-white px-4 py-3 md:px-5 md:py-4">
                <h4 className="mb-2 text-[14px] font-bold leading-[1.2] text-[#083F46] md:text-[15px]">
                  Cookies &amp; analytics identifiers
                </h4>
                <p className="text-[12px] leading-[1.6] text-[#2E3A3D] md:text-[14px]">
                  see Section 6 below.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-10 md:mb-12">
            <h3 className="mb-4 text-[clamp(1.05rem,1.9vw,1.45rem)] font-bold leading-[1.2] text-[#083F46]">
              3. How We Use Your Information
            </h3>
            <ul className="space-y-2 text-[13px] leading-[1.7] text-[#2E3A3D] md:text-[14px]">
              <li className="flex gap-2">
                <span className="mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full border border-[#0A5B5B]" />
                <span>To create, deliver and personalise your diet plan and follow-ups.</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full border border-[#0A5B5B]" />
                <span>To process payments, send order confirmations, invoices and receipts.</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full border border-[#0A5B5B]" />
                <span>To communicate with you via email, phone, SMS and WhatsApp regarding bookings, consultations, plan updates and customer support.</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full border border-[#0A5B5B]" />
                <span>To respond to enquiries submitted through our forms.</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full border border-[#0A5B5B]" />
                <span>To send marketing communications about new plans, offers and content (you can opt out at any time).</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full border border-[#0A5B5B]" />
                <span>To monitor, secure and improve the Website and Services, and to detect or prevent fraud and abuse.</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full border border-[#0A5B5B]" />
                <span>To comply with legal obligations and enforce our Terms.</span>
              </li>
            </ul>
          </section>

          <section className="mb-10 md:mb-12">
            <h3 className="mb-4 text-[clamp(1.05rem,1.9vw,1.45rem)] font-bold leading-[1.2] text-[#083F46]">
              4. Legal Bases
            </h3>
            <p className="text-[13px] leading-[1.7] text-[#2E3A3D] md:text-[15px]">
              Where applicable, we rely on (a) your consent (e.g. for marketing, health
              information, optional cookies), (b) the performance of a contract (e.g.
              delivering a paid plan), (c) our legitimate interests (e.g. analytics,
              fraud prevention, service improvement) and (d) compliance with legal
              obligations.
            </p>
          </section>

          <section className="mb-10 md:mb-12">
            <h3 className="mb-4 text-[clamp(1.05rem,1.9vw,1.45rem)] font-bold leading-[1.2] text-[#083F46]">
              5. How We Share Information
            </h3>
            <p className="mb-4 text-[13px] leading-[1.7] text-[#2E3A3D] md:text-[15px]">
              We do not sell your personal data. We share it only with:
            </p>
            <div className="grid gap-3 md:grid-cols-2 md:gap-4">
              <div className="bg-[#F7F8F8] px-4 py-3 md:px-5 md:py-4">
                <h4 className="mb-2 text-[14px] font-bold text-[#083F46] md:text-[15px]">Payment processors</h4>
                <p className="text-[12px] leading-[1.6] text-[#2E3A3D] md:text-[14px]">Razorpay, for processing transactions.</p>
              </div>
              <div className="bg-[#F7F8F8] px-4 py-3 md:px-5 md:py-4">
                <h4 className="mb-2 text-[14px] font-bold text-[#083F46] md:text-[15px]">Communication providers</h4>
                <p className="text-[12px] leading-[1.6] text-[#2E3A3D] md:text-[14px]">our SMTP email provider and AiSensy (for WhatsApp onboarding/notifications).</p>
              </div>
              <div className="bg-[#F7F8F8] px-4 py-3 md:px-5 md:py-4">
                <h4 className="mb-2 text-[14px] font-bold text-[#083F46] md:text-[15px]">Hosting &amp; infrastructure</h4>
                <p className="text-[12px] leading-[1.6] text-[#2E3A3D] md:text-[14px]">our cloud hosting provider, MongoDB Atlas (database), and ImageKit (media delivery).</p>
              </div>
              <div className="bg-[#F7F8F8] px-4 py-3 md:px-5 md:py-4">
                <h4 className="mb-2 text-[14px] font-bold text-[#083F46] md:text-[15px]">Analytics &amp; advertising</h4>
                <p className="text-[12px] leading-[1.6] text-[#2E3A3D] md:text-[14px]">Google Analytics 4, Meta (Facebook) Pixel and Microsoft Clarity, as described in Section 6.</p>
              </div>
              <div className="bg-[#F7F8F8] px-4 py-3 md:px-5 md:py-4 md:col-span-2">
                <h4 className="mb-2 text-[14px] font-bold text-[#083F46] md:text-[15px]">Professional advisors &amp; authorities</h4>
                <p className="text-[12px] leading-[1.6] text-[#2E3A3D] md:text-[14px]">when required by law, court order or to protect our rights.</p>
              </div>
            </div>
            <p className="mt-4 text-[12px] leading-[1.6] text-[#2E3A3D] md:text-[14px]">
              All third-party processors are contractually required to handle your data
              securely and only for the purposes we specify.
            </p>
          </section>

          <section className="mb-10 md:mb-12">
            <div className="rounded-lg border border-[#D5DCDD] bg-[#EEF2F1] px-4 py-4 md:px-6 md:py-5">
              <h3 className="mb-3 text-[clamp(1.05rem,1.9vw,1.45rem)] font-bold leading-[1.2] text-[#083F46]">
                6. Cookies, Pixels &amp; Analytics
              </h3>
              <p className="mb-3 text-[13px] leading-[1.7] text-[#2E3A3D] md:text-[15px]">The Website uses cookies and similar technologies for:</p>
              <ul className="space-y-2 text-[13px] leading-[1.7] text-[#2E3A3D] md:text-[14px]">
                <li><strong>Essential</strong> functionality (session, security, CSRF, login).</li>
                <li><strong>Analytics</strong> — Google Analytics 4 (<code>G-R647JLBMXD</code>) and Microsoft Clarity, which help us understand how visitors use the site so we can improve it.</li>
                <li><strong>Marketing</strong> — Meta (Facebook) Pixel, used to measure ad performance and show relevant content. We share event-level data such as page views, &ldquo;Initiate Checkout&rdquo;, &ldquo;Add Payment Info&rdquo; and &ldquo;Purchase&rdquo; (with order ID and value, never your health information).</li>
              </ul>
              <p className="mt-3 text-[12px] leading-[1.6] text-[#2E3A3D] md:text-[14px]">
                You can disable cookies in your browser, opt out of Google Analytics via
                the{' '}
                <a
                  href="https://tools.google.com/dlpage/gaoptout"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#014E4E] underline"
                >
                  GA opt-out add-on
                </a>{' '}
                and adjust ad personalisation in your{' '}
                <a
                  href="https://accountscenter.facebook.com/ads"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#014E4E] underline"
                >
                  Meta Accounts Center
                </a>
                .
              </p>
            </div>
          </section>

          <section className="mb-10 md:mb-12">
            <h3 className="mb-4 text-[clamp(1.05rem,1.9vw,1.45rem)] font-bold leading-[1.2] text-[#083F46]">
              7. Data Retention
            </h3>
            <p className="text-[13px] leading-[1.7] text-[#2E3A3D] md:text-[15px]">
              We keep personal data only for as long as necessary to provide the
              Services and to comply with legal, accounting or reporting obligations.
              Order and tax records are retained for the period required by Indian law
              (typically up to 8 years). Inactive accounts and unconverted enquiries may
              be deleted after a reasonable period.
            </p>
          </section>

          <section className="mb-10 md:mb-12">
            <h3 className="mb-4 text-[clamp(1.05rem,1.9vw,1.45rem)] font-bold leading-[1.2] text-[#083F46]">
              8. Data Security
            </h3>
            <p className="text-[13px] leading-[1.7] text-[#2E3A3D] md:text-[15px]">
              We implement industry-standard administrative, technical and physical
              safeguards including HTTPS/TLS encryption in transit, hashed passwords,
              role-based access control, strict Content Security Policy headers, and
              regular security reviews. While we strive to protect your data, no system
              is 100% secure; please notify us immediately at{' '}
              <a className="text-[#014E4E] underline" href={`mailto:${CONTACT_EMAIL}`}>
                {CONTACT_EMAIL}
              </a>{' '}
              if you suspect any compromise of your account.
            </p>
          </section>

          <section className="mb-10 md:mb-12">
            <h3 className="mb-4 text-[clamp(1.05rem,1.9vw,1.45rem)] font-bold leading-[1.2] text-[#083F46]">
              9. Your Rights
            </h3>
            <p className="mb-4 text-[13px] leading-[1.7] text-[#2E3A3D] md:text-[15px]">
              Subject to applicable law, you have the right to:
            </p>
            <div className="grid gap-3 md:grid-cols-2 md:gap-4">
              <div className="bg-white px-4 py-3 shadow-[0_0_0_1px_rgba(10,91,91,0.08)] md:px-5 md:py-4">
                <ul className="space-y-2 text-[12px] leading-[1.6] text-[#2E3A3D] md:text-[14px]">
                  <li>Access the personal data we hold about you.</li>
                  <li>Request correction of inaccurate or incomplete data.</li>
                  <li>Request deletion of your data (subject to legal retention requirements).</li>
                </ul>
              </div>
              <div className="bg-white px-4 py-3 shadow-[0_0_0_1px_rgba(10,91,91,0.08)] md:px-5 md:py-4">
                <ul className="space-y-2 text-[12px] leading-[1.6] text-[#2E3A3D] md:text-[14px]">
                  <li>Withdraw consent for marketing communications at any time.</li>
                  <li>Object to or restrict certain processing.</li>
                  <li>Request data portability where applicable.</li>
                </ul>
              </div>
            </div>
            <p className="mt-4 text-[12px] leading-[1.6] text-[#2E3A3D] md:text-[14px]">
              To exercise any of these rights, email us at{' '}
              <a className="text-[#014E4E] underline" href={`mailto:${CONTACT_EMAIL}`}>
                {CONTACT_EMAIL}
              </a>
              . We will respond within a reasonable timeframe.
            </p>
          </section>

          <section className="mb-10 md:mb-12">
            <h3 className="mb-4 text-[clamp(1.05rem,1.9vw,1.45rem)] font-bold leading-[1.2] text-[#083F46]">
              10. Children&apos;s Privacy
            </h3>
            <p className="text-[13px] leading-[1.7] text-[#2E3A3D] md:text-[15px]">
              Our Services are intended for users aged 18 and above. Minors may use the
              Services only under the supervision of a parent or legal guardian. We do
              not knowingly collect personal data from children without verifiable
              parental consent.
            </p>
          </section>

          <section className="mb-10 md:mb-12">
            <h3 className="mb-4 text-[clamp(1.05rem,1.9vw,1.45rem)] font-bold leading-[1.2] text-[#083F46]">
              11. International Data Transfers
            </h3>
            <p className="text-[13px] leading-[1.7] text-[#2E3A3D] md:text-[15px]">
              Your data is primarily processed in India. Some of our service providers
              (e.g. Google, Meta, Microsoft) may process data in other jurisdictions. By
              using the Services you consent to such transfers subject to appropriate
              safeguards.
            </p>
          </section>

          <section className="mb-10 md:mb-12">
            <h3 className="mb-4 text-[clamp(1.05rem,1.9vw,1.45rem)] font-bold leading-[1.2] text-[#083F46]">
              12. Third-Party Links
            </h3>
            <p className="text-[13px] leading-[1.7] text-[#2E3A3D] md:text-[15px]">
              The Website may contain links to third-party websites (e.g. social media,
              blog references). We are not responsible for the privacy practices of
              those sites and encourage you to read their policies.
            </p>
          </section>

          <section className="mb-10 md:mb-12">
            <div className="border-l-4 border-[#F97316] bg-[#FFF3F0] px-4 py-4 md:px-5 md:py-5">
              <h3 className="mb-3 text-[clamp(1.05rem,1.9vw,1.45rem)] font-bold leading-[1.2] text-[#083F46]">
                13. Medical Disclaimer
              </h3>
              <p className="text-[12px] leading-[1.7] text-[#2E3A3D] md:text-[14px]">
                Information provided through the Website and Services is for educational
                and personalised guidance purposes and is not a substitute for
                professional medical diagnosis or treatment. Always consult a qualified
                medical practitioner before making changes to your diet, lifestyle or
                medication.
              </p>
            </div>
          </section>

          <section className="mb-10 md:mb-12">
            <h3 className="mb-4 text-[clamp(1.05rem,1.9vw,1.45rem)] font-bold leading-[1.2] text-[#083F46]">
              14. Updates to this Policy
            </h3>
            <p className="text-[13px] leading-[1.7] text-[#2E3A3D] md:text-[15px]">
              We may update this Policy from time to time. The &ldquo;Effective date&rdquo;
              at the top will indicate when it was last revised. Material changes will be
              highlighted on the Website or sent to you by email where appropriate.
            </p>
          </section>

          <section className="rounded-lg bg-[#015A5A] px-5 py-5 text-white md:px-6 md:py-6">
            <h3 className="mb-3 text-[clamp(1.05rem,1.9vw,1.45rem)] font-bold leading-[1.2] text-white">
              15. Contact Us
            </h3>
            <p className="mb-4 text-[12px] leading-[1.7] text-white/80 md:text-[14px]">
              If you have questions, concerns or complaints about this Policy or our
              data practices, please contact our Grievance Officer:
            </p>
            <div className="grid gap-2 text-[12px] leading-[1.7] text-white/85 md:text-[14px]">
              <p>
                <strong>Email:</strong>{' '}
                <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>
                  {CONTACT_EMAIL}
                </a>
              </p>
              <p>
                <strong>Phone:</strong>{' '}
                <a className="underline" href={`tel:${CONTACT_PHONE.replace(/\s+/g, '')}`}>
                  {CONTACT_PHONE}
                </a>
              </p>
              <p>
                <strong>Address:</strong> {CONTACT_ADDRESS}
              </p>
            </div>
          </section>
        </article>
      </section>
    </div>
  );
}
