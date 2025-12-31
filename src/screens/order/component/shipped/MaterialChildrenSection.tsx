import React from 'react'
import { View, Text } from 'react-native'
import { TFunction } from 'i18next'
import { Control } from 'react-hook-form'
import { OrderItemData } from '@/models/order/OrderDetailSection'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import HierarchyMaterialRenderer from './HierarchyMaterialRenderer'

interface WithHierarchyProps {
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
  setValue: any
  t: TFunction
  isHierarchy: boolean
}

const MaterialChildrenSection: React.FC<WithHierarchyProps> = ({
  item,
  index,
  control,
  formProps,
  setValue,
  t,
  isHierarchy,
}) => (
  <View>
    <Text className={cn(AppStyles.textBoldSmall, 'text-mediumGray mt-1 mb-2')}>
      {t('label.trademark_material')}
    </Text>
    {item?.children?.map((child, childIdx) => (
      <HierarchyMaterialRenderer
        key={child.material.id}
        child={child}
        index={index}
        childIdx={childIdx}
        control={control}
        formProps={formProps}
        setValue={setValue}
        t={t}
        isHierarchy={isHierarchy}
      />
    ))}
  </View>
)

export default MaterialChildrenSection
