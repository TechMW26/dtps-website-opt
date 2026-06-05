'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { X, ChevronDown } from 'lucide-react';

const LOGO_SRC = '/logo (2).png';

interface FormState {
    name: string;
    city: string;
    contactNumber: string;
    email: string;
    age: string;
    gender: string;
    height: string;
    weight: string;
    primaryGoal: string;
    medicalConditions: string;
    triedMethods: string;
    dailyRoutine: string;
    preferredCallTime: string;
}

const INITIAL: FormState = {
    name: '',
    city: '',
    contactNumber: '',
    email: '',
    age: '',
    gender: '',
    height: '',
    weight: '',
    primaryGoal: '',
    medicalConditions: '',
    triedMethods: '',
    dailyRoutine: '',
    preferredCallTime: '',
};

const GENDER_OPTIONS = ['Male', 'Female', 'Other'];
const GOAL_OPTIONS = [
    'Weight Loss',
    'Inch Loss / Body Toning',
    'Improve Metabolism',
    'Manage a Medical Condition',
    'General Fitness',
];
const MEDICAL_OPTIONS = [
    'Thyroid',
    'Diabetes',
    'PCOD / PCOS',
    'Cholesterol / Blood Pressure',
    'Migraine',
    'Psoriasis',
    'Other',
];
const TRIED_OPTIONS = [
    'I have not tried before',
    'Diet Plans (Online/Offline)',
    'Gym / Workout Programs',
    'Medication / Supplements',
    'Home Remedies',
    'Yoga / Exercise Routines',
    'Other',
];
const ROUTINE_OPTIONS = [
    'Poor Eating Habits',
    'Lack of Exercise',
    'Stress / Emotional Eating',
    'Hormonal Issues (Thyroid/PCOS)',
    'Sitting Job',
];
const CALL_TIME_OPTIONS = [
    '09:00 AM - 12:00 PM',
    '12:00 PM - 03:00 PM',
    '03:00 PM - 06:00 PM',
    '06:00 PM - 09:00 PM',
];

const TOTAL_STEPS = 5;

interface Props {
    formId?: string;
}

