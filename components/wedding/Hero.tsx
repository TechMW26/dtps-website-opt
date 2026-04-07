"use client";
import Image from 'next/image';
import Navbar from '../Navbar';

export default function WeddingHero() {
    return (
<section className="hero-section site-shell pt-4 md:pt-[60px]">
            <div className="bg-[#014E4E] rounded-3xl overflow-hidden w-full relative">
                {/* Background Image */}
                <Image
                    src="https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c727a14dfc9fbf5ad706.jpg"
                    alt="Wedding couple"
                    fill
                    priority
                    className="object-cover opacity-30"
                    sizes="100vw"
                    quality={80}
                />

                <div className="relative w-full z-10">
                    {/* Navbar */}
                    <Navbar />

                    {/* Mobile Layout */}
                    <div className="md:hidden w-full py-12 px-6 flex flex-col items-center text-center">
                        <h1 className="text-[1.8rem] font-bold text-white leading-[1.3] mb-2">
                            India&apos;s Only <span className="text-[#FF850B]">&ldquo;Ghar Ka Khana&rdquo;</span>
                        </h1>
                        <h2 className="text-[1.8rem] font-bold text-white leading-[1.3] mb-4">
                            Diet Plan That Gets You <span className="text-[#FF850B]">Wedding-Ready.</span>
                        </h2>
                        <p className="text-white/80 text-[15px] leading-[1.6] mt-3">
                            Because you shouldn&apos;t have to suffer to look beautiful.
                        </p>
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden md:flex w-full py-16 lg:py-20 flex-col items-center text-center">
                        <h1 className="text-[2.5rem] lg:text-[3rem] xl:text-[3.5rem] font-bold text-white leading-[1.2] mb-2">
                            India&apos;s Only <span className="text-[#FF850B]">&ldquo;Ghar Ka Khana&rdquo;</span> Diet Plan
                        </h1>
                        <h2 className="text-[2.5rem] lg:text-[3rem] xl:text-[3.5rem] font-bold text-white leading-[1.2] mb-4">
                            That Gets You <span className="text-[#FF850B]">Wedding-Ready.</span>
                        </h2>
                        <p className="text-white/80 text-[18px] leading-[1.7] mt-4 max-w-[580px]">
                            Because you shouldn&apos;t have to suffer to look beautiful.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
