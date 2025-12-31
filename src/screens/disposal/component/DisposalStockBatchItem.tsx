import React, { useMemo } from 'react'
import { Text, View } from 'react-native'
import ActivityLabel from '@/components/ActivityLabel'
import { InfoRow } from '@/components/list/InfoRow'
import Separator from '@/components/separator/Separator'
import { useLanguage } from '@/i18n/useLanguage'
import { DisposalDetailMaterialStockItem } from '@/models/disposal/DisposalStock'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import { numberFormat } from '@/utils/CommonUtils'
import { SHORT_DATE_FORMAT } from '@/utils/Constants'
import { convertString } from '@/utils/DateFormatUtils'
import {
  DISPOSAL_QTY_TYPE,
  disposalQtyLabel,
  disposalQtyTypeLabel,
} from '../disposal-constant'

interface MaterialBatchItemProps {
  disposalStock: DisposalDetailMaterialStockItem
  isManagedInBatch: boolean
}

function DisposalQuantityRenderer({ disposals, qtyType }) {
  const { t } = useLanguage()

  return disposals.map((item) => (
    <InfoRow
      key={`${qtyType}-${item.disposal_stock_id}`}
      label={t('disposal.reason_qty', {
        reason: item.transaction_reason.title,
        interpolation: { escapeValue: false },
      })}
      value={numberFormat(item[`disposal_${qtyType}_qty`] ?? 0)}
      valueClassName='font-mainBold'
    />
  ))
}

export default function DisposalStockBatchItem({
  disposalStock,
  isManagedInBatch,
}: Readonly<MaterialBatchItemProps>) {
  const { t } = useLanguage()

  const {
    activity,
    batch,
    disposal_discard_qty,
    disposal_received_qty,
    disposals,
  } = disposalStock
  const batchCode = batch?.code ?? ''
  const discardQty = disposal_discard_qty ?? 0
  const receivedQty = disposal_received_qty ?? 0
  const disposalQty = discardQty + receivedQty

  const { expiredDate, productionDate } = useMemo(() => {
    if (!isManagedInBatch || !batch) {
      return { expiredDate: '', productionDate: '' }
    }

    return {
      expiredDate: convertString(batch.expired_date, SHORT_DATE_FORMAT),
      productionDate: convertString(batch.production_date, SHORT_DATE_FORMAT),
    }
  }, [isManagedInBatch, batch])

  return (
    <View className='bg-white rounded-sm border border-quillGrey mx-4 mb-4 p-3'>
      <View className='flex-row items-center mb-2'>
        <Text className={cn(AppStyles.textRegular, 'flex-1')}>{batchCode}</Text>
        <ActivityLabel name={activity.name} />
      </View>

      <InfoRow label={t(disposalQtyLabel)} value={disposalQty} />

      {batch && (
        <>
          <Separator className='my-1.5 border-paleGreyTwo' />
          <InfoRow label={t('label.expired_date')} value={expiredDate} />
          <InfoRow
            label={t('label.manufacturer')}
            value={batch.manufacture?.name ?? '-'}
          />
          <InfoRow label={t('label.production_date')} value={productionDate} />
        </>
      )}

      <Separator className='my-2 border-paleGreyTwo' />
      <Text className={AppStyles.labelBold}>
        {t(disposalQtyTypeLabel[DISPOSAL_QTY_TYPE.DISCARD])}
      </Text>
      {discardQty ? (
        <DisposalQuantityRenderer
          disposals={disposals}
          qtyType={DISPOSAL_QTY_TYPE.DISCARD}
        />
      ) : (
        <InfoRow label='-' value='' />
      )}

      <Separator className='my-2 border-paleGreyTwo' />
      <Text className={AppStyles.labelBold}>
        {t(disposalQtyTypeLabel[DISPOSAL_QTY_TYPE.RECEIVED])}
      </Text>
      {receivedQty ? (
        <DisposalQuantityRenderer
          disposals={disposals}
          qtyType={DISPOSAL_QTY_TYPE.RECEIVED}
        />
      ) : (
        <InfoRow label='-' value='' />
      )}
    </View>
  )
}
