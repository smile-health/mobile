import React from 'react'
import { View, Text } from 'react-native'
import ActivityLabel from '@/components/ActivityLabel'
import { InfoRow } from '@/components/list/InfoRow'
import { useLanguage } from '@/i18n/useLanguage'
import { StockTakingBatch } from '@/models/stock-taking/StockTakingList'
import AppStyles, { flexStyle } from '@/theme/AppStyles'
import { numberFormat } from '@/utils/CommonUtils'
import { SHORT_DATE_FORMAT } from '@/utils/Constants'
import { convertString } from '@/utils/DateFormatUtils'

interface Props {
  batch?: StockTakingBatch
  activityName: string
  createdAt: string
  remainingQty: number
  inTransitQty: number
  actualQty: number
}

const CREATED_AT_DATE_FORMAT = 'DD MMM YYYY at HH:mm'

function StockTakingItem({
  batch,
  activityName,
  createdAt,
  remainingQty,
  inTransitQty,
  actualQty,
}: Readonly<Props>) {
  const { t } = useLanguage()
  return (
    <View className='px-4 py-3 mx-4 bg-white border border-quillGrey mb-2 rounded-sm gap-y-2'>
      <View className='gap-y-1'>
        <View className='flex-row items-center gap-x-2'>
          <Text className={AppStyles.textRegular} style={flexStyle}>
            {batch?.code ?? ''}
          </Text>
          <ActivityLabel name={activityName} />
        </View>
        <InfoRow
          label={t('label.stock_taking_date')}
          value={convertString(createdAt, CREATED_AT_DATE_FORMAT)}
          valueClassName='uppercase'
        />
        {batch?.expired_date && (
          <InfoRow
            label={t('label.expired_date')}
            value={convertString(batch.expired_date, SHORT_DATE_FORMAT)}
            valueClassName='uppercase'
          />
        )}
      </View>
      <View className='bg-catskillWhite border border-lightGreyMinimal px-3 py-2 rounded'>
        <InfoRow
          label={t('label.stock_in_transit')}
          value={numberFormat(inTransitQty ?? 0)}
        />
        <InfoRow
          label={t('label.remaining_stock_smile')}
          value={numberFormat(remainingQty ?? 0)}
        />
        <InfoRow
          label={t('label.real_stock_remaining')}
          value={numberFormat(actualQty ?? 0)}
        />
      </View>
    </View>
  )
}

export default React.memo(StockTakingItem)
