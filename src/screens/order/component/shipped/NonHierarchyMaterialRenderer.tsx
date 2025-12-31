import React from 'react'
import { View, Text } from 'react-native'
import { TFunction } from 'i18next'
import { Control } from 'react-hook-form'
import { OrderItemData } from '@/models/order/OrderDetailSection'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import OrderBatchItemRenderer from '../OrderBatchItemRenderer'
import OrderNonBatchItemRenderer from '../OrderNonBatchItemRenderer'

type Props = {
  isBatch: boolean
  isMaterialSensitive: boolean
  item: OrderItemData
  index: number
  control: Control<any>
  formProps: {
    order_items?: Array<{
      receives?: Array<{
        received_qty: number
        material_status?: number
      }>
    }>
  }
  setValue: (name: string, value: number) => void
  t: TFunction
}

const NonHierarchyMaterialRenderer = ({
  isBatch,
  isMaterialSensitive,
  item,
  index,
  control,
  formProps,
  setValue,
  t,
}: Props) => {
  if (isBatch) {
    return (
      <View>
        <Text className={cn(AppStyles.labelBold, 'mb-2')}>
          {t('section.material_batch')}
        </Text>
        <OrderBatchItemRenderer
          stocks={item.order_stocks}
          index={index}
          control={control}
          form={formProps}
          setValue={setValue}
          t={t}
          isMaterialSensitive={isMaterialSensitive}
        />
      </View>
    )
  }

  return (
    <OrderNonBatchItemRenderer
      stocks={item.order_stocks}
      index={index}
      control={control}
      form={formProps}
      setValue={setValue}
      t={t}
      isMaterialSensitive={isMaterialSensitive}
    />
  )
}

export default NonHierarchyMaterialRenderer
