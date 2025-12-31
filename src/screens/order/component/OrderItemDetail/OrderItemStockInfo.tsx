import React, { useMemo } from 'react'
import { Text, View } from 'react-native'
import ActivityLabel from '@/components/ActivityLabel'
import { InfoRow } from '@/components/list/InfoRow'
import { useLanguage } from '@/i18n/useLanguage'
import { OrderStocks } from '@/models'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import { materialStatuses, SHORT_DATE_FORMAT } from '@/utils/Constants'
import { convertString } from '@/utils/DateFormatUtils'
import OrderItemQuantityInfo from './OrderItemQuantityInfo'

interface Props {
  data: OrderStocks & { shipped_qty: number }
  orderStatus: number
}

function OrderItemStockItem({ data, orderStatus }: Readonly<Props>) {
  const { t } = useLanguage()
  const {
    batch,
    activity_name,
    allocated_qty,
    shipped_qty,
    received_qty,
    status,
  } = data

  const statusName = useMemo(
    () => materialStatuses.find((ms) => ms.value === status),
    [status]
  )
  return (
    <View className='border border-quillGrey p-2 rounded-sm mb-2'>
      <View className='flex-row items-center mb-2.5'>
        <Text className={cn(AppStyles.textRegular, 'flex-1')}>
          {batch ? batch.code : ''}
        </Text>
        <ActivityLabel name={activity_name} />
      </View>
      <OrderItemQuantityInfo
        orderStatus={orderStatus}
        allocatedQty={allocated_qty}
        shippedQty={shipped_qty}
        receivedQty={received_qty}
      />
      {batch && (
        <View className='gap-y-1 border-t border-quillGrey pt-1 my-1'>
          <InfoRow
            label={t('label.expired_date')}
            value={convertString(batch.expired_date, SHORT_DATE_FORMAT)}
            valueClassName='uppercase'
          />
          <InfoRow
            label={t('label.manufacturer_name')}
            value={batch.manufacture_name ?? '-'}
          />
        </View>
      )}
      {statusName && (
        <View className='gap-y-1 border-t border-quillGrey pt-1'>
          <InfoRow
            label={t('label.material_status')}
            value={statusName.label}
          />
        </View>
      )}
    </View>
  )
}

export default React.memo(OrderItemStockItem)
