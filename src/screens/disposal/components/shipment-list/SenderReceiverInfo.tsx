import React from 'react'
import { View, Text } from 'react-native'
import { TFunction } from 'i18next'
import { Icons } from '@/assets/icons'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'

interface Props {
  senderName: string
  senderAddress: string | null
  receiverName: string
  receiverAddress: string | null
  t: TFunction
}

function SenderReceiverInfo(props: Readonly<Props>) {
  const { t, senderName, senderAddress, receiverName, receiverAddress } = props
  return (
    <View className='flex-row items-start gap-x-2'>
      <View className='flex-1 gap-y-1'>
        <Text className={AppStyles.labelBold}>{t('disposal.sender')}</Text>
        <Text className={AppStyles.textBoldSmall}>{senderName}</Text>
        <Text className={AppStyles.labelRegular}>{senderAddress ?? '-'}</Text>
      </View>

      <Icons.IcArrowRight />

      <View className='flex-1 gap-y-1'>
        <Text className={cn(AppStyles.labelBold, 'text-right')}>
          {t('disposal.receiver')}
        </Text>
        <Text className={cn(AppStyles.textBoldSmall, 'text-right')}>
          {receiverName}
        </Text>
        <Text className={cn(AppStyles.labelRegular, 'text-right')}>
          {receiverAddress ?? '-'}
        </Text>
      </View>
    </View>
  )
}

export default React.memo(SenderReceiverInfo)
