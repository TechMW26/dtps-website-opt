import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Weight Loss Programs - Dietitian Poonam Sagar',
    description: 'Guaranteed weight loss upto 5 Kg in a month with personalized diet plans. No supplements, no starvation, home-based diet by expert dietitians.',
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
