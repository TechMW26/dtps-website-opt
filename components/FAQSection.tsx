"use client"
import { useState } from 'react';
import Image from 'next/image';

const faqData = [
  {
    question: "Will I have to stop eating normal food?",
    answer: "No. DTPS plans are based on ghar ka khana.Roti, sabzi, dal, rice, fruits, and even occasional treats are included. The focus is on portions, timing, and combinations, not restriction."
  },
  {
    question: "Do I need to take supplements or fat burners?",
    answer: "No. We do not sell or force any supplements.Your plan works on food, calorie balance, and consistency. Supplements are suggested only if medically required."
  },
  {
    question: "Will I have to do heavy exercise or go to the gym?",
    answer: "Not at all.Exercise is optional, not compulsory. Weight loss here is driven by diet. If you enjoy walking, yoga, or light workouts, we guide you. If not, the plan still works."
  },
  {
    question: "How soon will I see results?",
    answer: "Most people notice changes like reduced bloating, better energy, and lighter feeling within the first few weeks.  Weight and inch loss depend on consistency, body type, and starting point."
  }
];

function CrossGrid() {
  return (
    <div className="grid grid-cols-3 gap-[7px]">
      {[...Array(9)].map((_, i) => (
        <svg key={i} width="10" height="10" viewBox="0 0 10 10">
          <line x1="2" y1="2" x2="8" y2="8" stroke="#014E4E" strokeWidth="2" />
          <line x1="8" y1="2" x2="2" y2="8" stroke="#014E4E" strokeWidth="2" />
        </svg>
      ))}
    </div>
  );
}

function SparkleDecor() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" style={{ transform: 'rotate(-56deg)' }} suppressHydrationWarning>
      {[...Array(12)].map((_, i) => {
        const angle = (i * 30 * Math.PI) / 180;
        const cx = Math.round((18 + 14 * Math.cos(angle)) * 1000000) / 1000000;
        const cy = Math.round((18 + 14 * Math.sin(angle)) * 1000000) / 1000000;
        return <circle key={`o${i}`} cx={cx} cy={cy} r="1.4" fill="#014E4E" />;
      })}
      {[...Array(8)].map((_, i) => {
        const angle = ((i * 45 + 22.5) * Math.PI) / 180;
        const cx = Math.round((18 + 9 * Math.cos(angle)) * 1000000) / 1000000;
        const cy = Math.round((18 + 9 * Math.sin(angle)) * 1000000) / 1000000;
        return <circle key={`m${i}`} cx={cx} cy={cy} r="1.1" fill="#014E4E" />;
      })}
      {[...Array(4)].map((_, i) => {
        const angle = ((i * 90 + 45) * Math.PI) / 180;
        const cx = Math.round((18 + 5 * Math.cos(angle)) * 1000000) / 1000000;
        const cy = Math.round((18 + 5 * Math.sin(angle)) * 1000000) / 1000000;
        return <circle key={`in${i}`} cx={cx} cy={cy} r="0.9" fill="#014E4E" />;
      })}
    </svg>
  );
}

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number>(1);

  return (
    <section className="section-wrapper mt-16 md:mt-24 mb-16 md:mb-24 pt-16 md:pt-24 pb-12 md:pb-20">

      <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">

        {/* Left Images */}
        <div className="relative w-full lg:w-[480px] min-h-[360px] md:min-h-[440px] flex-shrink-0">

          <div className="relative w-[200px] h-[260px] md:w-[250px] md:h-[320px] rounded-[20px] overflow-hidden z-[1]">
            <Image
              src="https://ik.imagekit.io/br0mssyqj/DTPS-Ecommerce/static/gridfs-69b7c765a14dfc9fbf5ad807.jpg"
              alt="Health coaching"
              fill
              className="object-cover"
              loading="lazy"
              sizes="(max-width: 767px) 200px, 250px"
              quality={75}
            />
          </div>

          <div className="absolute top-[100px] left-[210px] md:top-[120px] md:left-[270px] z-[3]">
            <SparkleDecor />
          </div>

          <div className="absolute top-[85px] left-[195px] md:top-[100px] md:left-[250px] z-[2]">
            <svg width="60" height="60" viewBox="0 0 60 60">
              <circle cx="30" cy="30" r="25" fill="none" stroke="#014E4E" strokeWidth="1" strokeDasharray="4 3" opacity="0.4" />
            </svg>
          </div>

          <div className="absolute left-[100px] top-[160px] md:left-[140px] md:top-[190px] w-[220px] h-[200px] md:w-[280px] md:h-[250px] rounded-[20px] overflow-hidden border-[4px] border-white z-[4] shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
            <Image
              src="https://ik.imagekit.io/br0mssyqj/DTPS-Ecommerce/static/gridfs-69b7c75da14dfc9fbf5ad7e2.jpg"
              alt="Healthy food"
              fill
              className="object-cover"
              loading="lazy"
              sizes="(max-width: 767px) 220px, 280px"
              quality={75}
            />
          </div>

          <div className="absolute bottom-[30px] left-[50px] md:bottom-[10px] md:left-[60px] z-[5]">
            <CrossGrid />
          </div>

        </div>

        {/* FAQ */}
        <div className="flex-1 w-full">

          <div className="flex items-center gap-2 mb-4">
                       <span className="text-[#f5a623] text-lg">✦</span>
                       <span className="text-teal-600 text-base font-semibold">
                         Frequently asked question
                       </span>
                     </div>

          <h2 className="text-[28px] md:text-[38px] lg:text-[46px] font-extrabold text-[#1E1E1E] leading-[1.1] mb-6 md:mb-8 tracking-[-0.01em]">
            Common questions<br />about Programs
          </h2>

          <div className="flex flex-col gap-4 md:gap-5">
            {faqData.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div key={index} className="flex flex-col gap-2.5">

                  <button
                    onClick={() => setOpenIndex(isOpen ? -1 : index)}
                    className={`w-full flex items-center justify-between px-4 md:px-5 py-3 md:py-[14px] rounded-[10px] transition-colors duration-200 cursor-pointer ${
                      isOpen
                        ? 'bg-[#FF850B]'
                        : 'bg-transparent outline outline-1 outline-[#F1F1F1]'
                    }`}
                  >
                    <span className={`text-[13px] md:text-[15px] font-semibold text-left ${
                        isOpen ? 'text-white' : 'text-[#1E1E1E]'
                      }`}>
                      {faq.question}
                    </span>

                    <span className={`flex-shrink-0 w-[26px] h-[26px] md:w-[30px] md:h-[30px] rounded-[5px] flex items-center justify-center ${
                        isOpen ? 'bg-white' : 'bg-[#FF850B]'
                      }`}>
                      {isOpen ? (
                        <span className="w-[11px] h-[2px] bg-[#FF850B] rounded-full" />
                      ) : (
                        <svg width="12" height="12" viewBox="0 0 12 12">
                          <line x1="6" y1="1" x2="6" y2="11" stroke="white" strokeWidth="2" strokeLinecap="round" />
                          <line x1="1" y1="6" x2="11" y2="6" stroke="white" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      )}
                    </span>
                  </button>

                  <div className={`overflow-hidden transition-all duration-300 ${
                      isOpen ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'
                    }`}>
                    <div className="bg-[#EAEEF1] rounded-[10px] px-4 md:px-5 py-3 md:py-4">
                      <p className="text-[#828283] text-[12px] md:text-[14px] leading-[1.65]">
                        {faq.answer}
                      </p>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}