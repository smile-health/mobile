import React, { useCallback } from 'react'
import { TouchableOpacity, Text, View } from 'react-native'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { Icons } from '@/assets/icons'
import { useGetNotificationCountQuery } from '@/services/apis/notification.api'
import { authState, useAppSelector } from '@/services/store'
import colors from '@/theme/colors'
import { getInitials, getTestID } from '@/utils/CommonUtils'

const getNotificationCount = (total: number) => {
  return total > 99 ? '+99' : String(total)
}

interface Props {
  iconColor?: string
}

export function ProfileToolbarActions({ iconColor }: Readonly<Props>) {
  const { user } = useAppSelector(authState)
  const navigation = useNavigation()
  const { data, refetch } = useGetNotificationCountQuery({})

  const onPressProfile = () => {
    navigation.navigate('Profile')
  }

  const handlePressNotification = () => {
    navigation.navigate('Notification')
  }

  useFocusEffect(
    useCallback(() => {
      refetch()
    }, [refetch])
  )

  return (
    <View className='flex-row items-center'>
      <TouchableOpacity
        onPress={handlePressNotification}
        className='mr-4'
        {...getTestID('btn-notification')}>
        <Icons.IcBell color={iconColor ?? colors.mainText()} />
      </TouchableOpacity>
      {!!data?.unread && (
        <View className='bg-red-500 absolute w-[18px] h-4 ml-2.5 bottom-4 rounded-2xl justify-center items-center'>
          <Text className='text-[8px] text-white font-mainRegular'>
            {getNotificationCount(data.unread)}
          </Text>
        </View>
      )}
      <TouchableOpacity
        onPress={onPressProfile}
        className='w-8 h-8 bg-white rounded-full items-center justify-center'
        {...getTestID('btn-profile')}>
        <Text className='text-deepBlue font-mainMedium'>
          {getInitials(`${user?.firstname} ${user?.lastname}`)}
        </Text>
      </TouchableOpacity>
    </View>
  )
}
