import React, { memo } from 'react'
import { View } from 'react-native'
import Animated, {
  LinearTransition,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated'

interface CollapsableContainerProps {
  children: React.ReactNode
  expanded: boolean
  maxExpadedHeight?: number
  className?: string
}

const MAX_EXPANDED_HEIGHT = 1000 //Maximum height for expanded state in CollapsableContainer

const CollapsableContainer = ({
  children,
  expanded,
  className,
  maxExpadedHeight = MAX_EXPANDED_HEIGHT,
}: CollapsableContainerProps) => {
  const collapsableStyle = useAnimatedStyle(() => ({
    maxHeight: expanded ? withTiming(maxExpadedHeight) : withTiming(0),
  }))

  const _damping = 20

  return (
    <Animated.View
      style={collapsableStyle}
      className='overflow-hidden'
      layout={LinearTransition.springify().damping(_damping)}>
      <View className={className}>{children}</View>
    </Animated.View>
  )
}

export default memo(CollapsableContainer)
