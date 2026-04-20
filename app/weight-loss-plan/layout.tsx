import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Weight Loss Programs',
    description: 'Lose up to 5 kg in a month with personalised, home-based diet plans. No supplements, no starvation — expert-guided weight loss by Dietitian Poonam Sagar.',
    keywords: [
        'weight loss diet plan India',
        'personalised weight loss',
        'dietitian for weight loss',
        'home-based diet plan',
        'lose weight fast India',
        'Poonam Sagar weight loss',
    ],
    openGraph: {
        title: 'Weight Loss Programs | Dietitian Poonam Sagar',
        description: 'Lose up to 5 kg in a month with personalised, home-based diet plans. No supplements, no starvation.',
        type: 'website',
    },
    alternates: { canonical: '/weight-loss-plan' },
};

export default function WeightLossLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            {/* Preload weight-loss specific hero images */}
            <link
                rel="preload"
                href="https://ik.imagekit.io/br0mssyqj/tr:w-1920,q-80,f-auto,pr-true/DTPS-Ecommerce/dynamic/plan-banners/weight-loss-hero-desktop.png"
                as="image"
                type="image/webp"
                media="(min-width: 768px)"
            />
            <link
                rel="preload"
                href="https://ik.imagekit.io/br0mssyqj/tr:w-768,q-75,f-auto,pr-true/DTPS-Ecommerce/dynamic/plan-banners/weight-loss-hero-mobile.png"
                as="image"
                type="image/webp"
                media="(max-width: 767px)"
            />
            {children}
        </>
    );
}
