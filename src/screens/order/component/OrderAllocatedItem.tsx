import React from 'react'
import { View, Text } from 'react-native'
import { TFunction } from 'i18next'
import { Icons } from '@/assets/icons'
import { BaseButton } from '@/components/buttons'
import { InfoRow } from '@/components/list/InfoRow'
import Separator from '@/components/separator/Separator'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import { getTestID, numberFormat } from '@/utils/CommonUtils'

interface OrderAllocatedItemProps {
  item: any
  t: TFunction
  onAllocate: () => void
  allocatedLabel?: string
  totalDraftAllocatedQty: number
}

export const OrderAllocatedItem = ({
  item,
  t,
  onAllocate,
  allocatedLabel,
  totalDraftAllocatedQty,
}: OrderAllocatedItemProps) => {
  return (
    <View className='mx-4 border-quillGrey border p-2 mb-2 rounded-sm'>
      <Text className={cn(AppStyles.textBold, 'flex-1')}>
        {item.material?.name}
      </Text>
      <InfoRow
        label={t('label.confirmed_qty')}
        value={numberFormat(item.confirmed_qty)}
        labelClassName='mt-1'
      />
      <InfoRow
        label={t('label.allocated_qty')}
        value={numberFormat(totalDraftAllocatedQty || 0)}
        labelClassName='my-1'
      />
      <Separator />
      {allocatedLabel && <AllocatedLabel label={allocatedLabel} />}
      <BaseButton
        preset='outlined'
        textClassName={cn(AppStyles.textMedium, 'text-main')}
        containerClassName='flex-1 text-center border-main py-3 mt-2'
        text={t('button.allocate_stock')}
        onPress={onAllocate}
        {...getTestID('btn-allocate-stock')}
      />
    </View>
  )
}

function AllocatedLabel({ label }: Readonly<{ label?: string }>) {
  return (
    <View className={AppStyles.rowCenterAlign}>
      <Icons.IcFlag />
      <Text className={cn(AppStyles.textRegularSmall, 'text-scienceBlue ml-1')}>
        {label}
      </Text>
    </View>
  )
}
