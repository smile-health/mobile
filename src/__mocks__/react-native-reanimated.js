// Minimal Jest stand-in for Reanimated 4. The library's own mock still loads
// the native CSS/worklets runtime, which is unavailable under Jest. This
// covers only the APIs the app uses; animations resolve to plain RN views.
const React = require('react')
const { View, Text, Image, ScrollView, FlatList } = require('react-native')

const LAYOUT_PROPS = new Set(['entering', 'exiting', 'layout'])

const animatedComponent = (Component) => {
  const Wrapped = React.forwardRef((props, ref) => {
    const rest = Object.fromEntries(
      Object.entries(props).filter(([key]) => !LAYOUT_PROPS.has(key))
    )
    return React.createElement(Component, { ...rest, ref })
  })
  Wrapped.displayName = `Animated(${Component.displayName || Component.name || 'Component'})`
  return Wrapped
}

// Layout animation builders are chainable: FadeIn.duration(200).delay(50)…
const builder = () => {
  const b = new Proxy({}, { get: () => () => b })
  return b
}

const Animated = {
  View: animatedComponent(View),
  Text: animatedComponent(Text),
  Image: animatedComponent(Image),
  ScrollView: animatedComponent(ScrollView),
  FlatList: animatedComponent(FlatList),
  createAnimatedComponent: animatedComponent,
}

module.exports = {
  __esModule: true,
  default: Animated,
  ...Animated,
  FadeIn: builder(),
  FadeOut: builder(),
  FadeInUp: builder(),
  FadeOutUp: builder(),
  FadeOutDown: builder(),
  SlideInDown: builder(),
  SlideOutDown: builder(),
  LinearTransition: builder(),
  useSharedValue: (init) => ({ value: init }),
  useAnimatedStyle: (fn) => fn(),
  withTiming: (to) => to,
  withSpring: (to) => to,
  withRepeat: (anim) => anim,
}
