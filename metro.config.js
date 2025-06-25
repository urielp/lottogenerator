const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Add polyfills
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  stream: require.resolve("readable-stream"),
  "readable-stream": require.resolve("readable-stream"),
};

module.exports = config;
