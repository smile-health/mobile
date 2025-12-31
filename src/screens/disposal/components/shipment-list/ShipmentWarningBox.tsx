import React from 'react'
import { View, Text } from 'react-native'
import { Icons } from '@/assets/icons'
import { useLanguage } from '@/i18n/useLanguage'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'

export default function ShipmentWarningBox() {
  const { t } = useLanguage()

  return (
    <View className='bg-white p-4'>
      <View className='border border-vividOrange bg-softIvory rounded-sm p-2'>
        <View className={cn(AppStyles.rowCenterAlign, 'gap-x-1')}>
          <Icons.IcWarning />
          <Text className={cn(AppStyles.textBoldSmall, 'text-vividOrange')}>
            {t('disposal.warning.title')}
          </Text>
        </View>
        <Text className={AppStyles.textRegularSmall}>
          {t('disposal.warning.message')}
        </Text>
      </View>
    </View>
  )
}
