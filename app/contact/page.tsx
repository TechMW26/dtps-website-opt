import { Metadata } from 'next';
import { FaWhatsapp, FaFacebook, FaInstagram, FaXTwitter } from 'react-icons/fa6';
import Navbar from '@/components/Navbar';
import ContactForm from '@/components/contact/ContactForm';

export const metadata: Metadata = {
  title: 'Contact Dietitian Poonam Sagar – Get in Touch',
  description:
    'Contact Dietitian Poonam Sagar for personalised diet plans & nutrition counselling. Visit our Bhopal clinic at 226, Gufa Mandir Rd, Lalghati, call +91 98930 27688, or email support@dtpoonamsagar.com.',
  keywords: ['contact dietitian', 'Poonam Sagar contact', 'dietitian Bhopal', 'nutrition consultation contact', 'diet clinic Bhopal', 'best dietitian near me'],
  openGraph: {
    title: 'Contact Dietitian Poonam Sagar | Get in Touch',
    description: 'Reach out for personalised diet plans. Visit our Bhopal clinic or connect via phone, email, or WhatsApp.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Dietitian Poonam Sagar | Get in Touch',
    description: 'Reach out for personalised diet plans. Visit our Bhopal clinic or connect via phone, email, or WhatsApp.',
  },
  alternates: { canonical: '/contact' },
};

const contactInfo = [
  { icon: '📍', label: 'Office Address', value: 'Dt. Poonam Sagar, 226, Gufa Mandir Rd, Jain Nagar, Lalghati, Bhopal, Madhya Pradesh 462001' },
  { icon: '📧', label: 'E-Mail Us', value: 'support@dtpoonamsagar.com' },
  { icon: '📞', label: 'Contact us', value: '+91 98930 27688' },
];

const socialLinks = [
  { icon: FaWhatsapp, label: 'WhatsApp', href: 'https://wa.me/919893027688' },
  { icon: FaInstagram, label: 'Instagram', href: 'https://instagram.com' },
  { icon: FaFacebook, label: 'Facebook', href: 'https://facebook.com' },
  { icon: FaXTwitter, label: 'X (Twitter)', href: 'https://x.com' },
];

export default function ContactPage() {
  return (
    <div className="">
      {/* Hero Section with Navbar */}
      <section className="hero-section site-shell pt-4 md:pt-[60px]">
        <div className="bg-[#014E4E] rounded-3xl overflow-hidden w-full">
          <div className="relative w-full">
            {/* Navbar */}
            <Navbar />

            {/* Mobile Layout */}
            <div className="flex flex-col items-center w-full px-6 py-12 text-center md:hidden">
              <h1 className="text-[1.8rem] font-bold text-white leading-[1.3] mb-2">
                Let&apos;s <span className="text-[#FF850B]">Connect</span>
              </h1>
              <h2 className="text-[1.8rem] font-bold text-white leading-[1.3] mb-2">
                Share your goals,
              </h2>
              <h3 className="text-[1.8rem] font-bold text-white leading-[1.3]">
                start your transformation.
              </h3>
            </div>

            {/* Desktop Layout */}
            <div className="flex-col items-center hidden w-full py-16 text-center md:flex lg:py-20" suppressHydrationWarning>
              <h1 className="text-[2.5rem] lg:text-[3rem] xl:text-[3.5rem] font-bold text-white leading-[1.2] mb-2">
                Let&apos;s <span className="text-[#FF850B]">Connect</span>
              </h1>
              <h2 className="text-[2.5rem] lg:text-[3rem] xl:text-[3.5rem] font-bold text-white leading-[1.2] mb-2">
                Share your goals,
              </h2>
              <h3 className="text-[2.5rem] lg:text-[3rem] xl:text-[3.5rem] font-bold text-white leading-[1.2]">
                start your transformation.
              </h3>
            </div>
          </div>
        </div>
      </section>

      {/* Get in Touch Section */}
      <section className="about-section">
        <div className="container">
          <div className="contact-header">
            <div className="contact-header-content">
              <div className="section-label">
                <span className="star">✦</span> Contact Us
              </div>
              <h2 className="section-title">Get in touch</h2>
              <p className="about-desc">
                We are standing by to answer any question you might have, no matter how
                small. Contact us and we&apos;ll respond as soon as possible.
              </p>
            </div>
            <div className="contact-badge">
              <div className="rotating-badge">
                <span>Contact Us</span>
              </div>
            </div>
          </div>

          <div className="contact-grid contact-main">
            <div className="contact-form-box">
              <ContactForm />
            </div>

            <div className="contact-info-card">
              {contactInfo.map((item) => (
                <div key={item.label} className="contact-info-item">
                  <div className="contact-info-icon">{item.icon}</div>
                  <div className="contact-info-text">
                    <h4>{item.label}</h4>
                    <p>{item.value}</p>
                  </div>
                </div>
              ))}
              <div className="contact-social">
                <span className="social-label">Stay Connected:</span>
                <div className="social-icons">
                  {socialLinks.map((social) => {
                    const IconComponent = social.icon;
                    return (
                      <a key={social.label} href={social.href} className="social-icon" title={social.label} target="_blank" rel="noopener noreferrer">
                        <IconComponent size={24} />
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="map-container">
            <iframe
              src="https://maps.google.com/maps?q=Dt.%20Poonam%20Sagar%2C%20226%2C%20Gufa%20Mandir%20Rd%2C%20Jain%20Nagar%2C%20Lalghati%2C%20Bhopal%2C%20Madhya%20Pradesh%20462001&t=&z=16&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="400"
              title="Dietitian Poonam Sagar location map"
              className="border-0 rounded-[20px]"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </div>
  );
}