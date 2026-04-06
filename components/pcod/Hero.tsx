"use client";
import Navbar from '../Navbar';

export default function PCODHero() {
    return (
        <section className="hero-section pt-4 md:pt-[60px] px-3 md:px-[60px] lg:px-[120px]">
            <div className="bg-[#014E4E] rounded-3xl overflow-hidden w-full">
                <div className="relative w-full">
                    {/* Navbar */}
                    <Navbar />

                    {/* Mobile Layout */}
                    <div className="md:hidden w-full py-12 px-6 flex flex-col items-center text-center">
                        <h1 className="text-[1.8rem] font-bold text-white leading-[1.3] mb-2">
                            98% Of Our <span className="text-[#FF850B]">PCOD Clients</span> See
                        </h1>
                        <h2 className="text-[1.8rem] font-bold text-white leading-[1.3] mb-2">
                            Major <span className="text-[#FF850B]">Weight Loss & Better Periods</span>
                        </h2>
                        <h3 className="text-[1.8rem] font-bold text-white leading-[1.3]">
                            With Our Diet Plan.
                        </h3>
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden md:flex w-full py-16 lg:py-20 flex-col items-center text-center">
                        <h1 className="text-[2.5rem] lg:text-[3rem] xl:text-[3.5rem] font-bold text-white leading-[1.2] mb-2">
                            98% Of Our <span className="text-[#FF850B]">PCOD Clients</span> See
                        </h1>
                        <h2 className="text-[2.5rem] lg:text-[3rem] xl:text-[3.5rem] font-bold text-white leading-[1.2] mb-2">
                            Major <span className="text-[#FF850B]">Weight Loss & Better Periods</span>
                        </h2>
                        <h3 className="text-[2.5rem] lg:text-[3rem] xl:text-[3.5rem] font-bold text-white leading-[1.2]">
                            With Our Diet Plan.
                        </h3>
                    </div>
                </div>
            </div>
        </section>

    );
}
