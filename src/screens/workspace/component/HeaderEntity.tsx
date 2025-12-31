import React from 'react'
import { Text, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { Icons } from '@/assets/icons'
import { Button } from '@/components/buttons'
import { useLanguage } from '@/i18n/useLanguage'
import { setProgramColor } from '@/services/features'
import { authState, useAppDispatch, useAppSelector } from '@/services/store'
import AppStyles from '@/theme/AppStyles'
import colors from '@/theme/colors'
import { cn } from '@/theme/theme-config'

export default function HeaderEntity() {
  const navigation = useNavigation()
  const dispatch = useAppDispatch()
  const { user } = useAppSelector(authState)

  const { t } = useLanguage()

  const handlePressDetail = () => {
    dispatch(setProgramColor(colors.app()))
    navigation.navigate('UserEntityList')
  }

  return (
    <View className='bg-app p-4 border-t border-t-white/20'>
      <View className='flex-row items-start'>
        <View className='flex-1 gap-1'>
          <Text className={cn(AppStyles.textBoldLarge, 'text-mainText')}>
            {user?.entity.name}
          </Text>
          <Text className={cn(AppStyles.textRegular, 'text-mainText')}>
            {user?.entity?.location}
          </Text>
        </View>
        <Button
          text={t('label.detail')}
          onPress={handlePressDetail}
          RightIcon={Icons.IcChevronRightActive}
          rightIconColor={colors.mainText()}
          rightIconSize={24}
          containerClassName='flex-row items-center rounded pl-3 pr-1 py-1 bg-white/20'
          textClassName='text-mainText'
        />
      </View>
    </View>
  )
}
