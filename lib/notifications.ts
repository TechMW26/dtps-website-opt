import nodemailer from 'nodemailer';

type PurchasedProduct = {
  name: string;
  quantity: number;
  price: number;
};

type PaymentSuccessPayload = {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  total: number;
  createdAt?: Date;
  products: PurchasedProduct[];
};

function shouldSendEmail() {
  return Boolean(
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS &&
    process.env.SMTP_FROM
  );
}

function shouldSendAisensy() {
  return Boolean(process.env.AISENSY_API_URL && process.env.AISENSY_API_KEY);
}

function normalizePhoneNumber(phone: string) {
  const digits = String(phone || '').replace(/\D/g, '');
  if (!digits) return '';

  if (digits.length === 10) {
    return `91${digits}`;
  }

  if (digits.startsWith('91') && digits.length === 12) {
    return digits;
  }

  return digits;
}

function buildProductsHtml(products: PurchasedProduct[]) {
  return products
    .map(
      (product) =>
        `<li style="margin-bottom:6px;">${product.name} x${product.quantity} - INR ${(product.price * product.quantity).toLocaleString('en-IN')}</li>`
    )
    .join('');
}

export async function sendPaymentSuccessEmail(payload: PaymentSuccessPayload) {
  if (!shouldSendEmail()) {
    return { skipped: true, reason: 'SMTP not configured' };
  }

  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const smtpSecure = String(process.env.SMTP_SECURE || 'false').toLowerCase() === 'true';

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: smtpPort,
    secure: smtpSecure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const subject = `Payment Confirmed - Order ${payload.orderId}`;
  const sentOn = payload.createdAt ? payload.createdAt.toLocaleString('en-IN') : new Date().toLocaleString('en-IN');

  const html = `
    <div style="font-family: Arial, sans-serif; color:#111827; line-height:1.5; max-width:620px; margin:0 auto;">
      <h2 style="margin-bottom:12px;">Hi ${payload.customerName}, your payment is successful.</h2>
      <p>Thank you for choosing DTPS. We have received your payment and your onboarding is now in progress.</p>
      <p style="margin-top:0;">Our health counselor will reach out to you warmly within <strong>24-48 hours</strong>.</p>

      <div style="margin:18px 0; padding:14px; background:#f9fafb; border:1px solid #e5e7eb; border-radius:8px;">
        <p style="margin:0 0 8px;"><strong>Order ID:</strong> ${payload.orderId}</p>
        <p style="margin:0 0 8px;"><strong>Total Paid:</strong> INR ${payload.total.toLocaleString('en-IN')}</p>
        <p style="margin:0;"><strong>Payment Time:</strong> ${sentOn}</p>
      </div>

      <div>
        <p style="margin-bottom:8px;"><strong>Purchased Plan(s)</strong></p>
        <ul style="padding-left:20px; margin-top:0;">${buildProductsHtml(payload.products)}</ul>
      </div>

      <p style="margin-top:16px;">Regards,<br />${process.env.SMTP_NAME || 'DTPS Team'}</p>
    </div>
  `;

  const text = [
    `Hi ${payload.customerName}, your payment is successful.`,
    `Order ID: ${payload.orderId}`,
    `Total Paid: INR ${payload.total.toLocaleString('en-IN')}`,
    'Our health counselor will reach out within 24-48 hours.',
    'Thank you for choosing DTPS.',
  ].join('\n');

  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: payload.customerEmail,
    subject,
    text,
    html,
  });

  return {
    skipped: false,
    messageId: info.messageId,
  };
}

export async function sendAisensyOnboardingMessage(payload: PaymentSuccessPayload) {
  if (!shouldSendAisensy()) {
    return { skipped: true, reason: 'AiSensy not configured' };
  }

  const destination = normalizePhoneNumber(payload.customerPhone);
  if (!destination) {
    return { skipped: true, reason: 'Customer phone is missing/invalid' };
  }

  const campaignName = process.env.AISENSY_CAMPAIGN_NAME || 'payment_success_onboarding';
  const source = process.env.AISENSY_SOURCE || 'dtps-website-checkout';
  const firstName = (payload.customerName || '').trim().split(/\s+/)[0] || 'user';
  const amountFormatted = `INR ${payload.total.toLocaleString('en-IN')}`;
  const planName =
    payload.products && payload.products.length > 0
      ? payload.products.map((p) => (p.quantity > 1 ? `${p.name} x${p.quantity}` : p.name)).join(', ')
      : 'DTPS Plan';

  const body = {
    apiKey: process.env.AISENSY_API_KEY,
    campaignName,
    destination,
    userName: payload.customerName,
    templateParams: [firstName, payload.orderId, amountFormatted, planName],
    source,
    media: {},
    buttons: [],
    carouselCards: [],
    location: {},
    attributes: {
      orderId: payload.orderId,
      amount: amountFormatted,
      planName,
    },
    paramsFallbackValue: {
      FirstName: firstName,
      OrderId: payload.orderId,
      Amount: amountFormatted,
      PlanName: planName,
    },
  };

  const response = await fetch(String(process.env.AISENSY_API_URL), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(`AiSensy request failed (${response.status}): ${responseText.slice(0, 240)}`);
  }

  return {
    skipped: false,
    status: response.status,
    response: responseText.slice(0, 500),
  };
}

export async function sendPostPaymentNotifications(payload: PaymentSuccessPayload) {
  const [emailResult, aisensyResult] = await Promise.allSettled([
    sendPaymentSuccessEmail(payload),
    sendAisensyOnboardingMessage(payload),
  ]);

  return { emailResult, aisensyResult };
}
