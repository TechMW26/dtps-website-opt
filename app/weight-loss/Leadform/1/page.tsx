import type { Metadata } from 'next';
import LeadFormLandingPage from '@/components/weight-loss/LeadFormLandingPage';

export const metadata: Metadata = {
    title: 'Get Started | Dietitian Poonam Sagar',
    description:
        'Start your personalised weight loss journey with Dietitian Poonam Sagar. Fill in your details and our team will reach out to you.',
    robots: { index: false, follow: false },
};

export default function LeadFormPage() {
    return <LeadFormLandingPage formId="1" />;
}
