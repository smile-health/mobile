import React from 'react'
import { Text, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'

interface Props {
  totalDisposalShippedQty: number
  totalSelfDisposalQty: number
}

export default function DisposalHistorySection({
  totalDisposalShippedQty = 0,
  totalSelfDisposalQty = 0,
}: Readonly<Props>) {
  const { t } = useTranslation()

  return (
    <View className='bg-white py-3 px-4 mb-4'>
      <Text className={cn(AppStyles.textBold, 'text-warmGrey')}>
        {t('disposal.disposal_history')}
      </Text>
      <View className='flex-row justify-between mt-2'>
        <View className='w-1/2 pr-1'>
          <View className='border border-lightGreyMinimal p-3 rounded'>
            <Text className={cn(AppStyles.labelRegular)}>
              {t('disposal.total_disposal_shipment')}
            </Text>
            <Text className={cn(AppStyles.textBold)}>
              {totalDisposalShippedQty}
            </Text>
          </View>
        </View>
        <View className='w-1/2 pl-1'>
          <View className='border border-lightGreyMinimal p-3 rounded'>
            <Text className={cn(AppStyles.labelRegular)}>
              {t('disposal.total_self_disposal')}
            </Text>
            <Text className={cn(AppStyles.textBold)}>
              {totalSelfDisposalQty}
            </Text>
          </View>
        </View>
      </View>
    </View>
  )
}
