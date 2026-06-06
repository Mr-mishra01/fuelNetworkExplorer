module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module:react-native-dotenv',
      {
        moduleName: '@env',
        path: '.env',
        safe: true,       // throw if a required var is missing from .env
        allowUndefined: false,
      },
    ],
    'react-native-reanimated/plugin', // must be last
  ],
  env: {
    production: {
      plugins: [
        'transform-remove-console',
      ],
    },
  },
};
