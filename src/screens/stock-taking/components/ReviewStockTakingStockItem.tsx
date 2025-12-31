import React from 'react'
import { View, Text } from 'react-native'
import ActivityLabel from '@/components/ActivityLabel'
import { InfoRow } from '@/components/list/InfoRow'
import { useLanguage } from '@/i18n/useLanguage'
import AppStyles, { flexStyle } from '@/theme/AppStyles'
import { numberFormat } from '@/utils/CommonUtils'
import { SHORT_DATE_FORMAT } from '@/utils/Constants'
import { convertString } from '@/utils/DateFormatUtils'
import { StockTakingFormItem } from '../schema/CreateStockTakingSchema'

interface Props {
  item: StockTakingFormItem
}

function ReviewStockTakingStockItem({ item }: Readonly<Props>) {
  const {
    batch_code = '',
    activity_name,
    actual_qty,
    in_transit_qty,
    recorded_qty,
    expired_date,
  } = item

  const { t } = useLanguage()
  return (
    <View className='bg-catskillWhite px-3 py-2 rounded-sm gap-y-1 border border-lightGreyMinimal mb-2'>
      <View className='flex-row items-center gap-x-2'>
        <Text className={AppStyles.textRegular} style={flexStyle}>
          {batch_code}
        </Text>
        <ActivityLabel name={activity_name} />
      </View>
      <InfoRow
        label={t('label.real_stock_remaining')}
        value={numberFormat(actual_qty ?? 0)}
      />
      <View className='border-b border-quillGrey' />
      {expired_date && (
        <InfoRow
          label={t('label.expired_date')}
          value={convertString(expired_date, SHORT_DATE_FORMAT)}
          valueClassName='uppercase'
        />
      )}
      <InfoRow
        label={t('label.stock_in_transit')}
        value={numberFormat(in_transit_qty ?? 0)}
      />
      <InfoRow
        label={t('label.remaining_stock_smile')}
        value={numberFormat(recorded_qty ?? 0)}
      />
    </View>
  )
}

export default React.memo(ReviewStockTakingStockItem)
