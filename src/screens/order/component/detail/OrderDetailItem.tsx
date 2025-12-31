import React, { memo, useMemo } from 'react'
import { View, TouchableOpacity, Text } from 'react-native'
import { Icons } from '@/assets/icons'
import { useLanguage } from '@/i18n/useLanguage'
import { OrderItemData } from '@/models/order/OrderDetailSection'
import AppStyles from '@/theme/AppStyles'
import colors from '@/theme/colors'
import { cn } from '@/theme/theme-config'
import { getTestID, numberFormat } from '@/utils/CommonUtils'
import { ORDER_STATUS, ORDER_TYPE, orderStatusLabel } from '@/utils/Constants'
import TradeMarkMaterialItem from '../TradeMarkMaterialItem'

interface OrderDetailItemProps {
  data: OrderItemData
  orderStatus: number
  isVendor?: boolean
  onPress?: (data: OrderItemData) => void
  withDetail?: boolean
  containerClassName?: string
  isHierarchy?: boolean
  type?: number
}

export const OrderDetailItem = memo(function OrderDetailItem({
  data,
  onPress,
  orderStatus,
  withDetail = true,
  containerClassName,
  isHierarchy,
  type,
}: OrderDetailItemProps) {
  const { t } = useLanguage()
  const {
    id,
    material,
    qty,
    confirmed_qty,
    allocated_qty,
    shipped_qty,
    fulfilled_qty,
  } = data
  const isTradeMarkMaterial = data?.children?.length > 0
  const isActiveIngredient =
    isHierarchy &&
    type !== ORDER_TYPE.DISTRIBUTION &&
    type !== ORDER_TYPE.RETURN
  const isOrderStatusDraft = orderStatus === ORDER_STATUS.DRAFT

  const statusCount = useMemo(() => {
    if (orderStatus === ORDER_STATUS.CANCELLED) {
      return (
        [fulfilled_qty, allocated_qty, confirmed_qty, qty].find(
          (val) => val !== 0 && val !== null && val !== undefined
        ) ?? 0
      )
    }

    const statusMap: Record<number, number | undefined> = {
      [ORDER_STATUS.PENDING]: qty,
      [ORDER_STATUS.CONFIRMED]: confirmed_qty,
      [ORDER_STATUS.ALLOCATED]: allocated_qty,
      [ORDER_STATUS.SHIPPED]: shipped_qty,
      [ORDER_STATUS.FULFILLED]: fulfilled_qty,
      [ORDER_STATUS.DRAFT]: qty,
    }
    return statusMap[orderStatus] ?? 0
  }, [
    orderStatus,
    qty,
    confirmed_qty,
    allocated_qty,
    shipped_qty,
    fulfilled_qty,
  ])

  const handlePress = () => onPress?.(data)

  const labelText = isOrderStatusDraft
    ? t('label.confirmed_qty')
    : t(orderStatusLabel[orderStatus] || '').replace(/^label\./, '')

  return (
    <View className={cn('bg-white', containerClassName)}>
      <TouchableOpacity
        activeOpacity={withDetail ? 0 : 0.7}
        onPress={handlePress}
        className={cn(AppStyles.card, 'justify-between p-2')}
        {...getTestID(`order_item_${id}`)}>
        <View className={AppStyles.rowBetween}>
          <Text
            className={cn(
              isActiveIngredient ? AppStyles.textBoldSmall : AppStyles.textBold,
              'mb-1 w-4/5',
              isActiveIngredient && 'text-mediumGray'
            )}>
            {isActiveIngredient
              ? t('label.active_ingredient_material')
              : material?.name}
          </Text>

          {withDetail && <DetailButton label={t('order.detail')} />}
        </View>

        {isActiveIngredient && (
          <Text className={cn(AppStyles.textBold, 'my-1')}>
            {material?.name}
          </Text>
        )}

        <View className={AppStyles.rowBetween}>
          <Text className={cn(AppStyles.textRegularSmall, 'text-mediumGray')}>
            {labelText}
          </Text>
          <Text className={cn(AppStyles.textBoldMedium, 'text-right')}>
            {numberFormat(statusCount)}
          </Text>
        </View>

        {isTradeMarkMaterial && (
          <View>
            <View className='w-full h-[1px] bg-lightGreyMinimal my-2' />
            <Text
              className={cn(
                AppStyles.textBoldSmall,
                'mb-1 flex-1 text-mediumGray'
              )}>
              {t('label.trademark_material')}
            </Text>
          </View>
        )}

        {isTradeMarkMaterial &&
          data?.children?.map((item) => (
            <TradeMarkMaterialItem
              key={item.id}
              name={item.material?.name}
              label={labelText}
              qty={item.qty}
              t={t}
            />
          ))}
      </TouchableOpacity>
    </View>
  )
})

const DetailButton = memo(({ label }: { label: string }) => (
  <View className={cn(AppStyles.rowCenter, 'mb-auto w-1/5')}>
    <Text className={cn(AppStyles.textRegularMedium, 'text-main')}>
      {label}
    </Text>
    <Icons.IcChevronRightActive fill={colors.main()} />
  </View>
))

DetailButton.displayName = 'DetailButton'
