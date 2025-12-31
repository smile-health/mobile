// Learn more https://docs.expo.io/guides/customizing-metro

const { getSentryExpoConfig } = require('@sentry/react-native/metro')
const { withNativeWind } = require('nativewind/metro')

module.exports = () => {
  const config = getSentryExpoConfig(__dirname)
  const { transformer, resolver } = config

  config.transformer = {
    ...transformer,
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
    _expoRelativeProjectRoot: __dirname,
  }
  config.resolver = {
    ...resolver,
    assetExts: resolver.assetExts.filter((ext) => ext !== 'svg'),
    sourceExts: [...resolver.sourceExts, 'svg'],
  }

  return withNativeWind(config, { input: './global.css', inlineRem: 16 })
}
