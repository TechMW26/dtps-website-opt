// Dev-only c-ares DNS fallback.
//
// Symptom: `mongodb+srv://` URIs fail with
//   querySrv ECONNREFUSED _mongodb._tcp.<cluster>.mongodb.net
// while the OS resolver still works, so only Node's c-ares lookups break.
//
// Cause: on some Windows setups c-ares ends up with no usable DNS server and
// falls back to 127.0.0.1, where nothing is listening. `dns.lookup()` (the OS
// path used by http/net) keeps working, which is why only SRV lookups fail.
//
// This only assigns fallback resolvers when the current list is unusable, so it
// is a no-op on healthy machines. Load with:
//   NODE_OPTIONS=--require ./scripts/dev-dns-fallback.cjs
const dns = require('node:dns');

try {
  const servers = dns.getServers();
  const usable = (servers || []).some(
    (server) => server && !/^(127\.|0\.0\.0\.0$|::1$|::$)/.test(server)
  );

  if (!usable) {
    dns.setServers(['1.1.1.1', '8.8.8.8']);
    console.warn(
      `[dev-dns] c-ares had no usable resolver (${JSON.stringify(servers)}); ` +
        'using 1.1.1.1 / 8.8.8.8 so mongodb+srv:// lookups succeed.'
    );
  }
} catch {
  // Never block startup over a DNS fallback.
}
