const { AndroidConfig, withAndroidManifest, withInfoPlist } = require('@expo/config-plugins');
const process = require('node:process');
const { URL } = require('node:url');

const LOCAL_NETWORK_DESCRIPTION = 'Ngõ Kể kết nối với máy chủ nhận dạng giọng nói hoặc API trên cùng mạng Wi‑Fi để xử lý.';

function privateIpv4Host(host) {
  if (host === 'localhost') return true;
  const parts = host.split('.').map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) return false;
  return parts[0] === 10 || parts[0] === 127 || parts[0] === 169 && parts[1] === 254 ||
    parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31 || parts[0] === 192 && parts[1] === 168;
}

function resolveHttpEndpointHost(endpoint, label) {
  if (!endpoint || typeof endpoint !== 'string' || !endpoint.trim()) return undefined;
  const url = new URL(endpoint.trim());
  if (url.protocol !== 'http:') return undefined;
  if (!privateIpv4Host(url.hostname)) {
    throw new Error(`${label} HTTP must use a private IPv4/localhost; use HTTPS for other hosts.`);
  }
  return url.hostname;
}

function gatewayHost(config) {
  const endpoint = process.env.EXPO_PUBLIC_NGOKE_VOICE_API_BASE_URL || config?.extra?.voiceApiBaseUrl;
  return resolveHttpEndpointHost(endpoint, 'Voice gateway');
}

function apiHost(config) {
  const endpoint = process.env.EXPO_PUBLIC_NGOKE_API_BASE_URL || config?.extra?.apiBaseUrl;
  return resolveHttpEndpointHost(endpoint, 'API endpoint');
}

function resolveCleartextHosts(config) {
  const voice = gatewayHost(config);
  const api = apiHost(config);
  const hosts = [];
  if (voice) hosts.push(voice);
  if (api && !hosts.includes(api)) hosts.push(api);
  return hosts;
}

function configureLocalGatewayInfoPlist(infoPlist, allowLocalGateway) {
  if (!allowLocalGateway) return infoPlist;
  infoPlist.NSAppTransportSecurity = {
    ...infoPlist.NSAppTransportSecurity,
    NSAllowsLocalNetworking: true,
  };
  infoPlist.NSLocalNetworkUsageDescription ??= LOCAL_NETWORK_DESCRIPTION;
  return infoPlist;
}

module.exports = function withVoiceGatewayNetworkSecurity(config) {
  const allowLocalGateway = resolveCleartextHosts(config).length > 0;
  const withAndroid = withAndroidManifest(config, (mod) => {
    const application = AndroidConfig.Manifest.getMainApplicationOrThrow(mod.modResults);
    delete application.$['android:networkSecurityConfig'];
    if (allowLocalGateway) {
      // shortcut: local HTTP exceptions are app-wide; require HTTPS before public release.
      application.$['android:usesCleartextTraffic'] = 'true';
    } else {
      delete application.$['android:usesCleartextTraffic'];
    }
    return mod;
  });
  return withInfoPlist(withAndroid, (mod) => {
    configureLocalGatewayInfoPlist(mod.modResults, allowLocalGateway);
    return mod;
  });
};

module.exports.privateIpv4Host = privateIpv4Host;
module.exports.gatewayHost = gatewayHost;
module.exports.apiHost = apiHost;
module.exports.resolveCleartextHosts = resolveCleartextHosts;
module.exports.configureLocalGatewayInfoPlist = configureLocalGatewayInfoPlist;
