import React from 'react'
import { View, Text } from 'react-native'
import { Icons } from '@/assets/icons'
import {
  BottomSheet,
  BottomSheetProps,
} from '@/components/bottomsheet/BottomSheet'
import { ImageButton } from '@/components/buttons'
import { InfoRow } from '@/components/list/InfoRow'
import { useLanguage } from '@/i18n/useLanguage'
import { Stock } from '@/models/shared/Material'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import { getTestID, numberFormat } from '@/utils/CommonUtils'
import BaseStockBatchItem from './BaseStockBatchItem'

interface Props extends BottomSheetProps {
  stock: Stock
}

function ReconciliationDetailBottomSheet({
  stock,
  toggleSheet,
  ...props
}: Readonly<Props>) {
  const { t } = useLanguage()
  const { budget_source, year, price, total_price } = stock

  return (
    <BottomSheet
      toggleSheet={toggleSheet}
      containerClassName='max-h-full'
      {...props}>
      <View className='p-4 gap-y-2'>
        <View className='flex-row justify-between items-center'>
          <Text className={AppStyles.textBold}>
            {t('section.batch_detail')}
          </Text>
          <ImageButton
            onPress={toggleSheet}
            Icon={Icons.IcDelete}
            size={20}
            {...getTestID('btn-close-detail')}
          />
        </View>
      </View>
      <BaseStockBatchItem item={stock} testID={`batch-${stock.batch?.code}`}>
        <View className='border border-quillGrey p-2 rounded-sm gap-y-1 mt-2'>
          <Text className={cn(AppStyles.textBold, 'flex-1')}>
            {t('label.budget_info')}
          </Text>
          <InfoRow
            label={t('label.budget_source')}
            value={budget_source?.name ?? '-'}
            valueClassName='font-mainBold'
          />
          <InfoRow
            label={t('label.budget_year')}
            value={year ?? '-'}
            valueClassName='font-mainBold'
          />
          <InfoRow
            label={t('label.price')}
            value={numberFormat(Math.abs(price ?? 0))}
            valueClassName='font-mainBold'
          />
          <InfoRow
            label={t('label.total_price')}
            value={numberFormat(Math.abs(total_price ?? 0))}
            valueClassName='font-mainBold'
          />
        </View>
      </BaseStockBatchItem>
    </BottomSheet>
  )
}

export default React.memo(ReconciliationDetailBottomSheet)
