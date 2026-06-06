const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const config = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true, // lazy module evaluation, reduces startup time
      },
    }),
  },
  resolver: {
    resolverMainFields: ['react-native', 'browser', 'main'],
    assetExts: [
      'bmp', 'gif', 'jpg', 'jpeg', 'png', 'psd', 'svg', 'webp',
      'ttf', 'otf', 'woff', 'woff2',
      'mp4', 'm4v', 'mov', 'mp3', 'aac', 'wav',
      'json', 'pb',
      'so',
    ],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
