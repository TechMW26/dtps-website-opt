'use client';

import Image from 'next/image';

interface TestimonialCard {
    initials: string;
    name: string;
    role: string;
    content: string;
    isHighlighted?: boolean;
}

interface TestimonialsSectionProps {
    title?: string;
    subtitle?: string;
    imageUrl?: string;
    testimonials?: TestimonialCard[];
}

const defaultTestimonials: TestimonialCard[] = [
    {
        initials: 'R',
        name: 'Rekha Rajput',
        role: 'Client',
        content: 'I am extremely happy and satisfied with my experience with Dietitian. Just 1 month, I lost 3 kg! I am genuinely thrilled with the results.',
        isHighlighted: true,
    },
    {
        initials: 'C',
        name: 'Chanchal Agrawal',
        role: 'Client',
        content: 'Great experience with DTPS team. In 3 months, I achieved noticeable weight loss approx 7kgs and 2 inches reduced in upper body.',
    },
    {
        initials: 'S',
        name: 'Swati Sharma',
        role: 'Client',
        content: 'My weight and inch loss journey has been very encouraging. I have noticed a clear difference in my body measurements, especially around my waist and hips.',
    },
    {
        initials: 'P',
        name: 'Priya Verma',
        role: 'Client',
        content: 'The personalized diet plan worked wonders for me. Lost 5kg in 2 months with proper guidance and support from the team.',
    },
];

export default function TestimonialsSection({
    title = 'Success stories from our clients',
    subtitle = 'Our Testimonials',
    imageUrl = '/images/threetesti.png',
    testimonials = defaultTestimonials,
}: TestimonialsSectionProps) {
    return (
        <section className="site-card-padding bg-[#f0f4f8] py-10 md:py-16 rounded-[30px] mt-[32px] sm:mt-[120px]">
            <div className="site-fill">
                {/* Mobile Layout */}
                <div className="block lg:hidden">
                    {/* Single image at top for mobile */}
                    <div className="relative mb-6">
                        <div className="w-full rounded-[16px] overflow-hidden bg-gray-200">
                            <Image
                                src={imageUrl}
                                alt="Testimonials"
                                width={1200}
                                height={800}
                                className="object-cover w-full h-auto"
                                loading="lazy"
                                sizes="100vw"
                                quality={80}
                                placeholder="empty"
                                unoptimized
                            />
                        </div>
                    </div>

                    {/* Header for mobile */}
                    <div className="mb-5 text-left">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-[#ff9100] text-lg">✦</span>
                            <span className="text-sm font-semibold text-teal-600">{subtitle}</span>
                        </div>
                        <h2 className="text-[1.4rem] font-bold text-gray-900 leading-tight">{title}</h2>
                    </div>

                    {/* Testimonial Cards for mobile - carousel */}
                    <div className="flex gap-3 pb-1 overflow-x-auto snap-x snap-mandatory scrollbar-hide">
                        {testimonials.map((testimonial, index) => (
                            <div
                                key={index}
                                className={`snap-start shrink-0 w-[86%] rounded-[16px] p-4 ${testimonial.isHighlighted ? 'bg-[#ff9100] text-white' : 'bg-white shadow-md'
                                    }`}
                            >
                                <p
                                    className={`text-[0.8rem] leading-relaxed mb-3 italic ${testimonial.isHighlighted ? 'text-white' : 'text-gray-600'
                                        }`}
                                >
                                    &ldquo;{testimonial.content}&rdquo;
                                </p>
                                <div
                                    className={`flex items-center gap-2 pt-2 border-t ${testimonial.isHighlighted ? 'border-white/20' : 'border-gray-200'
                                        }`}
                                >
                                    <div
                                        className={`flex items-center justify-center w-8 h-8 text-sm font-bold rounded-full ${testimonial.isHighlighted
                                                ? 'bg-white/20 text-white'
                                                : 'bg-teal-600 text-white'
                                            }`}
                                    >
                                        {testimonial.initials}
                                    </div>
                                    <div>
                                        <div
                                            className={`text-sm font-bold ${testimonial.isHighlighted ? 'text-white' : 'text-gray-900'
                                                }`}
                                        >
                                            {testimonial.name}
                                        </div>
                                        <div
                                            className={`text-[0.7rem] ${testimonial.isHighlighted ? 'text-white/70' : 'text-gray-500'
                                                }`}
                                        >
                                            {testimonial.role}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Desktop Layout */}
                <div className="items-start hidden gap-10 lg:flex">
                    {/* Left - Header and Testimonial Cards */}
                    <div className="flex-1 max-w-[520px]">
                        {/* Header */}
                        <div className="mb-8 text-left">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-[#ff9100] text-xl">✦</span>
                                <span className="text-base font-semibold text-teal-600">{subtitle}</span>
                            </div>
                            <h2 className="text-[2.2rem] font-bold text-gray-900 leading-tight">{title}</h2>
                        </div>

                        {/* Testimonial Cards Grid - 2 columns, 2 rows */}
                        <div className="grid grid-cols-2 gap-4">
                            {testimonials.map((testimonial, index) => (
                                <div
                                    key={index}
                                    className={`rounded-[16px] p-5 ${testimonial.isHighlighted
                                            ? 'bg-[#ff9100] text-white shadow-[0_10px_30px_rgba(255,145,0,0.25)]'
                                            : 'bg-white shadow-md'
                                        }`}
                                >
                                    <p
                                        className={`text-[0.82rem] leading-relaxed mb-4 italic ${testimonial.isHighlighted ? 'text-white' : 'text-gray-600'
                                            }`}
                                    >
                                        &ldquo;{testimonial.content}&rdquo;
                                    </p>
                                    <div
                                        className={`flex items-center gap-3 pt-3 border-t ${testimonial.isHighlighted ? 'border-white/20' : 'border-gray-200'
                                            }`}
                                    >
                                        <div
                                            className={`flex items-center justify-center text-base font-bold rounded-full w-9 h-9 ${testimonial.isHighlighted
                                                    ? 'bg-white/20 text-white'
                                                    : 'bg-teal-600 text-white'
                                                }`}
                                        >
                                            {testimonial.initials}
                                        </div>
                                        <div>
                                            <div
                                                className={`text-sm font-bold ${testimonial.isHighlighted ? 'text-white' : 'text-gray-900'
                                                    }`}
                                            >
                                                {testimonial.name}
                                            </div>
                                            <div
                                                className={`text-[0.72rem] ${testimonial.isHighlighted ? 'text-white/70' : 'text-gray-500'
                                                    }`}
                                            >
                                                {testimonial.role}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right - Single testimonial image */}
                    <div className="flex items-center justify-center flex-1">
                        <div className="w-full max-w-[520px] rounded-[20px] overflow-hidden bg-gray-200">
                            <Image
                                src={imageUrl}
                                alt="Testimonials"
                                width={1200}
                                height={800}
                                className="object-cover w-full h-auto"
                                loading="lazy"
                                sizes="(min-width: 1024px) 520px, 100vw"
                                quality={80}
                                placeholder="empty"
                                unoptimized
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
