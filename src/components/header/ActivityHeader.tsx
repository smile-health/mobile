import React from 'react'
import { View, Text } from 'react-native'
import { useLanguage } from '@/i18n/useLanguage'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'

export function ActivityHeader({ name }: { readonly name?: string }) {
  const { t } = useLanguage()
  return (
    <View
      className={cn(
        AppStyles.borderBottom,
        'bg-paleBlue px-4 py-2 flex-row items-center justify-between'
      )}>
      <Text className={AppStyles.textRegularSmall}>{t('label.activity')}</Text>
      <Text className={AppStyles.textBoldSmall}>{name ?? ''}</Text>
    </View>
  )
}
