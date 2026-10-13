const { AndroidConfig, withAndroidManifest } = require('@expo/config-plugins');
const process = require('node:process');
const { URL } = require('node:url');

function privateIpv4Host(host) {
  if (host === 'localhost') return true;
  const parts = host.split('.').map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) return false;
  return parts[0] === 10 || parts[0] === 127 || parts[0] === 169 && parts[1] === 254 ||
    parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31 || parts[0] === 192 && parts[1] === 168;
}

function gatewayHost(config) {
  const endpoint = process.env.EXPO_PUBLIC_NGOKE_VOICE_API_BASE_URL || config.extra?.voiceApiBaseUrl;
  if (!endpoint) return undefined;
  const url = new URL(endpoint);
  if (url.protocol !== 'http:') return undefined;
  if (!privateIpv4Host(url.hostname)) throw new Error('Voice gateway HTTP must use a private IPv4/localhost; use HTTPS for other hosts.');
  return url.hostname;
}

module.exports = function withVoiceGatewayNetworkSecurity(config) {
  const allowLocalGateway = Boolean(gatewayHost(config));
  return withAndroidManifest(config, (mod) => {
    const application = AndroidConfig.Manifest.getMainApplicationOrThrow(mod.modResults);
    delete application.$['android:networkSecurityConfig'];
    if (allowLocalGateway) {
      // shortcut: Android's policy is app-wide; require HTTPS before a public build.
      application.$['android:usesCleartextTraffic'] = 'true';
    } else {
      delete application.$['android:usesCleartextTraffic'];
    }
    return mod;
  });
};

module.exports.privateIpv4Host = privateIpv4Host;
module.exports.gatewayHost = gatewayHost;
