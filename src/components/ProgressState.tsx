import React from 'react'
import { View, Text, Animated, Modal } from 'react-native'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import { getTestID } from '@/utils/CommonUtils'

interface ProgressStateProps {
  containerClassName?: string
  textClassName?: string
  text: string
  progressBarClassName?: string
  progress: number
  modalVisible: boolean
  testID?: string
}

const ProgressState = ({
  progress,
  testID,
  containerClassName,
  textClassName,
  text,
  progressBarClassName,
  modalVisible,
}: ProgressStateProps) => {
  return (
    <Modal animationType='none' transparent={true} visible={modalVisible}>
      <View className={AppStyles.modalOverlay}>
        <View className='flex-col justify-center items-center bg-white rounded-lg p-9'>
          <View
            className={cn(
              containerClassName,
              'w-[200px] h-5 bg-lightGrey rounded-lg overflow-hidden relative'
            )}
            {...getTestID(testID)}>
            <Animated.View
              className={cn(
                progressBarClassName,
                'h-full bg-bluePrimary rounded-lg items-center justify-center'
              )}
              style={{ width: `${progress}%` }}>
              <Text
                className={cn(
                  textClassName,
                  'text-white text-xs font-mainBold'
                )}>
                {progress}%
              </Text>
            </Animated.View>
          </View>
          <Text className='font-mainRegular text-xs mt-4'>{text}</Text>
        </View>
      </View>
    </Modal>
  )
}

export default ProgressState
