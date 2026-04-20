import { Metadata } from 'next';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import PageWrapper from '@/components/PageWrapper';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'Book an Appointment',
  description:
    'Book a consultation with Dietitian Poonam Sagar. Get a personalised diet plan for weight loss, PCOD, therapeutic nutrition, or wedding wellness. Online & clinic appointments available.',
  keywords: ['book dietitian appointment', 'diet consultation India', 'online diet appointment', 'Poonam Sagar consultation'],
  openGraph: {
    title: 'Book an Appointment | Dietitian Poonam Sagar',
    description: 'Schedule your personalised nutrition consultation with Dietitian Poonam Sagar. Online & clinic appointments available.',
    type: 'website',
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
                <form className="appointment-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>First Name</label>
                      <input type="text" placeholder="First Name" required />
                    </div>
                    <div className="form-group">
                      <label>Last Name</label>
                      <input type="text" placeholder="Last Name" required />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Email Address</label>
                    <input type="email" placeholder="Email Address" required />
                  </div>

                  <div className="form-group">
                    <label>Phone Number</label>
                    <input type="tel" placeholder="Phone Number" required />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Service</label>
                      <select required>
                        <option value="">Select Service</option>
                        <option value="weight-loss">Weight Loss</option>
                        <option value="pcod">PCOD Management</option>
                        <option value="wedding">Wedding Plan</option>
                        <option value="therapeutic">Therapeutic</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Preferred Date</label>
                      <input type="date" required />
                    </div>
                  </div>

                  <Button type="submit">Book An Appointment</Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
