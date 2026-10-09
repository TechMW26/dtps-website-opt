const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function load() {
  const module = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync('middleware.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const NextResponse = class extends Response {
    static next() { return new Response(null, { status: 200 }); }
    static json(body, options) { return new Response(JSON.stringify(body), options); }
  };
  vm.runInThisContext(`(function(require,module,exports){${code}\n})`)(name => name === 'next/server' ? { NextResponse } : { getToken: async () => ({ sub: 'test' }) }, module, module.exports);
  return module.exports;
}
const req = (path, method) => ({ nextUrl: { pathname: path }, method, headers: new Headers() });
test('cutover pauses every API mutation and side-effecting auth/setup reads but preserves content reads', async () => {
  const old = process.env.WEBSITE_MIGRATION_READ_ONLY;
  process.env.WEBSITE_MIGRATION_READ_ONLY = 'true';
  try {
    const api = load();
    assert.deepEqual(api.config.matcher, ['/admin/:path*', '/api/:path*']);
    for (const path of ['/api/orders', '/api/contact', '/api/appointment', '/api/track-visitor', '/api/pricing', '/api/upload', '/api/banner-upload', '/api/form-submissions']) {
      for (const method of ['POST', 'PUT', 'DELETE', 'PATCH']) {
        const response = await api.middleware(req(path, method));
        assert.equal(response.status, 503);
        assert.equal(response.headers.get('x-website-migration'), 'read-only');
      }
    }
    for (const path of ['/api/auth/session', '/api/admin-setup']) assert.equal((await api.middleware(req(path, 'GET'))).status, 503);
    for (const path of ['/api/pricing', '/api/blogs', '/api/orders', '/api/images/example']) assert.equal((await api.middleware(req(path, 'GET'))).status, 200);
  } finally {
    if (old === undefined) delete process.env.WEBSITE_MIGRATION_READ_ONLY; else process.env.WEBSITE_MIGRATION_READ_ONLY = old;
  }
});
test('normal operation is unchanged when cutover flag is absent or false', async () => {
  const old = process.env.WEBSITE_MIGRATION_READ_ONLY;
  try {
    for (const flag of [undefined, 'false']) {
      if (flag === undefined) delete process.env.WEBSITE_MIGRATION_READ_ONLY; else process.env.WEBSITE_MIGRATION_READ_ONLY = flag;
      const api = load();
      for (const path of ['/api/contact', '/api/appointment', '/api/track-visitor', '/api/auth/session']) assert.equal((await api.middleware(req(path, 'POST'))).status, 200);
    }
  } finally {
    if (old === undefined) delete process.env.WEBSITE_MIGRATION_READ_ONLY; else process.env.WEBSITE_MIGRATION_READ_ONLY = old;
  }
});
