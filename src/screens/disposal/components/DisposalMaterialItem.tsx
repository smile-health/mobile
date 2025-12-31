import React, { useMemo } from 'react'
import { View, Text, Pressable } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Icons } from '@/assets/icons'
import { DisposalStockItemResponse } from '@/models/disposal/DisposalStock'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import { numberFormat } from '@/utils/CommonUtils'
import { SHORT_DATE_TIME_FORMAT } from '@/utils/Constants'
import { convertString } from '@/utils/DateFormatUtils'
import { disposalQtyLabel } from '../disposal-constant'

interface DisposalMaterialItemProps {
  material: DisposalStockItemResponse
  label: string | null
  className?: string
  onPress?: (material: DisposalStockItemResponse) => void
}

function DisposalMaterialItem({
  material,
  label,
  className,
  onPress,
}: Readonly<DisposalMaterialItemProps>) {
  const { t } = useTranslation()
  const {
    material: materialDetail,
    total_disposal_discard_qty,
    total_disposal_received_qty,
    updated_at,
  } = material

  const disposalQty = useMemo(() => {
    return numberFormat(
      total_disposal_discard_qty + total_disposal_received_qty
    )
  }, [total_disposal_discard_qty, total_disposal_received_qty])

  const handlePressMaterial = () => {
    if (onPress) {
      onPress(material)
    }
  }

  return (
    <Pressable
      onPress={handlePressMaterial}
      className={cn('bg-white p-2 mx-4 border border-neutral-200', className)}>
      <View className='flex-row items-center'>
        <View className='flex-1 gap-x-2'>
          <Text className={cn(AppStyles.textMedium)}>
            {materialDetail?.name}
          </Text>
          <View className='flex-row justify-between items-baseline'>
            <Text className={cn(AppStyles.labelRegular, 'text-xxs mt-1')}>
              {t('label.updated_at')}{' '}
              {convertString(updated_at, SHORT_DATE_TIME_FORMAT) || '-'}
            </Text>
            <Text className={cn(AppStyles.labelRegular, 'text-xxs')}>
              {t(disposalQtyLabel)}
              {': '}
              <Text className='font-mainBold text-marine'>{disposalQty}</Text>
            </Text>
          </View>
        </View>
        {!!onPress && <Icons.IcChevronRight width={20} height={20} />}
      </View>

      {label != null && <DisposalLabel label={label} />}
    </Pressable>
  )
}

function DisposalLabel({ label }: Readonly<{ label: string }>) {
  return (
    <View
      className={cn(
        AppStyles.rowCenterAlign,
        'border-t border-lightGreyMinimal mt-2 pt-2'
      )}>
      <Icons.IcFlag />
      <Text className={cn(AppStyles.textRegularSmall, 'text-scienceBlue ml-1')}>
        {label}
      </Text>
    </View>
  )
}

export default React.memo(DisposalMaterialItem)
