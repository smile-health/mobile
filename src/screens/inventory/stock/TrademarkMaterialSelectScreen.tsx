import React from 'react'
import { Text, View } from 'react-native'
import { ActivityHeader } from '@/components/header/ActivityHeader'
import MaterialItem, { MaterialItemProps } from '@/components/list/MaterialItem'
import MaterialList from '@/components/list/MaterialList'
import { useLanguage } from '@/i18n/useLanguage'
import { StockItem } from '@/models/shared/Material'
import { AppStackScreenProps } from '@/navigators'
import AppStyles from '@/theme/AppStyles'
import { calculateTotalQty } from '@/utils/helpers/material/commonHelper'
import useTrademarkMaterialStock from '../hooks/stock/useTrademarkMaterialStock'

const getMaterialHeaderProps = (stock: StockItem | null) => {
  const { material, updated_at = '', details = [] } = stock || {}

  const qty = calculateTotalQty(details, 'total_available_qty')
  const min = calculateTotalQty(details, 'min')
  const max = calculateTotalQty(details, 'max')

  return {
    name: material?.name ?? '',
    updatedAt: updated_at,
    min,
    max,
    qty,
  }
}

interface Props extends AppStackScreenProps<'TrademarkMaterialSelect'> {}
export default function TrademarkMaterialSelectScreen({
  route: { params },
}: Props) {
  const { stockActivity, stockMaterial, handlePressTrademarkMaterial } =
    useTrademarkMaterialStock()

  const { t } = useLanguage()

  const materialHeaderProps = getMaterialHeaderProps(stockMaterial)

  return (
    <View className='bg-white flex-1'>
      <ActivityHeader name={stockActivity.name} />
      <ActiveMaterialHeader {...materialHeaderProps} />
      <MaterialList
        data={stockMaterial?.details || []}
        alerts={params.alerts}
        title={t('label.trademark_material_list')}
        onPressMaterial={handlePressTrademarkMaterial}
      />
    </View>
  )
}

function ActiveMaterialHeader(props: Readonly<MaterialItemProps>) {
  const { t } = useLanguage()
  return (
    <View className='p-4 bg-lightGrey gap-y-1'>
      <Text className={AppStyles.textBold}>
        {t('label.active_ingredient_material')}
      </Text>
      <MaterialItem withUpdateLabel {...props} />
    </View>
  )
}