export default function LeadFormMultiStep({ formId = '1' }: Props) {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [data, setData] = useState<FormState>(INITIAL);
    const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
    const [submitting, setSubmitting] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);

    const progress = useMemo(() => (step / TOTAL_STEPS) * 100, [step]);

    const setField = <K extends keyof FormState>(k: K, v: FormState[K]) => {
        setData((d) => ({ ...d, [k]: v }));
        if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
    };

    const validateStep = (s: number): boolean => {
        const e: Partial<Record<keyof FormState, string>> = {};
        const req = (k: keyof FormState, msg = 'This field is required') => {
            if (!data[k] || data[k].trim() === '') e[k] = msg;
        };

        if (s === 1) {
            req('name');
            req('city');
            req('contactNumber');
            req('email');
            req('age');
            req('gender');
            if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
                e.email = 'Please enter a valid email';
            }
            const digits = data.contactNumber.replace(/\D/g, '');
            if (data.contactNumber && (digits.length < 7 || digits.length > 15)) {
                e.contactNumber = 'Please enter a valid number';
            }
        } else if (s === 2) {
            req('height');
            req('weight');
            req('primaryGoal');
            req('medicalConditions');
        } else if (s === 3) {
            req('triedMethods');
            req('dailyRoutine');
        } else if (s === 5) {
            req('preferredCallTime');
        }

        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleNext = () => {
        setServerError(null);
        if (!validateStep(step)) return;
        setStep((s) => Math.min(s + 1, TOTAL_STEPS));
    };

    const handleBack = () => {
        setServerError(null);
        setStep((s) => Math.max(s - 1, 1));
    };

    const handleSubmit = async () => {
        setServerError(null);
        if (!validateStep(5)) return;
        setSubmitting(true);
        try {
            const res = await fetch('/api/form-submissions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...data, formId }),
            });
            const json = await res.json();
            if (!res.ok || !json.success) {
                if (json.errors) setErrors(json.errors);
                setServerError(json.message || 'Could not submit the form. Please try again.');
                setSubmitting(false);
                return;
            }
            setSubmitted(true);
        } catch (err) {
            console.error(err);
            setServerError('Network error. Please try again.');
            setSubmitting(false);
        }
    };

    const inputCls = (err?: string) =>
        `w-full rounded-md border ${err ? 'border-red-400' : 'border-gray-200'
        } bg-gray-50 px-3.5 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition`;

    const selectCls = (err?: string) =>
        `w-full appearance-none rounded-md border ${err ? 'border-red-400' : 'border-gray-200'
        } bg-gray-50 px-3.5 py-2.5 pr-9 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition`;

    const Label = ({ children }: { children: React.ReactNode }) => (
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
            {children} <span className="text-red-500">*</span>
        </label>
    );

    const FieldError = ({ msg }: { msg?: string }) =>
        msg ? <p className="mt-1 text-xs text-red-500">{msg}</p> : null;

    const SelectField = ({
        value,
        onChange,
        options,
        placeholder,
        err,
    }: {
        value: string;
        onChange: (v: string) => void;
        options: string[];
        placeholder: string;
        err?: string;
    }) => (
        <div className="relative">
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={`${selectCls(err)} ${value ? 'text-gray-800' : 'text-gray-400'}`}
            >
                <option value="" disabled>
                    {placeholder}
                </option>
                {options.map((o) => (
                    <option key={o} value={o} className="text-gray-800">
                        {o}
                    </option>
                ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </div>
    );

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 px-4 py-8">
            <div className="relative w-full max-w-3xl rounded-2xl bg-white p-6 shadow-xl ring-1 ring-black/5 sm:p-10">
                {/* Close button */}
                <Link
                    href="/weight-loss-plan"
                    aria-label="Close"
                    className="absolute right-4 top-4 rounded-full p-1.5 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
                >
                    <X className="h-5 w-5" />
                </Link>

                {/* Logo */}
                <div className="flex justify-center">
                    <Image
                        src={LOGO_SRC}
                        alt="Dietitian Poonam Sagar"
                        width={320}
                        height={97}
                        className="h-auto w-[74%] max-w-[240px] sm:w-full sm:max-w-[220px]"
                        priority
                    />
                </div>

                {submitted ? (
                    <div className="py-10 text-center">
                        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                            <svg
                                className="h-8 w-8 text-green-600"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2.5}
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="mb-2 text-2xl font-bold text-gray-800">Thank You!</h2>
                        <p className="mx-auto max-w-md text-sm text-gray-500">
                            Your details have been submitted successfully. Our team will reach out to you at
                            your preferred time.
                        </p>
                        <button
                            onClick={() => router.push('/weight-loss-plan')}
                            className="mt-6 rounded-md bg-orange-500 px-8 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
                        >
                            Done
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Title (step 1 only) */}
                        {step === 1 && (
                            <h1 className="mt-5 text-center text-2xl font-bold text-slate-600">
                                Let&apos;s Get Started
                            </h1>
                        )}

                        {/* Progress bar */}
                        <div className="mx-auto mt-6 h-2 w-full max-w-xl overflow-hidden rounded-full bg-gray-100">
                            <div
                                className="h-full rounded-full bg-orange-500 transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            />
                        </div>

                        <div className="mt-8">
                            {/* STEP 1 */}
                            {step === 1 && (
                                <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                                    <div>
                                        <Label>Name</Label>
                                        <input
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => setField('name', e.target.value)}
                                            placeholder="Text"
                                            className={inputCls(errors.name)}
                                        />
                                        <FieldError msg={errors.name} />
                                    </div>
                                    <div>
                                        <Label>City</Label>
                                        <input
                                            type="text"
                                            value={data.city}
                                            onChange={(e) => setField('city', e.target.value)}
                                            placeholder="Enter your city"
                                            className={inputCls(errors.city)}
                                        />
                                        <FieldError msg={errors.city} />
                                    </div>
                                    <div>
                                        <Label>Contact Number</Label>
                                        <input
                                            type="tel"
                                            value={data.contactNumber}
                                            onChange={(e) => setField('contactNumber', e.target.value)}
                                            placeholder="Your WhatsApp number here"
                                            className={inputCls(errors.contactNumber)}
                                        />
                                        <FieldError msg={errors.contactNumber} />
                                    </div>
                                    <div>
                                        <Label>Email</Label>
                                        <input
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setField('email', e.target.value)}
                                            placeholder="Enter your email"
                                            className={inputCls(errors.email)}
                                        />
                                        <FieldError msg={errors.email} />
                                    </div>
                                    <div>
                                        <Label>Age</Label>
                                        <input
                                            type="number"
                                            value={data.age}
                                            onChange={(e) => setField('age', e.target.value)}
                                            placeholder="Enter your age"
                                            className={inputCls(errors.age)}
                                        />
                                        <FieldError msg={errors.age} />
                                    </div>
                                    <div>
                                        <Label>Gender</Label>
                                        <SelectField
                                            value={data.gender}
                                            onChange={(v) => setField('gender', v)}
                                            options={GENDER_OPTIONS}
                                            placeholder="Select your gender"
                                            err={errors.gender}
                                        />
                                        <FieldError msg={errors.gender} />
                                    </div>
                                </div>
                            )}

                            {/* STEP 2 */}
                            {step === 2 && (
                                <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                                    <div>
                                        <Label>Height</Label>
                                        <input
                                            type="text"
                                            value={data.height}
                                            onChange={(e) => setField('height', e.target.value)}
                                            placeholder="Enter your height"
                                            className={inputCls(errors.height)}
                                        />
                                        <FieldError msg={errors.height} />
                                    </div>
                                    <div>
                                        <Label>Weight</Label>
                                        <input
                                            type="text"
                                            value={data.weight}
                                            onChange={(e) => setField('weight', e.target.value)}
                                            placeholder="Enter your weight in Kg"
                                            className={inputCls(errors.weight)}
                                        />
                                        <FieldError msg={errors.weight} />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <Label>Your primary goal?</Label>
                                        <SelectField
                                            value={data.primaryGoal}
                                            onChange={(v) => setField('primaryGoal', v)}
                                            options={GOAL_OPTIONS}
                                            placeholder="Choose an option"
                                            err={errors.primaryGoal}
                                        />
                                        <FieldError msg={errors.primaryGoal} />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <Label>Any Medical Conditions?</Label>
                                        <SelectField
                                            value={data.medicalConditions}
                                            onChange={(v) => setField('medicalConditions', v)}
                                            options={MEDICAL_OPTIONS}
                                            placeholder="Choose an option"
                                            err={errors.medicalConditions}
                                        />
                                        <FieldError msg={errors.medicalConditions} />
                                    </div>
                                </div>
                            )}

                            {/* STEP 3 */}
                            {step === 3 && (
                                <div className="grid grid-cols-1 gap-y-4">
                                    <div>
                                        <Label>Have you tried any methods for weight loss before?</Label>
                                        <SelectField
                                            value={data.triedMethods}
                                            onChange={(v) => setField('triedMethods', v)}
                                            options={TRIED_OPTIONS}
                                            placeholder="Choose an option"
                                            err={errors.triedMethods}
                                        />
                                        <FieldError msg={errors.triedMethods} />
                                    </div>
                                    <div>
                                        <Label>Which of the following describes your daily routine?</Label>
                                        <SelectField
                                            value={data.dailyRoutine}
                                            onChange={(v) => setField('dailyRoutine', v)}
                                            options={ROUTINE_OPTIONS}
                                            placeholder="Choose an option"
                                            err={errors.dailyRoutine}
                                        />
                                        <FieldError msg={errors.dailyRoutine} />
                                    </div>
                                </div>
                            )}

                            {/* STEP 4 - info */}
                            {step === 4 && (
                                <div className="py-6 text-center">
                                    <p className="mx-auto max-w-xl text-base text-gray-600">
                                        Paid plans are available starting at{' '}
                                        <span className="font-semibold text-gray-800">₹2,499</span>, designed to
                                        provide value and flexibility.
                                    </p>
                                </div>
                            )}

                            {/* STEP 5 */}
                            {step === 5 && (
                                <div className="grid grid-cols-1 gap-y-4">
                                    <div>
                                        <Label>Please select your preferred time for a call</Label>
                                        <SelectField
                                            value={data.preferredCallTime}
                                            onChange={(v) => setField('preferredCallTime', v)}
                                            options={CALL_TIME_OPTIONS}
                                            placeholder="Choose an option"
                                            err={errors.preferredCallTime}
                                        />
                                        <FieldError msg={errors.preferredCallTime} />
                                    </div>
                                </div>
                            )}
                        </div>

                        {serverError && (
                            <p className="mt-4 text-center text-sm text-red-500">{serverError}</p>
                        )}

                        {/* Terms note (step 1) */}
                        {step === 1 && (
                            <p className="mt-6 text-center text-xs text-gray-400">
                                By clicking the &apos;Next&apos; button you agree to{' '}
                                <Link href="/terms" className="font-medium text-gray-500 underline">
                                    Terms &amp; Conditions
                                </Link>
                            </p>
                        )}

                        {/* Actions */}
                        <div className="mt-6 flex items-center justify-center gap-3">
                            {step > 1 && (
                                <button
                                    type="button"
                                    onClick={handleBack}
                                    className="rounded-md bg-teal-500 px-8 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-600"
                                >
                                    Back
                                </button>
                            )}

                            {step < TOTAL_STEPS ? (
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    className="rounded-md bg-orange-500 px-8 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
                                >
                                    Next
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                    className="rounded-md bg-orange-500 px-8 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {submitting ? 'Submitting…' : 'Submit'}
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
