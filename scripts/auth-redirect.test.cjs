const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const { NextRequest } = require('next/server');

// Compile the actual TS modules without starting Next or loading auth/database clients.
function loadTypescript(relativePath, redirects) {
  const filename = path.resolve(__dirname, '..', relativePath);
  const compiled = new Module(filename, module);
  compiled.filename = filename;
  compiled.paths = Module._nodeModulePaths(path.dirname(filename));
  const originalRequire = compiled.require.bind(compiled);
  compiled.require = id => id.endsWith('/auth-redirect') ? redirects : originalRequire(id);
  compiled._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText, filename);
  return compiled.exports;
}

const redirects = loadTypescript('lib/auth-redirect.ts');
const proxy = loadTypescript('proxy.ts', redirects).default;
const logout = loadTypescript('app/api/auth/logout-redirect/route.ts', redirects).GET;
const originalAppUrl = process.env.NEXT_PUBLIC_APP_URL;
delete process.env.NEXT_PUBLIC_APP_URL;
process.on('exit', () => {
  if (originalAppUrl === undefined) delete process.env.NEXT_PUBLIC_APP_URL;
  else process.env.NEXT_PUBLIC_APP_URL = originalAppUrl;
});

function request(host, headers = {}, pathname = '/login') {
  return new NextRequest(`http://localhost:3000${pathname}`, {
    headers: { host, ...headers },
  });
}

test('authenticated login redirects to public HTTPS behind Plesk', () => {
  const response = proxy(request('vigil.basalthq.com', { cookie: 'thirdweb_auth_token=regression-probe' }));
  assert.equal(response.status, 307);
  assert.equal(response.headers.get('location'), 'https://vigil.basalthq.com/chat');
});

test('anonymous protected page redirects to public login and preserves query', () => {
  const response = proxy(request('vigil.basalthq.com', {}, '/chat?next=%2Fdocuments'));
  assert.equal(response.headers.get('location'), 'https://vigil.basalthq.com/login?next=%2Fdocuments');
});

test('recognized forwarded public host replaces an internal host', () => {
  const url = redirects.getAuthRedirectUrl(request('localhost:3000', { 'x-forwarded-host': 'vigil.basalthq.com', 'x-forwarded-proto': 'http' }), '/chat');
  assert.equal(url.href, 'https://vigil.basalthq.com/chat');
});

for (const host of ['127.0.0.1:52612', 'localhost:52612', '[::1]:52612']) {
  test(`local preview preserves ${host}`, () => {
    const response = proxy(request(host, { cookie: 'thirdweb_auth_token=regression-probe' }));
    assert.equal(response.headers.get('location'), `http://${host}/chat`);
  });
}

test('unknown forwarded hosts cannot select another redirect destination', () => {
  for (const spoofed of ['attacker.example', 'vigil.basalthq.com.attacker.example', 'vigil.basalthq.com,attacker.example', 'localhost:3000']) {
    const url = redirects.getAuthRedirectUrl(request('vigil.basalthq.com', { 'x-forwarded-host': spoofed }), '/chat');
    assert.equal(url.origin, 'https://vigil.basalthq.com');
  }
});

test('malformed and unknown hosts fall back to the public site', () => {
  for (const host of ['attacker.example', 'localhost:3000@attacker.example', 'localhost:3000\\attacker.example', 'localhost:3000/path', 'localhost:3000,attacker.example']) {
    const url = redirects.getAuthRedirectUrl(request(host), '/chat');
    assert.equal(url.origin, 'https://vigil.basalthq.com');
  }
});

test('configured deployment origin supports a sandbox hostname', () => {
  process.env.NEXT_PUBLIC_APP_URL = 'https://vigil-sand.basalthq.com';
  try {
    const url = redirects.getAuthRedirectUrl(request('localhost:3000', { 'x-forwarded-host': 'vigil-sand.basalthq.com' }), '/chat');
    assert.equal(url.origin, 'https://vigil-sand.basalthq.com');
  } finally {
    delete process.env.NEXT_PUBLIC_APP_URL;
  }
});

test('a stale local deployment setting does not replace the public origin', () => {
  process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
  try {
    assert.equal(redirects.getAuthRedirectUrl(request('vigil.basalthq.com'), '/chat').origin, 'https://vigil.basalthq.com');
  } finally {
    delete process.env.NEXT_PUBLIC_APP_URL;
  }
});

test('logout preserves the preview address and clears the auth cookie', async () => {
  const response = await logout(request('127.0.0.1:52612', {}, '/api/auth/logout-redirect'));
  assert.equal(response.headers.get('location'), 'http://127.0.0.1:52612/login');
  assert.match(response.headers.get('set-cookie'), /thirdweb_auth_token=;/);
  assert.match(response.headers.get('set-cookie'), /Expires=Thu, 01 Jan 1970/);
});

test('anonymous login and authenticated workspace keep their existing behavior', () => {
  assert.equal(proxy(request('vigil.basalthq.com')).headers.get('location'), null);
  assert.equal(proxy(request('vigil.basalthq.com', { cookie: 'thirdweb_auth_token=regression-probe' }, '/chat')).headers.get('location'), null);
});
