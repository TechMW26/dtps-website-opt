import type { Metadata } from 'next';
import LeadFormMultiStep from '@/components/weight-loss/LeadFormMultiStep';

export const metadata: Metadata = {
    title: 'Get Started | Dietitian Poonam Sagar',
    description:
        'Start your personalised weight loss journey with Dietitian Poonam Sagar. Fill in your details and our team will reach out to you.',
    robots: { index: false, follow: false },
};

export default function LeadFormPage() {
    return <LeadFormMultiStep formId="1" />;
}
