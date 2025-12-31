import React, { useEffect } from 'react'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'
import { Svg, Circle } from 'react-native-svg'
import colors from '@/theme/colors'
import { cn } from '@/theme/theme-config'

interface CircularLoadingIndicatorProps {
  size?: number
  bgColor?: string
  loadingColor?: string
}

const CircularLoadingIndicator: React.FC<CircularLoadingIndicatorProps> = ({
  size = 48,
  bgColor = colors.lavenderGray,
  loadingColor = colors.main(),
}) => {
  const rotation = useSharedValue(0)

  useEffect(() => {
    rotation.value = withRepeat(withTiming(360, { duration: 1000 }), -1, false)
  }, [rotation])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }))

  return (
    <Animated.View
      className={cn('flex items-center justify-center', animatedStyle)}
      style={animatedStyle}>
      <Svg height={size} width={size} viewBox='0 0 50 50'>
        <Circle
          cx='25'
          cy='25'
          r='20'
          stroke={bgColor}
          strokeWidth='4'
          fill='none'
        />

        <Circle
          cx='25'
          cy='25'
          r='20'
          stroke={loadingColor}
          strokeWidth='4'
          fill='none'
          strokeLinecap='round'
          strokeDasharray='125'
          strokeDashoffset='85'
        />
      </Svg>
    </Animated.View>
  )
}

export default CircularLoadingIndicator
