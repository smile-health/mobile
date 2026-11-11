// SVG imports are React components at runtime (react-native-svg-transformer).
// Under Jest they would otherwise resolve to a bare filename string, which the
// RNTL 14 renderer rejects inside a <View>.
const React = require('react')
const { View } = require('react-native')

const SvgMock = (props) =>
  React.createElement(View, { ...props, testID: props.testID })
module.exports = SvgMock
module.exports.default = SvgMock
module.exports.ReactComponent = SvgMock
