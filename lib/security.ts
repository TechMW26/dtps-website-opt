import sanitizeHtmlLib from 'sanitize-html';
import { FieldValue } from '@/lib/mongo-website-types.mjs';
import { getWebsiteDatabase } from '@/lib/website-database';

type LogInput = { type: string; message: string; severity?: string; email?: string; [key: string]: unknown };
export async function logSecurityEvent(event: LogInput): Promise<void> {
  try { await getWebsiteDatabase().collection('websiteSecurityLogs').add({ severity: 'info', ...event, createdAt: FieldValue.serverTimestamp() }); } catch { /* audit logging must never break auth */ }
}
export function getClientIp(headers: Headers): string { const xff = headers.get('x-forwarded-for'); return xff ? xff.split(',')[0]!.trim() : headers.get('x-real-ip') || headers.get('cf-connecting-ip') || headers.get('fastly-client-ip') || 'unknown'; }
export function getUserAgent(headers: Headers): string { return headers.get('user-agent') || 'unknown'; }
export function sanitizeHtml(input: string): string { if (!input) return ''; return sanitizeHtmlLib(input, { allowedTags: ['p','br','strong','em','u','s','a','ul','ol','li','h1','h2','h3','h4','h5','h6','blockquote','code','pre','img','figure','figcaption','table','thead','tbody','tr','th','td','span','div'], allowedAttributes: { '*': ['class','title'], a: ['href','target','rel'], img: ['src','alt','title'] }, allowedSchemes: ['http','https','mailto','tel'], disallowedTagsMode: 'discard', parser: { lowerCaseTags: true } }); }
export function sanitizeText(input: string, maxLength = 500): string { if (!input) return ''; return sanitizeHtmlLib(input, { allowedTags: [], allowedAttributes: {}, disallowedTagsMode: 'discard' }).slice(0, maxLength).trim(); }
