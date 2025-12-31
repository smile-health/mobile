import React from 'react'
import { Text, View } from 'react-native'
import { Icons } from '@/assets/icons'
import { useLanguage } from '@/i18n/useLanguage'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'

interface Props {
  expiredBatch?: number
  nearExpiredBatch?: number
  className?: string
}

function MaterialAlert({
  expiredBatch,
  nearExpiredBatch,
  className,
}: Readonly<Props>) {
  const { t } = useLanguage()
  if (!expiredBatch && !nearExpiredBatch) return null

  return (
    <View className={cn('gap-y-2 w-full', className)}>
      {!!expiredBatch && (
        <View className='flex-row items-center p-1 gap-x-1 rounded-sm bg-softPink'>
          <Icons.IcAlertED height={16} width={16} />
          <Text className={cn(AppStyles.labelRegular, 'text-lavaRed')}>
            {t('home.alert.num_expired', { total: expiredBatch })}
          </Text>
        </View>
      )}
      {!!nearExpiredBatch && (
        <View className='flex-row items-center p-1 gap-x-1 rounded-sm bg-softIvory'>
          <Icons.IcAlertNearED height={16} width={16} />
          <Text className={cn(AppStyles.labelRegular, 'text-vividOrange')}>
            {t('home.alert.num_near_ed', { total: nearExpiredBatch })}
          </Text>
        </View>
      )}
    </View>
  )
}

export default React.memo(MaterialAlert)
