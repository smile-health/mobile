import React, { useState } from 'react'
import { Pressable, View } from 'react-native'
import { TFunction } from 'i18next'
import { FieldErrors, UseFormReturn } from 'react-hook-form'
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated'
import { Icons } from '@/assets/icons'
import ActivityLabel from '@/components/ActivityLabel'
import Dropdown from '@/components/dropdown/Dropdown'
import { InfoRow } from '@/components/list/InfoRow'
import Separator from '@/components/separator/Separator'
import type { StockData } from '@/screens/order/types/order'
import { getTestID, numberFormat } from '@/utils/CommonUtils'
import { materialStatuses } from '@/utils/Constants'
import OrderQtyInput from './OrderQtyInput'

interface OrderNonBatchItemProps {
  item: StockData
  methods: UseFormReturn<any>
  errors: FieldErrors
  t: TFunction
}

const OrderNonBatchItem = ({
  item,
  methods,
  errors,
  t,
}: OrderNonBatchItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const stockId = item.stock_id

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: withTiming(isExpanded ? '180deg' : '0deg') }],
  }))

  const handleExpand = () => {
    setIsExpanded((prev) => !prev)
  }

  return (
    <View className='border border-quillGrey rounded p-3 bg-white'>
      <View className=' border-quillGrey border p-3 mb-2 rounded-sm gap-1'>
        <Pressable
          className='flex-row items-center justify-end gap-2'
          onPress={handleExpand}>
          <ActivityLabel name={item?.activity_name ?? ''} />
          <Animated.View style={iconStyle}>
            <Icons.IcExpandMore height={20} width={20} />
          </Animated.View>
        </Pressable>
        <InfoRow
          label={t('label.available_stock')}
          value={numberFormat(item.available)}
        />

        {isExpanded && (
          <>
            <Separator />
            <InfoRow
              label={t('label.allocated_stock')}
              value={numberFormat(item.allocated)}
              valueClassName='uppercase'
            />
            <InfoRow
              label={t('label.stock_on_hand')}
              value={numberFormat(item.qty)}
            />
            <Separator />

            <OrderQtyInput
              stockId={stockId}
              maxQty={item.available}
              methods={methods}
              errors={errors}
              t={t}
            />
          </>
        )}
      </View>

      {item.is_temperature_sensitive && (
        <Dropdown
          data={materialStatuses}
          preset='bottom-border'
          name={`material_status.${stockId}`}
          control={methods.control}
          label={t('label.material_status')}
          placeholder={t('label.material_status')}
          isMandatory
          {...getTestID(`dropdown-nonbatch-status-${stockId}`)}
        />
      )}
    </View>
  )
}

export default OrderNonBatchItem
