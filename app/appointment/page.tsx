import { Metadata } from 'next';
import Image from 'next/image';
import PageWrapper from '@/components/PageWrapper';
import Navbar from '@/components/Navbar';
import AppointmentForm from '@/components/appointment/AppointmentForm';


export const metadata: Metadata = {
  title: 'Book a Diet Consultation – Dietitian Poonam Sagar',
  description:
    'Book your personalised nutrition consultation with Dietitian Poonam Sagar — 25+ years of expertise, 15,000+ clients transformed. Available online & at our Bhopal clinic. Start your weight loss, PCOD, or wellness journey today.',
  keywords: ['book dietitian appointment', 'diet consultation India', 'online diet appointment', 'Poonam Sagar consultation', 'nutritionist Bhopal', 'diet plan consultation', 'book nutritionist online'],
  openGraph: {
    title: 'Book a Diet Consultation | Dietitian Poonam Sagar',
    description: 'Book your personalised nutrition consultation — 25+ years of expertise, 15,000+ clients transformed. Online & clinic appointments available.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Book a Diet Consultation | Dietitian Poonam Sagar',
    description: 'Book your personalised nutrition consultation — 25+ years of expertise, 15,000+ clients transformed.',
  },
  alternates: { canonical: '/appointment' },
};

 
export default function AppointmentPage() {
  return (
      <div className="">
        <section className="hero-section site-shell pt-4 md:pt-[60px]">
         <div className="bg-[#014E4E] rounded-3xl overflow-hidden w-full">
                        
                        
                          <Navbar/>
                {/* Hero Section */}
        <section className="page-header">
          <div className="container">
            <h1 className="section-title light">Appointment</h1>
            <div className="breadcrumb light">
              <span>Home</span> / <span>Book Appointment</span>
            </div>
          </div>
        </section>
                       
                        </div>
        </section>


      {/* Appointment Form Section */}
      <section className="about-section">
        <div className="container">
          <div className="appointment-card">
            <div className="appointment-content-grid">
              {/* Left Side - Info & Image */}
              <div className="appointment-left">
                <div className="section-label">
                  <span className="star">✦</span> Appointment
                </div>
                <h2 className="section-title">Make appointment</h2>
                <p className="about-desc">
                  Easy scheduling for a personalized health coaching session. Take 
                  the first step towards better health today!
                </p>
                <div className="appointment-image ">
                  <Image 
                    src="https://placehold.co/400x300/0d4043/ffffff?text=Health+Coaching" 
                    alt="Health Coaching" 
                    width={400} 
                    height={300} 
                    className="object-cover rounded-2xl"
                    loading="lazy"
                  />
                </div>
              </div>

              {/* Right Side - Form */}
              <div className="appointment-form-box">
                <AppointmentForm />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
