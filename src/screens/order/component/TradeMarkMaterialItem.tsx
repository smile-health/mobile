import React from 'react'
import { View, Text } from 'react-native'
import { TFunction } from 'i18next'
import ActivityLabel from '@/components/ActivityLabel'
import { InfoRow } from '@/components/list/InfoRow'
import Separator from '@/components/separator/Separator'
import { OrderItemData } from '@/models/order/OrderDetailSection'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import { numberFormat } from '@/utils/CommonUtils'
import { SHORT_DATE_FORMAT } from '@/utils/Constants'
import { convertString } from '@/utils/DateFormatUtils'
import OrderItemQuantityInfo from './OrderItemDetail/OrderItemQuantityInfo'

type TradeMarkMaterialItemProps = {
  name: string
  label: string
  qty: number
  t: TFunction
  type?: string
  data?: OrderItemData
  orderStatus?: number
}

const TradeMarkMaterialItem: React.FC<TradeMarkMaterialItemProps> = ({
  name,
  label,
  qty,
  t,
  type,
  data,
  orderStatus,
}) => {
  const isDetail = type === 'detail'
  const isBatch = (data?.order_stocks ?? []).length > 0

  return (
    <View
      className={cn(
        AppStyles.card,
        'bg-catskillWhite border-lightGreyMinimal p-2'
      )}>
      <Text className={AppStyles.textRegular}>{name}</Text>
      <View className={cn(AppStyles.rowBetween, 'mt-1')}>
        <Text className={cn(AppStyles.textRegularSmall, 'text-mediumGray')}>
          {label}
        </Text>
        <Text className={cn(AppStyles.textBoldMedium, 'text-right')}>
          {numberFormat(qty)}
        </Text>
      </View>
      {isDetail && isBatch && (
        <View>
          <Separator className='my-2' />
          <Text className={cn(AppStyles.textRegularSmall, 'mb-2')}>
            {t('disposal.material_batch')}
          </Text>
          {data?.order_stocks.map((stock) => (
            <View
              key={stock.id}
              className='border-quillGrey border p-2 my-1 rounded-sm bg-white'>
              <View className='flex-row items-center gap-x-2 mb-3'>
                <Text className={cn(AppStyles.textRegularMedium, 'flex-1')}>
                  {stock?.batch?.code}
                </Text>
                <ActivityLabel name={stock?.activity_name} />
              </View>
              <OrderItemQuantityInfo
                orderStatus={orderStatus ?? 0}
                allocatedQty={stock?.allocated_qty}
                receivedQty={stock?.received_qty}
                shippedQty={stock?.shipped_qty}
              />
              <Separator className='my-2' />
              <InfoRow
                label={t('label.expired_date')}
                value={
                  convertString(
                    stock?.batch?.expired_date,
                    SHORT_DATE_FORMAT
                  ) || '-'
                }
              />
              <InfoRow
                labelClassName='my-1'
                label={t('label.manufacturer')}
                value={stock?.batch?.manufacture_name || '-'}
              />
            </View>
          ))}
        </View>
      )}
    </View>
  )
}

export default TradeMarkMaterialItem
