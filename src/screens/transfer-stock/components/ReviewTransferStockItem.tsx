import React from 'react'
import { View, Text } from 'react-native'
import ActivityLabel from '@/components/ActivityLabel'
import { Button } from '@/components/buttons'
import { InfoRow } from '@/components/list/InfoRow'
import { useLanguage } from '@/i18n/useLanguage'
import { IReviewTransferStockItem } from '@/models/transaction/TransferStock'
import AppStyles, { flexStyle } from '@/theme/AppStyles'
import { getTestID, numberFormat } from '@/utils/CommonUtils'
import { SHORT_DATE_FORMAT } from '@/utils/Constants'
import { convertString } from '@/utils/DateFormatUtils'

interface Props {
  index: number
  item: IReviewTransferStockItem
  onDelete?: () => void
}

const StockInfo = ({
  batch,
  activityName,
  budgetSourceName,
  price,
  totalPrice,
}) => {
  const { t } = useLanguage()
  return (
    <View className='px-3 py-2 rounded bg-catskillWhite gap-y-1 border border-lightGreyMinimal'>
      <View className='flex-row items-center'>
        <Text className={AppStyles.textRegular} style={flexStyle}>
          {batch?.code ?? ''}
        </Text>
        <ActivityLabel name={activityName} />
      </View>
      {!!batch?.id && (
        <React.Fragment>
          <InfoRow
            label={t('label.expired_date')}
            value={convertString(batch?.expired_date, SHORT_DATE_FORMAT)}
            valueClassName='uppercase'
          />
          <InfoRow
            label={t('label.manufacturer')}
            value={batch?.manufacture?.name}
          />
          <InfoRow
            label={t('label.production_date')}
            value={convertString(batch?.production_date, SHORT_DATE_FORMAT)}
            valueClassName='uppercase'
          />
        </React.Fragment>
      )}
      <InfoRow label={t('label.budget_source')} value={budgetSourceName} />
      <InfoRow
        label={t('label.price')}
        value={price ? numberFormat(price) : '-'}
        valueClassName='font-mainMedium'
      />
      <InfoRow
        label={t('label.total_price')}
        value={totalPrice ? numberFormat(totalPrice) : '-'}
        valueClassName='font-mainMedium'
      />
    </View>
  )
}

function ReviewTransferStockItem({ index, item, onDelete }: Readonly<Props>) {
  const {
    stock_id,
    change_qty,
    destination_activity,
    program_name,
    batch,
    activity,
    budget_source,
    price,
    total_price,
  } = item

  const { t } = useLanguage()

  return (
    <View
      className='gap-y-2 py-2'
      {...getTestID(`ReviewTransferStockItem-${stock_id}`)}>
      <InfoRow
        label={t('label.qty')}
        value={numberFormat(change_qty)}
        valueClassName='font-mainBold'
      />
      <View className='border-b border-lightGreyMinimal' />
      <InfoRow
        label={t('transfer_stock.destination_program')}
        value={program_name ?? '-'}
        valueClassName='font-mainMedium'
      />
      <InfoRow
        label={t('transfer_stock.destination_activity')}
        value={destination_activity?.label ?? '-'}
        valueClassName='font-mainMedium'
      />
      <StockInfo
        batch={batch}
        activityName={activity?.name ?? ''}
        budgetSourceName={budget_source?.label ?? '-'}
        price={price}
        totalPrice={total_price}
      />
      <Button
        text={t('button.delete')}
        onPress={onDelete}
        containerClassName='self-end'
        textClassName='text-lavaRed'
        {...getTestID(`btn-delete-transfer-stock-item-${index}`)}
      />
    </View>
  )
}

export default React.memo(ReviewTransferStockItem)
