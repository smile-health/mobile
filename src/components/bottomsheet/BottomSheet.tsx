import React from 'react'
import {
  LayoutChangeEvent,
  Pressable,
  StyleProp,
  ViewStyle,
} from 'react-native'
import Animated, {
  useSharedValue,
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { cn } from '@/theme/theme-config'
import { useBackHandler } from '@/utils/hooks/useBackHandler'
import Portal from '../portals/Portal'

export interface BottomSheetProps {
  isOpen: boolean
  name: string
  toggleSheet: () => void
  children?: React.ReactNode
  backdropClassName?: string
  containerClassName?: string
  containerStyle?: StyleProp<ViewStyle>
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

export function BottomSheet({
  isOpen,
  name,
  toggleSheet,
  children,
  backdropClassName,
  containerClassName,
  containerStyle,
}: Readonly<BottomSheetProps>) {
  const height = useSharedValue(0)
  const insets = useSafeAreaInsets()

  const className = {
    backdrop: cn(
      'absolute top-0 right-0 bottom-0 left-0 bg-blackTransparent',
      backdropClassName
    ),
    container: cn(
      'bg-white w-full absolute bottom-0 rounded-t z-10',
      containerClassName
    ),
  }

  const handleOnLayout = (e: LayoutChangeEvent) => {
    height.value = e.nativeEvent.layout.height
  }

  useBackHandler(
    () => (isOpen ? (toggleSheet(), true) : false),
    [isOpen, toggleSheet]
  )

  return isOpen ? (
    <Portal name={name}>
      <AnimatedPressable
        className={className.backdrop}
        entering={FadeIn}
        exiting={FadeOut}
        onPress={toggleSheet}
      />
      <Animated.View
        onLayout={handleOnLayout}
        className={className.container}
        style={[{ paddingBottom: insets.bottom }, containerStyle]}
        entering={SlideInDown}
        exiting={SlideOutDown}>
        {children}
      </Animated.View>
    </Portal>
  ) : null
}
