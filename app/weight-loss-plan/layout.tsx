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
    alternates: { canonical: '/wldtps' },
};

export default function WeightLossLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            {children}
        </>
    );
}
