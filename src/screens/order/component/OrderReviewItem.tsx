import React from 'react'
import { View, Text } from 'react-native'
import { useLanguage } from '@/i18n/useLanguage'
import { ReasonOption } from '@/models/Common'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import { numberFormat } from '@/utils/CommonUtils'
import { OTHER_REASON_ID } from '@/utils/Constants'
import { OrderReviewSubItem } from './OrderReviewSubItem'

interface QuantityReasonProps {
  label: string
  value: string | number
}

interface OrderReviewItemProps {
  item: {
    material_name: string
    ordered_qty?: number | string
    reason_id?: string | number
    other_reason?: string
    order_reason_id?: string
    material_hierarchy?: {
      material_id: number
      material_name: string
      ordered_qty?: number | string
      reason_id?: number | string
    }[]
    children: {
      id: number
      ordered_qty: number
      material_name: string
    }[]
  }
  isReason?: boolean
  isHierarchy?: boolean
  dataReason?: ReasonOption[]
}

const QuantityReason: React.FC<QuantityReasonProps> = ({ label, value }) => (
  <View className={cn(AppStyles.rowBetween, 'items-start')}>
    <Text
      className={cn(
        AppStyles.textRegularSmall,
        'text-mediumGray flex-none w-20'
      )}>
      {label}
    </Text>
    <Text
      className={cn(
        AppStyles.textBoldSmall,
        'flex-1 font-mainBold text-right'
      )}>
      {value}
    </Text>
  </View>
)
export const OrderReviewItem: React.FC<OrderReviewItemProps> = ({
  item,
  isReason,
  isHierarchy,
  dataReason,
}) => {
  const { t } = useLanguage()

  const getReasonLabel = (reasonId: string | number, otherReason: string) => {
    // case other reason
    if (reasonId === OTHER_REASON_ID) return otherReason
    const found = dataReason?.find(
      (reason) => reason.reason_id === Number(reasonId)
    )

    return found?.value ?? ''
  }

  const hasMaterialHierarchy = !!item?.material_hierarchy?.length
  const hasChildren = hasMaterialHierarchy || !!item?.children?.length

  return (
    <View className='border border-whiteTwo rounded-xs bg-white p-2 mb-2 mx-4'>
      {isHierarchy && (
        <Text className={cn(AppStyles.textBoldSmall, 'text-mediumGray mb-1')}>
          {t('label.active_ingredient_material')}
        </Text>
      )}
      <Text className={cn(AppStyles.textBoldMedium, 'mb-2')}>
        {item.material_name ?? ''}
      </Text>
      <QuantityReason
        value={numberFormat(Number(item.ordered_qty)) ?? 0}
        label={t('label.order_qty')}
      />
      {isReason && (
        <View>
          <View className='w-full h-[1px] bg-quillGrey my-2' />
          <QuantityReason
            value={getReasonLabel(
              item?.reason_id ?? item.order_reason_id ?? '',
              item?.other_reason ?? ''
            )}
            label={t('label.reason')}
          />
        </View>
      )}

      {hasChildren && (
        <View className='mt-4'>
          <Text className={cn(AppStyles.textBoldSmall, 'text-mediumGray mb-2')}>
            {t('label.trademark_material')}
          </Text>
          {[
            ...(item.material_hierarchy ?? []),
            ...(item.children ?? []).map((child) => ({
              material_id: child.id,
              material_name: child.material_name,
              ordered_qty: child.ordered_qty,
            })),
          ].map((child) => (
            <OrderReviewSubItem
              key={`item-${child.material_id}`}
              item={child}
              dataReason={dataReason}
              isReason={isReason}
            />
          ))}
        </View>
      )}
    </View>
  )
}
