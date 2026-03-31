"use client";
import Navbar from '../Navbar';

export default function TherapeuticHero() {
    return (
        <section className="hero-section pt-[60px] px-4 md:px-[60px] lg:px-[120px]">
            <div className="bg-[#014E4E] rounded-3xl overflow-hidden w-full">
                <div className="relative w-full">
                    {/* Navbar */}
                    <Navbar />

                    {/* Mobile Layout */}
                    <div className="md:hidden w-full py-12 px-6 flex flex-col items-center text-center">
                        <h1 className="text-[1.8rem] font-bold text-white leading-[1.3] mb-2">
                            Yes! <span className="text-[#FF850B]">Diabetes, Thyroid, Fatty Liver,</span>
                        </h1>
                        <h2 className="text-[1.8rem] font-bold text-white leading-[1.3] mb-4">
                            <span className="text-[#FF850B]">Cholestrol</span> Can Be Reversed.
                        </h2>
                        <p className="text-white/80 text-[15px] leading-[1.6] mt-3">
                            And it can be done with just <span className="text-[#FF850B] font-semibold">Ghar Ka Khana</span>,<br />guided by nutritional science.
                        </p>
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden md:flex w-full py-16 lg:py-20 flex-col items-center text-center">
                        <h1 className="text-[2.5rem] lg:text-[3rem] xl:text-[3.5rem] font-bold text-white leading-[1.2] mb-2">
                            Yes! <span className="text-[#FF850B]">Diabetes, Thyroid, Fatty Liver,</span>
                        </h1>
                        <h2 className="text-[2.5rem] lg:text-[3rem] xl:text-[3.5rem] font-bold text-white leading-[1.2] mb-4">
                            <span className="text-[#FF850B]">Cholestrol</span> Can Be Reversed.
                        </h2>
                        <p className="text-white/80 text-[18px] leading-[1.7] mt-4 max-w-[580px]">
                            And it can be done with just <span className="text-[#FF850B] font-semibold">Ghar Ka Khana</span>,<br />guided by nutritional science.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
