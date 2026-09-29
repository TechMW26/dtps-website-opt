// Public URLs are separate from database category keys and implementation paths.
// Abbreviations are navigation aliases, not a way to bypass health-data rules.
const PUBLIC_ROUTES = [
  { path: '/wldtps', internal: '/weight-loss-plan', legacy: ['/weight-loss-plan', '/weight-loss', '/weight-loos-plan'] },
  { path: '/pcdtps', internal: '/pcod', legacy: ['/pcod'] },
  { path: '/tpdtps', internal: '/plans/therapeutic', legacy: ['/plans/therapeutic'] },
  { path: '/wddtps', internal: '/plans/wedding', legacy: ['/plans/wedding'] },
  { path: '/wldtps-2499', internal: '/weight-loss-plan-2499', legacy: ['/weight-loss-plan-2499'] },
  { path: '/wldtps/lead/1', internal: '/weight-loss/Leadform/1', legacy: ['/weight-loss/Leadform/1'] },
  { path: '/wldtps/lead/1/thankyou', internal: '/weight-loss/Leadform/1/thankyou', legacy: ['/weight-loss/Leadform/1/thankyou'] },
  // Thyroid support currently belongs to the shared therapeutic programme.
  { path: '/thydtps', internal: '/plans/therapeutic', legacy: ['/thyroid', '/thyroid-plan'] },
];

/** Normalize old CMS links without rewriting assets, category IDs or other sites. */
function toPublicUrl(value) {
  if (typeof value !== 'string' || !value) return value;
  const isRelative = value.startsWith('/') && !value.startsWith('//');
  try {
    const url = new URL(value, 'https://www.dtpoonamsagar.com');
    if (!isRelative && !['dtpoonamsagar.com', 'www.dtpoonamsagar.com'].includes(url.hostname)) return value;
    if (!['http:', 'https:'].includes(url.protocol)) return value;
    const pathname = url.pathname.replace(/\/$/, '') || '/';
    const route = PUBLIC_ROUTES.find((entry) => entry.legacy.includes(pathname));
    if (!route) return value;
    return `${isRelative ? '' : url.origin}${route.path}${url.search}${url.hash}`;
  } catch {
    return value;
  }
}

module.exports = { PUBLIC_ROUTES, toPublicUrl };
