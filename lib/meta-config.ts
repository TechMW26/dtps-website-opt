// Single destination for browser tracking and any future approved CAPI setup.
export const META_PIXEL_ID = '39186114291032857';

/**
 * Inert `fbq` queue stub. Installed unconditionally on the client so that
 * `trackEvent` calls can buffer before `fbevents.js` arrives; it makes no
 * network request and sets no cookie. The actual loader + init run only after
 * consent — see `META_PIXEL_BOOTSTRAP` and `components/ConsentGatedTags.tsx`.
 */
export const META_PIXEL_QUEUE_STUB = `
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[]}(window)`;

/**
 * Loader + init, consent-gated. Fetches `fbevents.js` and initialises the
 * pixel so buffered events are delivered, but does NOT fire the initial
 * PageView itself: that is left to `PixelTracker` once consent is resolved.
 */
export const META_PIXEL_BOOTSTRAP = `
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('set', 'autoConfig', false, '${META_PIXEL_ID}');
fbq('init', '${META_PIXEL_ID}');
`;
