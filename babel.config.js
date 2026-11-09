module.exports = function (api) {
  api.cache(true)
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
      '@babel/preset-typescript',
    ],
    // babel-preset-expo (SDK 54+) adds the react-native-worklets plugin that
    // Reanimated 4 needs, so it is no longer listed here.
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@': './src',
          },
        },
      ],
    ],
  }
}
