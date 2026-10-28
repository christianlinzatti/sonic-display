'use strict';
// Production API route imports must succeed without OAuth credentials in CI.
// OAuth secrets are required when a request actually uses the session service.
const assert = require('node:assert/strict');
const { load } = require('./helpers/ts-loader-v404.cjs');

const names = ['SPOTIFY_CLIENT_ID', 'SPOTIFY_CLIENT_SECRET', 'SPOTIFY_REDIRECT_URI', 'SESSION_SECRET'];
const original = Object.fromEntries(names.map(name => [name, process.env[name]]));
const calls = [];
const response = { cookies: { set: (...args) => calls.push(args) } };
try {
  for (const name of names) delete process.env[name];
  const session = load('lib/session');
  assert.equal(session.SESSION_COOKIE, 'sonic_session', 'module must load without Spotify credentials');
  assert.throws(() => session.clearSessionCookie(response), /Missing environment variable: SPOTIFY_CLIENT_ID/,
    'missing required credentials must still fail when a session cookie is actually used');
  assert.equal(calls.length, 0, 'invalid configuration must not write a cookie');

  Object.assign(process.env, {
    SPOTIFY_CLIENT_ID: 'test-client-id',
    SPOTIFY_CLIENT_SECRET: 'test-client-secret',
    SPOTIFY_REDIRECT_URI: 'https://example.test/api/spotify/callback',
    SESSION_SECRET: 'session-test-secret-at-least-32-characters-long',
  });
  const data = {accessToken:'unit-access',refreshToken:'unit-refresh',expiresAt:9999999999,scopes:'user-read-currently-playing'};
  session.setSessionCookie(response, data);
  const [name, cookie, options] = calls.at(-1);
  assert.equal(name, 'sonic_session');
  assert.equal(options.secure, true);
  assert.equal(options.httpOnly, true);
  assert.equal(options.sameSite, 'lax');
  assert.equal(options.maxAge, 60 * 60 * 24 * 30);
  assert.deepEqual(session.decryptSession(cookie), data, 'session encryption roundtrip must remain functional');
  assert.equal(session.decryptSession('invalid.cookie'), null);

  session.setStateCookie(response, 'test-state');
  assert.equal(calls.at(-1)[0], 'sonic_oauth_state');
  assert.equal(calls.at(-1)[2].path, '/api/spotify');
  assert.equal(calls.at(-1)[2].maxAge, 600);
  session.clearStateCookie(response);
  assert.equal(calls.at(-1)[2].maxAge, 0);
  session.clearSessionCookie(response);
  assert.equal(calls.at(-1)[2].maxAge, 0);

  process.env.SPOTIFY_REDIRECT_URI = 'http://127.0.0.1:3000/api/spotify/callback';
  session.setStateCookie(response, 'local-state');
  assert.equal(calls.at(-1)[2].secure, false, 'local HTTP cookies must not be secure');
  console.log('PASS Spotify build environment: module import without secrets, runtime configuration validation, session cryptography, cookie security and OAuth state');
} finally {
  for (const name of names) {
    if (original[name] === undefined) delete process.env[name];
    else process.env[name] = original[name];
  }
}
