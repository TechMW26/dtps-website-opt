/**
 * Lightweight server-side security utilities.
 *
 * - `logSecurityEvent`: persist an audit-trail entry. All failures are
 *   swallowed so logging never breaks the calling request.
 * - `getClientIp` / `getUserAgent`: reliable client-attribution helpers
 *   for both the Edge middleware (Headers) and the Node API routes
 *   (NextRequest).
 * - `sanitizeHtml`: DOMPurify-backed XSS sanitizer for any user-supplied
 *   HTML (blog posts, popup content, etc.) before persisting or rendering.
 */

// NOTE: `isomorphic-dompurify` pulls in JSDOM, which is heavy and has caused
// module-init failures on some serverless runtimes. We lazy-load it so that
// importing this file (e.g. from `lib/auth.ts`) never crashes API routes that
// don't actually sanitize HTML.
let _DOMPurify: { sanitize: (input: string, config?: unknown) => string } | null = null;
function getDOMPurify() {
  if (_DOMPurify) return _DOMPurify;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mod = require('isomorphic-dompurify');
  _DOMPurify = (mod && (mod.default || mod)) as typeof _DOMPurify;
  return _DOMPurify!;
}
import dbConnect from '@/lib/mongodb';
import SecurityLog, {
  type ISecurityLog,
  type SecurityEventType,
  type SecuritySeverity,
} from '@/models/SecurityLog';

type LogInput = Omit<Partial<ISecurityLog>, 'createdAt'> & {
  type: SecurityEventType;
  message: string;
  severity?: SecuritySeverity;
};

export async function logSecurityEvent(event: LogInput): Promise<void> {
  try {
    await dbConnect();
    await SecurityLog.create({
      severity: 'info',
      ...event,
    });
  } catch {
    // Audit logging must never break the calling request.
  }
}

export function getClientIp(headers: Headers): string {
  const xff = headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0]!.trim();
  return (
    headers.get('x-real-ip') ||
    headers.get('cf-connecting-ip') ||
    headers.get('fastly-client-ip') ||
    'unknown'
  );
}

export function getUserAgent(headers: Headers): string {
  return headers.get('user-agent') || 'unknown';
}

/**
 * XSS-safe sanitizer for user-supplied HTML. Allows the formatting tags
 * the rich-text editor produces but strips scripts, event handlers,
 * iframes, and dangerous URI schemes.
 */
export function sanitizeHtml(input: string): string {
  if (!input) return '';
  return getDOMPurify().sanitize(input, {
    ALLOWED_TAGS: [
      'p',
      'br',
      'strong',
      'em',
      'u',
      's',
      'a',
      'ul',
      'ol',
      'li',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'blockquote',
      'code',
      'pre',
      'img',
      'figure',
      'figcaption',
      'table',
      'thead',
      'tbody',
      'tr',
      'th',
      'td',
      'span',
      'div',
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'target', 'rel', 'class'],
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'style'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
  });
}

/**
 * Plain-text sanitizer – strips ALL HTML. Use for short user inputs that
 * should never contain markup (names, emails, message previews).
 */
export function sanitizeText(input: string, maxLength = 500): string {
  if (!input) return '';
  const stripped = getDOMPurify().sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
  return stripped.slice(0, maxLength).trim();
}
