import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from '@/lib/mongo-website-types.mjs';
import { getWebsiteDatabase } from '@/lib/website-database';
import { validatePhone, validateEmail, validateName, validateMessage, getCountry } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, phoneNumber, countryIso, message } = body || {};

    const errors: Record<string, string> = {};
    const fnErr = validateName(firstName, 'First name'); if (fnErr) errors.firstName = fnErr;
    const lnErr = validateName(lastName, 'Last name'); if (lnErr) errors.lastName = lnErr;
    const emErr = validateEmail(email); if (emErr) errors.email = emErr;
    const msgErr = validateMessage(message); if (msgErr) errors.message = msgErr;
    const phoneRes = validatePhone(phoneNumber, countryIso || 'IN');
    if (!phoneRes.ok) errors.phoneNumber = phoneRes.error || 'Invalid phone';

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ success: false, errors }, { status: 400 });
    }

    const country = getCountry(countryIso || 'IN');
    const ref = getWebsiteDatabase().collection('websiteLeads').doc();
    await ref.set({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      fullName: `${firstName.trim()} ${lastName.trim()}`,
      email: email.trim().toLowerCase(),
      phoneNumber: String(phoneNumber).replace(/\D/g, ''),
      countryCode: country.dialCode,
      countryIso: country.code,
      e164: phoneRes.e164,
      message: message.trim(),
      source: 'contact',
      page: 'contact',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true, leadId: ref.id });
  } catch (err) {
    console.error('[contact] error:', err);
    return NextResponse.json({ success: false, message: 'Failed to send message' }, { status: 500 });
  }
}
