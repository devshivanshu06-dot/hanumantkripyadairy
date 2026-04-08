module.exports = function (api) {
  api.cache(true);

  const plugins = [
    ['module:react-native-dotenv', {
      moduleName: '@env',
      path: '.env',
    }],
    'nativewind/babel',
    'react-native-reanimated/plugin',
  ];

  if (process.env.NODE_ENV === 'production' || process.env.BABEL_ENV === 'production') {
    plugins.push('transform-remove-console');
  }

  return {
    presets: ['module:@react-native/babel-preset'],
    plugins,
  };
};
