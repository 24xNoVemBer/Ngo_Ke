import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import process from 'node:process';
import test from 'node:test';

const require = createRequire(import.meta.url);
const { privateIpv4Host, gatewayHost, apiHost, resolveCleartextHosts, configureLocalGatewayInfoPlist } = require('../plugins/withVoiceGatewayNetworkSecurity.cjs');

test('cleartext gateway builds only accept private IPv4 or localhost', () => {
  const configuredEndpoint = process.env.EXPO_PUBLIC_NGOKE_VOICE_API_BASE_URL;
  delete process.env.EXPO_PUBLIC_NGOKE_VOICE_API_BASE_URL;
  try {
    for (const host of ['192.168.1.42', '10.0.2.2', '172.31.1.2', '127.0.0.1', 'localhost']) {
      assert.equal(privateIpv4Host(host), true, host);
    }
    for (const host of ['8.8.8.8', '172.32.1.2', '192.169.1.2', 'not-an-ip']) {
      assert.equal(privateIpv4Host(host), false, host);
    }
    assert.throws(() => gatewayHost({ extra: { voiceApiBaseUrl: 'http://voice.example.com' } }), /must use a private IPv4/);
    assert.equal(gatewayHost({ extra: { voiceApiBaseUrl: 'https://voice.example.com' } }), undefined);
  } finally {
    if (configuredEndpoint !== undefined) process.env.EXPO_PUBLIC_NGOKE_VOICE_API_BASE_URL = configuredEndpoint;
  }
});

test('API-only private cleartext endpoint enables cleartext independently of voice', () => {
  const savedApi = process.env.EXPO_PUBLIC_NGOKE_API_BASE_URL;
  const savedVoice = process.env.EXPO_PUBLIC_NGOKE_VOICE_API_BASE_URL;
  delete process.env.EXPO_PUBLIC_NGOKE_API_BASE_URL;
  delete process.env.EXPO_PUBLIC_NGOKE_VOICE_API_BASE_URL;
  try {
    // API-only via env var
    process.env.EXPO_PUBLIC_NGOKE_API_BASE_URL = 'http://10.0.2.2:8086';
    assert.equal(apiHost({}), '10.0.2.2');
    assert.equal(gatewayHost({}), undefined);
    assert.deepEqual(resolveCleartextHosts({}), ['10.0.2.2']);

    // API-only via app.json extra
    delete process.env.EXPO_PUBLIC_NGOKE_API_BASE_URL;
    assert.equal(apiHost({ extra: { apiBaseUrl: 'http://192.168.1.50:8086' } }), '192.168.1.50');
    assert.equal(gatewayHost({ extra: { apiBaseUrl: 'http://192.168.1.50:8086' } }), undefined);
    assert.deepEqual(resolveCleartextHosts({ extra: { apiBaseUrl: 'http://192.168.1.50:8086' } }), ['192.168.1.50']);
  } finally {
    if (savedApi !== undefined) process.env.EXPO_PUBLIC_NGOKE_API_BASE_URL = savedApi;
    if (savedVoice !== undefined) process.env.EXPO_PUBLIC_NGOKE_VOICE_API_BASE_URL = savedVoice;
  }
});

test('HTTPS API endpoint does not enable cleartext exceptions', () => {
  const savedApi = process.env.EXPO_PUBLIC_NGOKE_API_BASE_URL;
  delete process.env.EXPO_PUBLIC_NGOKE_API_BASE_URL;
  try {
    assert.equal(apiHost({ extra: { apiBaseUrl: 'https://api.ngoke.vn' } }), undefined);
    assert.deepEqual(resolveCleartextHosts({ extra: { apiBaseUrl: 'https://api.ngoke.vn' } }), []);
  } finally {
    if (savedApi !== undefined) process.env.EXPO_PUBLIC_NGOKE_API_BASE_URL = savedApi;
  }
});

test('absent or blank API endpoint does not enable cleartext exceptions', () => {
  const savedApi = process.env.EXPO_PUBLIC_NGOKE_API_BASE_URL;
  const savedVoice = process.env.EXPO_PUBLIC_NGOKE_VOICE_API_BASE_URL;
  delete process.env.EXPO_PUBLIC_NGOKE_API_BASE_URL;
  delete process.env.EXPO_PUBLIC_NGOKE_VOICE_API_BASE_URL;
  try {
    assert.equal(apiHost({}), undefined);
    assert.equal(apiHost({ extra: {} }), undefined);
    assert.equal(apiHost({ extra: { apiBaseUrl: '' } }), undefined);
    assert.equal(apiHost({ extra: { apiBaseUrl: '   ' } }), undefined);
    assert.deepEqual(resolveCleartextHosts({}), []);
  } finally {
    if (savedApi !== undefined) process.env.EXPO_PUBLIC_NGOKE_API_BASE_URL = savedApi;
    if (savedVoice !== undefined) process.env.EXPO_PUBLIC_NGOKE_VOICE_API_BASE_URL = savedVoice;
  }
});

test('invalid non-private HTTP API host throws error', () => {
  const savedApi = process.env.EXPO_PUBLIC_NGOKE_API_BASE_URL;
  delete process.env.EXPO_PUBLIC_NGOKE_API_BASE_URL;
  try {
    assert.throws(() => apiHost({ extra: { apiBaseUrl: 'http://api.ngoke.vn' } }), /must use a private IPv4/);
    assert.throws(() => apiHost({ extra: { apiBaseUrl: 'http://8.8.8.8:8086' } }), /must use a private IPv4/);
    assert.throws(() => apiHost({ extra: { apiBaseUrl: 'not-a-valid-url' } }));
  } finally {
    if (savedApi !== undefined) process.env.EXPO_PUBLIC_NGOKE_API_BASE_URL = savedApi;
  }
});

test('iOS private-gateway config allows local networking without widening other ATS settings', () => {
  const infoPlist = {
    NSAppTransportSecurity: { NSAllowsArbitraryLoads: false },
  };
  configureLocalGatewayInfoPlist(infoPlist, true);
  assert.deepEqual(infoPlist.NSAppTransportSecurity, {
    NSAllowsArbitraryLoads: false,
    NSAllowsLocalNetworking: true,
  });
  assert.match(infoPlist.NSLocalNetworkUsageDescription, /cùng mạng Wi‑Fi/);

  const noGateway = {};
  configureLocalGatewayInfoPlist(noGateway, false);
  assert.deepEqual(noGateway, {}, 'without a local HTTP gateway, no network exception is added');
});
