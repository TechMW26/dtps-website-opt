"use client";
import Link from 'next/link';
import Navbar from '../Navbar';

export default function WeightLossHero() {
    return (
        <section className="hero-section pt-[60px] px-4 md:px-[60px] lg:px-[120px]">
            <div className="bg-[#014E4E] rounded-3xl overflow-hidden w-full">
                <div className="relative w-full">
                    {/* Navbar */}
                    <Navbar />

                    {/* Mobile Layout */}
                    <div className="md:hidden w-full py-12 px-6 flex flex-col items-center text-center">
                        <h1 className="text-[1.8rem] font-bold text-white leading-[1.3] mb-2">
                            Guaranteed <span className="text-[#FF850B]">Weight Loss</span>
                        </h1>
                        <h2 className="text-[1.8rem] font-bold text-white leading-[1.3] mb-6">
                            with <span className="text-[#FF850B]">Ghar Ka Khana</span> Diet Plan
                        </h2>

                        {/* Badge */}
                        <div className="flex items-center justify-center gap-2 mb-8 border border-white/60 rounded-lg px-6 py-3">
                            <span className="text-white font-medium text-sm tracking-wide">UPTO</span>
                            <span className="text-[#FF850B] text-4xl font-bold">5</span>
                            <span className="text-white font-medium text-sm tracking-wide">KGS IN A MONTH</span>
                        </div>

                        {/* Button */}
                        <Link
                            href="/checkout?plan=weight-loss"
                            className="bg-[#FF850B] hover:bg-[#E57A09] text-white font-semibold py-3 px-8 rounded-full text-sm transition-colors"
                        >
                            Buy Weight Loss Plan Now
                        </Link>
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden md:flex w-full py-16 lg:py-20 flex-col items-center text-center">
                        <h1 className="text-[2.5rem] lg:text-[3rem] xl:text-[3.5rem] font-bold text-white leading-[1.2] mb-2">
                            Guaranteed <span className="text-[#FF850B]">Weight Loss</span>
                        </h1>
                        <h2 className="text-[2.5rem] lg:text-[3rem] xl:text-[3.5rem] font-bold text-white leading-[1.2] mb-8">
                            with <span className="text-[#FF850B]">Ghar Ka Khana</span> Diet Plan
                        </h2>

                        {/* Badge */}
                        <div className="flex items-center justify-center gap-3 mb-8 border border-white/60 rounded-lg px-8 py-4">
                            <span className="text-white font-medium text-base tracking-wider">UPTO</span>
                            <span className="text-[#FF850B] text-5xl lg:text-6xl font-bold">5</span>
                            <span className="text-white font-medium text-base tracking-wider">KGS IN A MONTH</span>
                        </div>

                        {/* Button */}
                        <Link
                            href="/checkout?plan=weight-loss"
                            className="bg-[#FF850B] hover:bg-[#E57A09] text-white font-semibold py-3.5 px-10 rounded-full text-base transition-colors"
                        >
                            Buy Weight Loss Plan Now
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
