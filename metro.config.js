const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Disable TypeScript checking during bundling
config.transformer.unstable_allowRequireContext = true;
config.resolver.sourceExts.push('tsx', 'ts', 'jsx', 'js');

module.exports = config;