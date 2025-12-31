import React from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { canShowNetworkLogger } from '@/utils/CommonUtils'
import FloatingDebugButton from '../buttons/FloatingDebugButton'

export function DebugWrapper({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <GestureHandlerRootView className='flex-1'>
      {children}
      {canShowNetworkLogger && <FloatingDebugButton />}
    </GestureHandlerRootView>
  )
}
