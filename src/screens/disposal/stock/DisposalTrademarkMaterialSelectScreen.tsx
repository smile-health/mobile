import React from 'react'
import { Text, View } from 'react-native'
import { ActivityHeader } from '@/components/header/ActivityHeader'
import MaterialItem, { MaterialItemProps } from '@/components/list/MaterialItem'
import { useLanguage } from '@/i18n/useLanguage'
import { DisposalStockSelectedItem } from '@/models/disposal/DisposalStock'
import AppStyles from '@/theme/AppStyles'
import { MATERIAL_LIST_TYPE } from '@/utils/Constants'
import DisposalMaterialList from '../component/DisposalMaterialList'
import useDisposalTrademarkMaterialStock from '../hooks/useDisposalTrademarkMaterialStock'

const getMaterialHeaderProps = (stock: DisposalStockSelectedItem | null) => {
  const { updatedAt = '' } = stock || {}

  const max = 0 // DisposalStockItem does not have min/max directly, so set to 0
  const qty = stock?.totalStock
  const min = 0 // DisposalStockItem does not have min/max directly, so set to 0

  return {
    name: stock?.name ?? '',
    updatedAt: updatedAt,
    qty: Number(qty),
    min,
    max,
  }
}

export default function DisposalTrademarkMaterialSelectScreen() {
  const { stockActivity, selectedStock, onSelectTrademarkMaterial } =
    useDisposalTrademarkMaterialStock()

  const { t } = useLanguage()

  const materialHeaderProps = getMaterialHeaderProps(selectedStock)

  return (
    <View className='flex-1 bg-white'>
      <ActivityHeader name={stockActivity?.name} />
      <ActiveMaterialHeader {...materialHeaderProps} />
      <DisposalMaterialList
        type={MATERIAL_LIST_TYPE.VIEW_DISPOSAL_TRADEMARK_STOCK}
        title={t('label.trademark_material_list')}
        data={selectedStock?.details ?? []}
        onPressMaterial={onSelectTrademarkMaterial}
      />
    </View>
  )
}

function ActiveMaterialHeader(props: Readonly<MaterialItemProps>) {
  const { t } = useLanguage()
  return (
    <View className='p-4 gap-y-1 bg-lightGrey'>
      <Text className={AppStyles.textBold}>
        {t('label.active_ingredient_material')}
      </Text>
      <MaterialItem
        {...props}
        type={MATERIAL_LIST_TYPE.VIEW_DISPOSAL_TRADEMARK_STOCK}
        withUpdateLabel
      />
    </View>
  )
}
