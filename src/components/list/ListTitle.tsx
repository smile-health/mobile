import React from 'react'
import { View, Text } from 'react-native'
import { Icons } from '@/assets/icons'
import { useLanguage } from '@/i18n/useLanguage'
import AppStyles from '@/theme/AppStyles'
import colors from '@/theme/colors'
import { cn } from '@/theme/theme-config'
import { ImageButton } from '../buttons'

interface ListTitleProps {
  title: string
  itemCount: number
  withInfoIcon?: boolean
  className?: string
  onPressInfo?: () => void
}

function ListTitle({
  title,
  itemCount,
  withInfoIcon,
  className,
  onPressInfo,
}: Readonly<ListTitleProps>) {
  const { t } = useLanguage()
  return (
    <View className={cn(AppStyles.rowBetween, 'p-4', className)}>
      <View className='flex-row items-center gap-x-1'>
        <Text className={AppStyles.textBold}>{title}</Text>
        {withInfoIcon && (
          <ImageButton
            onPress={onPressInfo}
            Icon={Icons.IcInfo}
            size={16}
            color={colors.deepBlue}
          />
        )}
      </View>
      <Text className={AppStyles.labelRegular}>
        {t('label.total')}{' '}
        <Text className={'font-mainBold'}>
          {t('label.count_items', { count: itemCount })}
        </Text>
      </Text>
    </View>
  )
}

export default React.memo(ListTitle)
