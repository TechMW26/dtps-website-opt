import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logSecurityEvent, sanitizeText } from '@/lib/security';
import { sendAisensyOnboardingMessage, sendPaymentSuccessEmail } from '@/lib/notifications';

type TestProduct = {
  name: string;
  duration?: string;
  quantity: number;
  price: number;
};

function normalizeProducts(products: unknown): TestProduct[] {
  if (!Array.isArray(products) || products.length === 0) {
    return [
      {
        name: 'DTPS Onboarding Plan',
        quantity: 1,
        price: 299,
      },
    ];
  }

  return products.map((item) => {
    const product = item as Record<string, unknown>;
    return {
      name: sanitizeText(String(product.name || 'DTPS Plan'), 80),
      duration: sanitizeText(String(product.duration || ''), 40) || undefined,
      quantity: Number(product.quantity || 1),
      price: Number(product.price || 0),
    };
  });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const role = (session.user as any)?.role;
  if (role !== 'superadmin' && role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await req.json();

    const customerName = sanitizeText(String(body?.name || session.user.name || 'DTPS User'), 80);
    const customerEmail = sanitizeText(String(body?.email || session.user.email || ''), 120).toLowerCase();
    const customerPhone = sanitizeText(String(body?.phone || ''), 20);
    const orderId = sanitizeText(
      String(body?.orderId || `TEST-${Date.now()}`),
      60
    );
    const total = Number(body?.total || 299);
    const products = normalizeProducts(body?.products);

    if (!customerEmail) {
      return NextResponse.json(
        { error: 'email is required to send test email' },
        { status: 400 }
      );
    }

    const payload = {
      orderId,
      customerName,
      customerEmail,
      customerPhone,
      total,
      createdAt: new Date(),
      products,
    };

    const [emailResult, whatsappResult] = await Promise.allSettled([
      sendPaymentSuccessEmail(payload),
      sendAisensyOnboardingMessage(payload),
    ]);

    await logSecurityEvent({
      type: 'admin_action',
      severity: 'info',
      message: `Notification test triggered by ${session.user.email}`,
      email: session.user.email || undefined,
      meta: {
        action: 'test_notifications',
        orderId,
        targetEmail: customerEmail,
        targetPhone: customerPhone,
      },
    });

    return NextResponse.json({
      success: true,
      payload: {
        customerName,
        customerEmail,
        customerPhone,
        orderId,
        total,
        products,
      },
      email:
        emailResult.status === 'fulfilled'
          ? emailResult.value
          : { skipped: false, error: emailResult.reason?.message || 'Email test failed' },
      whatsapp:
        whatsappResult.status === 'fulfilled'
          ? whatsappResult.value
          : { skipped: false, error: whatsappResult.reason?.message || 'WhatsApp test failed' },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to run notification test' },
      { status: 500 }
    );
  }
}
