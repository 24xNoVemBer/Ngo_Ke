const { getDefaultConfig } = require('expo/metro-config');
const path = require('node:path');
const fs = require('node:fs');
const process = require('node:process');

// Under Windows junctions / symlinks, __dirname can evaluate to the target path
// while tooling / doctor expects the invocation working directory.
const isSameDir = () => {
  try {
    return fs.realpathSync(process.cwd()) === fs.realpathSync(__dirname);
  } catch {
    return false;
  }
};
const projectRoot = isSameDir() ? process.cwd() : __dirname;

const config = getDefaultConfig(projectRoot);
// The single fixture lives beside mobile/, outside Metro's project root.
config.watchFolders.push(path.resolve(__dirname, '../data'));

module.exports = config;
