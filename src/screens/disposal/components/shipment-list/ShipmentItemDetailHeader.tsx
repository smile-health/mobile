import React, { useMemo } from 'react'
import { Text, View } from 'react-native'
import { InfoRow } from '@/components/list/InfoRow'
import { useLanguage } from '@/i18n/useLanguage'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import { numberFormat } from '@/utils/CommonUtils'
import { DISPOSAL_STATUS } from '../../disposal-constant'
import { getStatusQtyList } from '../../helper/DisposalShipmentListHelper'

interface Props {
  materialName: string
  receivedQty: number | null
  shippedQty: number
  status: number
}

export default function ShipmentItemDetailHeader(props: Readonly<Props>) {
  const { t } = useLanguage()
  const { materialName, receivedQty, shippedQty, status } = props
  const isCancelled = status === DISPOSAL_STATUS.CANCELLED

  const quantities = useMemo(
    () =>
      getStatusQtyList({
        shippedQty: shippedQty,
        receivedQty: receivedQty,
        cancelledQty: isCancelled ? shippedQty : null,
      }),
    [isCancelled, receivedQty, shippedQty]
  )

  return (
    <View className='bg-white pb-4 gap-y-4'>
      <Text className={AppStyles.textBold}>{t('disposal.item_detail')}</Text>
      <View className='gap-y-2'>
        <Text className={cn(AppStyles.labelBold, 'text-sm')}>
          {t('label.trademark_material')}
        </Text>
        <View className='border border-quillGrey p-2 gap-y-1 rounded-sm'>
          <Text className={AppStyles.textBold}>{materialName}</Text>
          {quantities.map((qtyItem) => (
            <InfoRow
              key={qtyItem.label}
              label={t(qtyItem.label)}
              value={numberFormat(qtyItem.qty)}
              valueClassName='font-mainBold'
            />
          ))}
        </View>
      </View>
    </View>
  )
}
