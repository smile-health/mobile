import React from 'react'
import { StyleSheet, Dimensions } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import { Icons } from '@/assets/icons'
import { navigate } from '@/utils/NavigationUtils'
import { ImageButton } from './ImageButton'

const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get('window')
const BUTTON_SIZE = 36

export default function FloatingDebugButton() {
  const translateX = useSharedValue(WINDOW_WIDTH - BUTTON_SIZE - 10)
  const translateY = useSharedValue(WINDOW_HEIGHT / 2)
  const context = useSharedValue({ x: 0, y: 0 })

  const gesture = Gesture.Pan()
    .onStart(() => {
      context.value = {
        x: translateX.value,
        y: translateY.value,
      }
    })
    .onUpdate((event) => {
      translateX.value = event.translationX + context.value.x
      translateY.value = event.translationY + context.value.y
    })
    .onEnd(() => {
      translateX.value = withSpring(
        Math.min(Math.max(0, translateX.value), WINDOW_WIDTH - BUTTON_SIZE)
      )
      translateY.value = withSpring(
        Math.min(Math.max(0, translateY.value), WINDOW_HEIGHT - BUTTON_SIZE)
      )
    })

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
      ],
    }
  })

  const handlePress = () => {
    navigate('Network')
  }

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.buttonContainer, animatedStyle]}>
        <ImageButton
          Icon={Icons.IcNetwork}
          size={18}
          color='white'
          onPress={handlePress}
          containerClassName='flex-1 bg-marine rounded-full shadow-lg'
        />
      </Animated.View>
    </GestureDetector>
  )
}

const styles = StyleSheet.create({
  buttonContainer: {
    height: BUTTON_SIZE,
    position: 'absolute',
    width: BUTTON_SIZE,
    zIndex: 1000,
  },
})
