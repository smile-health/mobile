import React from 'react'
import { View, Text } from 'react-native'
import { TFunction } from 'i18next'
import { Control } from 'react-hook-form'
import { InfoRow } from '@/components/list/InfoRow'
import Separator from '@/components/separator/Separator'
import { OrderItemData } from '@/models/order/OrderDetailSection'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import OrderBatchItemRenderer from '../OrderBatchItemRenderer'
import OrderNonBatchItemRenderer from '../OrderNonBatchItemRenderer'

interface HierarchyMaterialRendererProps {
  child: OrderItemData
  index: number
  childIdx: number
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
  isHierarchy: boolean
}

const ChildMaterialRenderer: React.FC<HierarchyMaterialRendererProps> = ({
  child,
  index,
  childIdx,
  control,
  formProps,
  setValue,
  t,
  isHierarchy,
}) => {
  const isBatchChild = child.material?.is_managed_in_batch === 1
  const isMaterialSensitive = child.material?.is_temperature_sensitive === 1

  return (
    <View
      key={child.material.id}
      className='border border-lightGreyMinimal rounded-xs bg-catskillWhite p-2 mb-2'>
      <Text className={AppStyles.textBoldMedium}>{child.material.name}</Text>

      <InfoRow
        label={t('label.shipped_qty')}
        value={child.confirmed_qty}
        labelClassName='mt-1'
      />
      {isBatchChild && (
        <InfoRow
          label={t('label.ordered_qty')}
          value={child.ordered_qty}
          labelClassName='mt-1'
        />
      )}

      <Separator className='my-2' />

      {isBatchChild && (
        <Text className={cn(AppStyles.labelBold, 'mt-1 mb-2')}>
          {t('section.material_batch')}
        </Text>
      )}

      {isBatchChild ? (
        <OrderBatchItemRenderer
          stocks={child.order_stocks}
          index={index}
          childIdx={childIdx}
          control={control}
          form={formProps}
          setValue={setValue}
          t={t}
          isMaterialSensitive={isMaterialSensitive}
          isHierarchy={isHierarchy}
        />
      ) : (
        <OrderNonBatchItemRenderer
          stocks={child.order_stocks}
          index={index}
          childIdx={childIdx}
          control={control}
          form={formProps}
          setValue={setValue as (name: string, value: number) => void}
          t={t}
          isMaterialSensitive={isMaterialSensitive}
          isHierarchy={isHierarchy}
        />
      )}
    </View>
  )
}

export default ChildMaterialRenderer
