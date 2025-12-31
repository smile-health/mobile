import React, { ComponentType } from 'react'
import { Text, View } from 'react-native'
import { ParseKeys } from 'i18next'
import { Icons } from '@/assets/icons'
import { FieldValue } from '@/components/list/FieldValue'
import MaterialItem, { MaterialItemProps } from '@/components/list/MaterialItem'
import { useLanguage } from '@/i18n/useLanguage'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import { numberFormat } from '@/utils/CommonUtils'

export interface MaterialCardProps extends MaterialItemProps {
  available: number
  allocated: number
  title?: ParseKeys
  className?: string
  titleClassName?: string
  showMinMax?: boolean
  showStockQty?: boolean
}

interface MaterialCardValueProps {
  label: string
  labelClassName?: string
  value: number | null
  Icon?: ComponentType<any>
}

export const MaterialCardValue = (props: MaterialCardValueProps) => {
  const { label, value, Icon, labelClassName } = props
  const appliedLabelClassName = labelClassName ?? 'text-xxs'
  return (
    <View className={cn(AppStyles.border, 'p-2 bg-white flex-row flex-1')}>
      <FieldValue
        label={label}
        value={numberFormat(value)}
        defaultValue={0}
        containerClassName='flex-1'
        labelClassName={appliedLabelClassName}
        valueClassName='font-mainBold'
      />
      {Icon && <Icon />}
    </View>
  )
}

function MaterialCard(props: Readonly<MaterialCardProps>) {
  const {
    available,
    allocated,
    title = 'label.material',
    className,
    titleClassName,
    showMinMax = true,
    showStockQty = true,
    qty,
    ...rest
  } = props
  const { t } = useLanguage()
  return (
    <View className={cn('bg-lightGrey p-4 gap-y-1', className)}>
      <Text className={cn(AppStyles.textBold, titleClassName)}>{t(title)}</Text>
      <MaterialItem withUpdateLabel qty={available} {...rest} />
      {showStockQty && (
        <View className='flex-row gap-x-2'>
          <MaterialCardValue label={t('label.stock_on_hand')} value={qty} />
          <MaterialCardValue
            label={t('label.allocated_stock')}
            value={allocated}
          />
        </View>
      )}
      {showMinMax && (
        <View className='flex-row gap-x-2'>
          <MaterialCardValue
            label={t('label.min')}
            value={rest.min}
            Icon={Icons.IcMin}
          />
          <MaterialCardValue
            label={t('label.max')}
            value={rest.max}
            Icon={Icons.IcMax}
          />
        </View>
      )}
    </View>
  )
}

export default React.memo(MaterialCard)
