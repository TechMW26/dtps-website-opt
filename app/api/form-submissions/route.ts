import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import FormSubmission from '@/models/FormSubmission';

export const dynamic = 'force-dynamic';

const REQUIRED_FIELDS = [
    'name',
    'city',
    'contactNumber',
    'email',
    'age',
    'gender',
    'height',
    'weight',
    'primaryGoal',
    'medicalConditions',
    'triedMethods',
    'dailyRoutine',
    'preferredDate',
    'preferredCallTime',
] as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_KEY_RE = /^\d{4}-\d{2}-\d{2}$/;
const CALL_TIME_OPTIONS = new Set([
    '09:00 AM - 12:00 PM',
    '12:00 PM - 03:00 PM',
    '03:00 PM - 06:00 PM',
    '06:00 PM - 09:00 PM',
]);

// Public: submit a lead form
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const errors: Record<string, string> = {};

        for (const field of REQUIRED_FIELDS) {
            const value = body?.[field];
            if (!value || String(value).trim() === '') {
                errors[field] = 'This field is required';
            }
        }

        if (body?.email && !EMAIL_RE.test(String(body.email).trim())) {
            errors.email = 'Please enter a valid email';
        }

        const digits = String(body?.contactNumber || '').replace(/\D/g, '');
        if (body?.contactNumber && (digits.length < 7 || digits.length > 15)) {
            errors.contactNumber = 'Please enter a valid contact number';
        }

        if (body?.preferredDate) {
            const dateValue = String(body.preferredDate).trim();
            const isValidDateKey = DATE_KEY_RE.test(dateValue) && !Number.isNaN(new Date(dateValue).getTime());
            if (!isValidDateKey) {
                errors.preferredDate = 'Please select a valid date';
            }
        }

        if (body?.preferredCallTime) {
            const callTime = String(body.preferredCallTime).trim();
            if (!CALL_TIME_OPTIONS.has(callTime)) {
                errors.preferredCallTime = 'Please select a valid time slot';
            }
        }

        if (Object.keys(errors).length > 0) {
            return NextResponse.json({ success: false, errors }, { status: 400 });
        }

        await dbConnect();

        const formId = String(body.formId || '1').trim();

        const submission = await FormSubmission.create({
            formId,
            name: String(body.name).trim(),
            city: String(body.city).trim(),
            contactNumber: String(body.contactNumber).trim(),
            email: String(body.email).trim().toLowerCase(),
            age: String(body.age).trim(),
            gender: String(body.gender).trim(),
            height: String(body.height).trim(),
            weight: String(body.weight).trim(),
            primaryGoal: String(body.primaryGoal).trim(),
            medicalConditions: String(body.medicalConditions).trim(),
            triedMethods: String(body.triedMethods).trim(),
            dailyRoutine: String(body.dailyRoutine).trim(),
            preferredDate: String(body.preferredDate).trim(),
            preferredCallTime: String(body.preferredCallTime).trim(),
            page: `weight-loss/Leadform/${formId}`,
            source: 'lead-form',
        });

        return NextResponse.json({ success: true, id: String(submission._id) });
    } catch (err) {
        console.error('[form-submissions] POST error:', err);
        return NextResponse.json(
            { success: false, message: 'Failed to submit form' },
            { status: 500 }
        );
    }
}

// Protected: list submissions or the list of forms with counts
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const formId = searchParams.get('formId');
        const distinct = searchParams.get('distinct');
        const isDistinctForms = distinct === 'forms';

        const session = await getServerSession(authOptions);
        // Public access is allowed only for form-specific reads (e.g. ?formId=1)
        // so Apps Script can fetch lead data without admin login.
        if (!session && (!formId || isDistinctForms)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        // Return the list of forms with submission counts
        if (isDistinctForms) {
            const forms = await FormSubmission.aggregate([
                {
                    $group: {
                        _id: '$formId',
                        count: { $sum: 1 },
                        lastSubmittedAt: { $max: '$createdAt' },
                    },
                },
                { $sort: { _id: 1 } },
            ]);
            return NextResponse.json({
                success: true,
                forms: forms.map((f) => ({
                    formId: f._id,
                    count: f.count,
                    lastSubmittedAt: f.lastSubmittedAt,
                })),
            });
        }

        const query: Record<string, unknown> = {};
        if (formId) query.formId = formId;

        const submissions = await FormSubmission.find(query).sort({ createdAt: -1 });

        return NextResponse.json({ success: true, submissions });
    } catch (err) {
        console.error('[form-submissions] GET error:', err);
        return NextResponse.json(
            { error: 'Failed to fetch submissions' },
            { status: 500 }
        );
    }
}

// Protected: delete a submission
export async function DELETE(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) {
            return NextResponse.json({ error: 'Missing id' }, { status: 400 });
        }

        const deleted = await FormSubmission.findByIdAndDelete(id);
        if (!deleted) {
            return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('[form-submissions] DELETE error:', err);
        return NextResponse.json(
            { error: 'Failed to delete submission' },
            { status: 500 }
        );
    }
}
