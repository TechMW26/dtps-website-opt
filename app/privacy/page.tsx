import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Read the Privacy Policy of Dietitian Poonam Sagar (dtpoonamsagar.com). Learn how we collect, use, store, and protect your personal and health information when you use our diet, nutrition, and consultation services.',
  alternates: { canonical: '/privacy' },
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
    <div className="bg-white">
      <Navbar />

      {/* Hero */}
      <section className="site-shell pt-6 md:pt-10">
        <div className="rounded-3xl bg-[#014E4E] px-6 py-12 md:px-14 md:py-16">
          <p className="text-[13px] font-semibold uppercase tracking-[0.2em] text-[#FF850B]">
            Legal
          </p>
          <h1 className="mt-3 text-[2rem] font-bold leading-[1.15] tracking-[-0.01em] text-white md:text-[3rem]">
            Privacy Policy
          </h1>
          <p className="mt-4 max-w-3xl text-[14px] leading-[1.7] text-white/80 md:text-[16px]">
            Your privacy is important to us. This policy explains what
            information {SITE_NAME} collects, how we use and safeguard it, and
            the choices you have. Please read it together with our{' '}
            <Link href="/contact" className="underline decoration-white/40 underline-offset-2 hover:text-white">
              Contact
            </Link>{' '}
            details.
          </p>
          <p className="mt-3 text-[12px] text-white/60">
            Effective date: {EFFECTIVE_DATE}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="site-shell py-10 md:py-16">
        <article className="prose prose-slate mx-auto max-w-3xl text-[15px] leading-[1.75] text-[#1F2937] md:text-[16px]">
          <h2 className="mt-0 text-[#014E4E]">1. Introduction</h2>
          <p>
            This Privacy Policy (&ldquo;Policy&rdquo;) describes how {SITE_NAME}
            (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) collects,
            uses, discloses and protects information when you visit{' '}
            <strong>dtpoonamsagar.com</strong> (the &ldquo;Website&rdquo;),
            book an appointment, purchase a diet plan, or otherwise interact
            with our services (collectively, the &ldquo;Services&rdquo;). By
            using the Services you agree to this Policy.
          </p>

          <h2 className="text-[#014E4E]">2. Information We Collect</h2>
          <p>We collect the following categories of information:</p>
          <ul>
            <li>
              <strong>Identity &amp; contact data</strong> — name, email
              address, phone number, billing/shipping city, and country, which
              you provide when filling out forms (appointment, contact,
              checkout) or creating an account.
            </li>
            <li>
              <strong>Health &amp; lifestyle data</strong> — information you
              voluntarily share with our dietitians and counsellors during
              consultations or via our app (e.g. age, gender, weight, dietary
              preferences, medical history, goals). This is processed only for
              the purpose of providing personalised nutrition guidance.
            </li>
            <li>
              <strong>Transaction data</strong> — order details, plan
              purchased, amount paid, coupon used, and payment status. Card or
              bank details are <em>never</em> stored by us — they are handled
              directly by our PCI-DSS compliant payment processor (Razorpay).
            </li>
            <li>
              <strong>Technical &amp; usage data</strong> — IP address,
              approximate location (city/country derived from IP), device and
              browser type, pages visited, referring URL, and timestamps.
            </li>
            <li>
              <strong>Cookies &amp; analytics identifiers</strong> — see
              Section 6 below.
            </li>
          </ul>

          <h2 className="text-[#014E4E]">3. How We Use Your Information</h2>
          <ul>
            <li>To create, deliver and personalise your diet plan and follow-ups.</li>
            <li>To process payments, send order confirmations, invoices and receipts.</li>
            <li>To communicate with you via email, phone, SMS and WhatsApp regarding bookings, consultations, plan updates and customer support.</li>
            <li>To respond to enquiries submitted through our forms.</li>
            <li>To send marketing communications about new plans, offers and content (you can opt out at any time).</li>
            <li>To monitor, secure and improve the Website and Services, and to detect or prevent fraud and abuse.</li>
            <li>To comply with legal obligations and enforce our Terms.</li>
          </ul>

          <h2 className="text-[#014E4E]">4. Legal Bases</h2>
          <p>
            Where applicable, we rely on (a) your consent (e.g. for marketing,
            health information, optional cookies), (b) the performance of a
            contract (e.g. delivering a paid plan), (c) our legitimate
            interests (e.g. analytics, fraud prevention, service improvement)
            and (d) compliance with legal obligations.
          </p>

          <h2 className="text-[#014E4E]">5. How We Share Information</h2>
          <p>We do not sell your personal data. We share it only with:</p>
          <ul>
            <li>
              <strong>Payment processors</strong> — Razorpay, for processing
              transactions.
            </li>
            <li>
              <strong>Communication providers</strong> — our SMTP email
              provider and AiSensy (for WhatsApp onboarding/notifications).
            </li>
            <li>
              <strong>Hosting &amp; infrastructure</strong> — our cloud hosting
              provider, MongoDB Atlas (database), and ImageKit (media
              delivery).
            </li>
            <li>
              <strong>Analytics &amp; advertising</strong> — Google Analytics 4,
              Meta (Facebook) Pixel and Microsoft Clarity, as described in
              Section 6.
            </li>
            <li>
              <strong>Professional advisors &amp; authorities</strong> — when
              required by law, court order or to protect our rights.
            </li>
          </ul>
          <p>
            All third-party processors are contractually required to handle
            your data securely and only for the purposes we specify.
          </p>

          <h2 className="text-[#014E4E]">6. Cookies, Pixels &amp; Analytics</h2>
          <p>The Website uses cookies and similar technologies for:</p>
          <ul>
            <li>
              <strong>Essential</strong> functionality (session, security,
              CSRF, login).
            </li>
            <li>
              <strong>Analytics</strong> — Google Analytics 4 (
              <code>G-R647JLBMXD</code>) and Microsoft Clarity, which help us
              understand how visitors use the site so we can improve it.
            </li>
            <li>
              <strong>Marketing</strong> — Meta (Facebook) Pixel, used to
              measure ad performance and show relevant content. We share
              event-level data such as page views, &ldquo;Initiate
              Checkout&rdquo;, &ldquo;Add Payment Info&rdquo; and
              &ldquo;Purchase&rdquo; (with order ID and value, never your
              health information).
            </li>
          </ul>
          <p>
            You can disable cookies in your browser, opt out of Google
            Analytics via the{' '}
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

          <h2 className="text-[#014E4E]">7. Data Retention</h2>
          <p>
            We keep personal data only for as long as necessary to provide the
            Services and to comply with legal, accounting or reporting
            obligations. Order and tax records are retained for the period
            required by Indian law (typically up to 8 years). Inactive
            accounts and unconverted enquiries may be deleted after a
            reasonable period.
          </p>

          <h2 className="text-[#014E4E]">8. Data Security</h2>
          <p>
            We implement industry-standard administrative, technical and
            physical safeguards including HTTPS/TLS encryption in transit,
            hashed passwords, role-based access control, strict Content
            Security Policy headers, and regular security reviews. While we
            strive to protect your data, no system is 100% secure; please
            notify us immediately at{' '}
            <a className="text-[#014E4E] underline" href={`mailto:${CONTACT_EMAIL}`}>
              {CONTACT_EMAIL}
            </a>{' '}
            if you suspect any compromise of your account.
          </p>

          <h2 className="text-[#014E4E]">9. Your Rights</h2>
          <p>Subject to applicable law, you have the right to:</p>
          <ul>
            <li>Access the personal data we hold about you.</li>
            <li>Request correction of inaccurate or incomplete data.</li>
            <li>Request deletion of your data (subject to legal retention requirements).</li>
            <li>Withdraw consent for marketing communications at any time.</li>
            <li>Object to or restrict certain processing.</li>
            <li>Request data portability where applicable.</li>
          </ul>
          <p>
            To exercise any of these rights, email us at{' '}
            <a className="text-[#014E4E] underline" href={`mailto:${CONTACT_EMAIL}`}>
              {CONTACT_EMAIL}
            </a>
            . We will respond within a reasonable timeframe.
          </p>

          <h2 className="text-[#014E4E]">10. Children&apos;s Privacy</h2>
          <p>
            Our Services are intended for users aged 18 and above. Minors may
            use the Services only under the supervision of a parent or legal
            guardian. We do not knowingly collect personal data from children
            without verifiable parental consent.
          </p>

          <h2 className="text-[#014E4E]">11. International Data Transfers</h2>
          <p>
            Your data is primarily processed in India. Some of our service
            providers (e.g. Google, Meta, Microsoft) may process data in other
            jurisdictions. By using the Services you consent to such transfers
            subject to appropriate safeguards.
          </p>

          <h2 className="text-[#014E4E]">12. Third-Party Links</h2>
          <p>
            The Website may contain links to third-party websites (e.g. social
            media, blog references). We are not responsible for the privacy
            practices of those sites and encourage you to read their policies.
          </p>

          <h2 className="text-[#014E4E]">13. Medical Disclaimer</h2>
          <p>
            Information provided through the Website and Services is for
            educational and personalised guidance purposes and is not a
            substitute for professional medical diagnosis or treatment. Always
            consult a qualified medical practitioner before making changes to
            your diet, lifestyle or medication.
          </p>

          <h2 className="text-[#014E4E]">14. Updates to this Policy</h2>
          <p>
            We may update this Policy from time to time. The &ldquo;Effective
            date&rdquo; at the top will indicate when it was last revised.
            Material changes will be highlighted on the Website or sent to you
            by email where appropriate.
          </p>

          <h2 className="text-[#014E4E]">15. Contact Us</h2>
          <p>
            If you have questions, concerns or complaints about this Policy or
            our data practices, please contact our Grievance Officer:
          </p>
          <ul>
            <li>
              <strong>Email:</strong>{' '}
              <a className="text-[#014E4E] underline" href={`mailto:${CONTACT_EMAIL}`}>
                {CONTACT_EMAIL}
              </a>
            </li>
            <li>
              <strong>Phone:</strong>{' '}
              <a className="text-[#014E4E] underline" href={`tel:${CONTACT_PHONE.replace(/\s+/g, '')}`}>
                {CONTACT_PHONE}
              </a>
            </li>
            <li>
              <strong>Address:</strong> {CONTACT_ADDRESS}
            </li>
          </ul>
        </article>
      </section>
    </div>
  );
}
