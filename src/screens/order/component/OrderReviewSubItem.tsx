import React from 'react'
import { View, Text } from 'react-native'
import { useLanguage } from '@/i18n/useLanguage'
import { ReasonOption } from '@/models/Common'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import { numberFormat } from '@/utils/CommonUtils'
import { OTHER_REASON_ID } from '@/utils/Constants'

interface OrderReviewSubItemProps {
  item: {
    material_id: number
    material_name: string
    ordered_qty?: number | string
    reason_id?: number | string
    other_reason?: string
  }
  isReason?: boolean
  dataReason?: ReasonOption[]
}

export const OrderReviewSubItem: React.FC<OrderReviewSubItemProps> = ({
  item,
  isReason,
  dataReason,
}) => {
  const { t } = useLanguage()

  const showReasonSection =
    isReason &&
    item.reason_id !== undefined &&
    item.reason_id !== null &&
    item.reason_id !== 0

  const getReasonLabel = (
    reasonId: number | string | undefined,
    otherReason: string
  ) => {
    // case other reason
    if (reasonId === OTHER_REASON_ID) return otherReason

    const found = dataReason?.find(
      (reason) => reason.reason_id === Number(reasonId)
    )
    return found?.value ?? ''
  }

  return (
    <View className='bg-lightGrey p-2 rounded-xs mb-2'>
      <Text className={cn(AppStyles.textRegular)}>{item.material_name}</Text>

      <View className='flex-row justify-between'>
        <Text className={cn(AppStyles.textRegularSmall, 'text-mediumGray')}>
          {t('label.order_qty')}
        </Text>
        <Text className={AppStyles.textBoldSmall}>
          {numberFormat(Number(item.ordered_qty ?? 0))}
        </Text>
      </View>

      {showReasonSection && (
        <>
          <View className='w-full h-[1px] bg-quillGrey my-2' />
          <View className='flex-row justify-between'>
            <Text className={cn(AppStyles.textRegularSmall, 'text-mediumGray')}>
              {t('label.reason')}
            </Text>
            <Text className={AppStyles.textBoldSmall}>
              {getReasonLabel(item.reason_id, item.other_reason ?? '')}
            </Text>
          </View>
        </>
      )}
    </View>
  )
}
