import React from 'react'
import { View } from 'react-native'
import { FieldValue } from '@/components/list/FieldValue'
import { InfoRow } from '@/components/list/InfoRow'
import { useLanguage } from '@/i18n/useLanguage'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import { numberFormat } from '@/utils/CommonUtils'
import MaterialCard, { MaterialCardProps } from '../MaterialCard'

export interface StockDetailHeaderProps extends MaterialCardProps {
  parentMaterialName?: string
  parentStockQty?: number
}

function StockDetailHeader(props: Readonly<StockDetailHeaderProps>) {
  const { parentMaterialName, parentStockQty = 0, ...materialCardProps } = props
  return (
    <View className='bg-lightGrey'>
      {!!parentMaterialName && (
        <ParentMaterialInfo name={parentMaterialName} qty={parentStockQty} />
      )}
      <MaterialCard {...materialCardProps} />
    </View>
  )
}

export default React.memo(StockDetailHeader)

function ParentMaterialInfo({
  name,
  qty,
}: Readonly<{ name?: string; qty: number }>) {
  const { t } = useLanguage()
  return (
    <View className={cn(AppStyles.borderBottom, 'mx-4 py-4')}>
      <FieldValue
        label={t('label.active_ingredient_material')}
        value={name}
        labelClassName={AppStyles.labelBold}
        valueClassName='font-mainBold'
      />
      <InfoRow
        label={t('label.qty')}
        value={numberFormat(qty)}
        valueClassName='font-mainBold'
      />
    </View>
  )
}
