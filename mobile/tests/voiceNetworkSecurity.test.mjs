import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';

const require = createRequire(import.meta.url);
const { privateIpv4Host, gatewayHost, configureLocalGatewayInfoPlist } = require('../plugins/withVoiceGatewayNetworkSecurity.cjs');

test('cleartext gateway builds only accept private IPv4 or localhost', () => {
  for (const host of ['192.168.1.42', '10.0.2.2', '172.31.1.2', '127.0.0.1', 'localhost']) {
    assert.equal(privateIpv4Host(host), true, host);
  }
  for (const host of ['8.8.8.8', '172.32.1.2', '192.169.1.2', 'not-an-ip']) {
    assert.equal(privateIpv4Host(host), false, host);
  }
  assert.throws(() => gatewayHost({ extra: { voiceApiBaseUrl: 'http://voice.example.com' } }), /must use a private IPv4/);
  assert.equal(gatewayHost({ extra: { voiceApiBaseUrl: 'https://voice.example.com' } }), undefined);
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
