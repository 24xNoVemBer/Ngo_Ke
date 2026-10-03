const { getDefaultConfig } = require('expo/metro-config');
const path = require('node:path');

const config = getDefaultConfig(__dirname);
// The single fixture lives beside mobile/, outside Metro's project root.
config.watchFolders.push(path.resolve(__dirname, '../data'));

module.exports = config;
