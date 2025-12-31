import React, { useMemo } from 'react'
import { Text, View } from 'react-native'
import ActivityLabel from '@/components/ActivityLabel'
import { InfoRow } from '@/components/list/InfoRow'
import { useLanguage } from '@/i18n/useLanguage'
import { IDisposalShipmentStock } from '@/models/disposal/DisposalShipmentList'
import AppStyles, { flexStyle } from '@/theme/AppStyles'
import { numberFormat } from '@/utils/CommonUtils'
import { SHORT_DATE_FORMAT } from '@/utils/Constants'
import { convertString } from '@/utils/DateFormatUtils'
import DisposalShipmentStockItemInfo from './DisposalShipmentStockItemInfo'
import { DISPOSAL_STATUS } from '../../disposal-constant'
import { getStatusQtyList } from '../../helper/DisposalShipmentListHelper'

interface Props {
  item: IDisposalShipmentStock
  status: number
}

function DisposalShipmentStockItem({ item, status }: Readonly<Props>) {
  const { t } = useLanguage()
  const {
    disposal_received_qty,
    disposal_discard_qty,
    stock,
    transaction_reasons,
  } = item
  const { batch, activity } = stock
  const isCancelled = status === DISPOSAL_STATUS.CANCELLED
  const isReceived = status === DISPOSAL_STATUS.RECEIVED

  const quantities = useMemo(() => {
    const totalQty = (disposal_discard_qty ?? 0) + (disposal_received_qty ?? 0)
    return getStatusQtyList({
      shippedQty: totalQty,
      receivedQty: isReceived ? totalQty : null,
      cancelledQty: isCancelled ? totalQty : null,
    })
  }, [disposal_discard_qty, disposal_received_qty, isCancelled, isReceived])

  return (
    <View className='mt-2 p-2 border border-lightGreyMinimal'>
      <View className='flex-row justify-between items-center mb-1'>
        <Text className={AppStyles.textRegular} style={flexStyle}>
          {batch?.code}
        </Text>
        <ActivityLabel name={activity.name} />
      </View>
      {quantities.map((qtyItem) => (
        <InfoRow
          key={qtyItem.label}
          label={t(qtyItem.label)}
          value={numberFormat(qtyItem.qty)}
          valueClassName='font-mainBold'
        />
      ))}
      {batch != null && (
        <View className='mt-2 pt-1 border-t border-t-lightGreyMinimal'>
          <InfoRow
            label={t('label.expired_date')}
            value={convertString(batch?.expired_date, SHORT_DATE_FORMAT)}
          />
          <InfoRow
            label={t('label.manufacturer')}
            value={batch?.manufacture?.name ?? '-'}
          />
        </View>
      )}
      <DisposalShipmentStockItemInfo
        discardQty={disposal_discard_qty}
        receivedQty={disposal_received_qty}
        reason={transaction_reasons.title}
        t={t}
      />
    </View>
  )
}

export default React.memo(DisposalShipmentStockItem)
