import React from 'react'
import { View, Text } from 'react-native'
import { Icons } from '@/assets/icons'
import MaterialItem from '@/components/list/MaterialItem'
import { useLanguage } from '@/i18n/useLanguage'
import { MaterialCardValue } from '@/screens/inventory/component/MaterialCard'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import { MinMaxBox } from '../../order/component/MinMaxBox'
import { MaterialData } from '../types/MaterialDetail'

interface MaterialInfoProps {
  data: MaterialData
  qtyMaterial?: number
  currentMinMax?: any
  showStockQty?: boolean
  showMinMax?: boolean
  isHierarchy?: boolean
  isTrademark?: boolean
}

export const MaterialInfo: React.FC<MaterialInfoProps> = ({
  data,
  qtyMaterial,
  currentMinMax,
  showStockQty = false,
  showMinMax = true,
  isHierarchy = false,
  isTrademark = false,
}) => {
  const { t } = useLanguage()

  const getLabel = () => {
    if (isTrademark) return 'label.trademark_material'
    if (isHierarchy) return 'label.active_ingredient_material'
    return 'label.material'
  }

  return (
    <View className='bg-lightGrey p-4'>
      <Text className={cn(AppStyles.textBold, 'mb-2')}>{t(getLabel())}</Text>
      <MaterialItem
        name={data?.name}
        qty={qtyMaterial ?? 0}
        min={currentMinMax?.min ?? 0}
        max={currentMinMax?.max ?? 0}
        updatedAt={data.updated_at}
        className='border-none'
      />
      {showStockQty && (
        <View className={cn(AppStyles.rowBetween, 'mt-1 gap-x-2')}>
          <MaterialCardValue
            label={t('label.stock_on_hand')}
            value={data.total_qty}
          />
          <MaterialCardValue
            label={t('label.allocated_stock')}
            value={data.total_allocated_qty}
          />
        </View>
      )}
      {showMinMax && (
        <View className={cn(AppStyles.rowBetween, 'mt-1 gap-x-2')}>
          <MinMaxBox
            label={t('label.min')}
            value={currentMinMax?.min ?? 0}
            containerClassName='bg-white'
            icon={<Icons.IcMin />}
          />
          <MinMaxBox
            label={t('label.max')}
            value={currentMinMax?.max ?? 0}
            containerClassName='bg-white'
            icon={<Icons.IcMax />}
          />
        </View>
      )}
    </View>
  )
}
