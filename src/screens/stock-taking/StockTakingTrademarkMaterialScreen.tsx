import React, { useCallback, useMemo } from 'react'
import { View } from 'react-native'
import { useForm } from 'react-hook-form'
import { useLanguage } from '@/i18n/useLanguage'
import StockTakingMaterialList from './components/StockTakingMaterialList'
import StockTakingMaterialListHeader from './components/StockTakingMaterialListHeader'
import useStockTakingTrademarkMaterial from './hooks/useStockTakingTrademarkMaterial'

export default function StockTakingTrademarkMaterialScreen() {
  const { t } = useLanguage()
  const { parentMaterial, handleSelectMaterial } =
    useStockTakingTrademarkMaterial()

  const { watch, control: searchControl } = useForm({
    defaultValues: { name: '' },
  })
  const search = watch('name')

  const materialList = useMemo(() => {
    if (!parentMaterial?.details) return []
    return parentMaterial.details?.filter((m) =>
      m.material?.name?.toLowerCase().includes(search.toLowerCase())
    )
  }, [parentMaterial?.details, search])

  const parentMaterialData = useMemo(() => {
    if (!parentMaterial) return

    return {
      name: parentMaterial.material.name,
      remainingQty: parentMaterial.aggregate?.total_qty ?? 0,
      isMandatory: !!parentMaterial.material.is_stock_opname_mandatory,
    }
  }, [parentMaterial])

  const renderHeader = useCallback(
    () => (
      <StockTakingMaterialListHeader
        title={t('label.trademark_material_list')}
        control={searchControl}
        itemCount={parentMaterial?.details.length ?? 0}
        parentMaterial={parentMaterialData}
      />
    ),
    [parentMaterial?.details.length, parentMaterialData, searchControl, t]
  )

  return (
    <View className='bg-white flex-1'>
      <StockTakingMaterialList
        materials={materialList}
        isLoading={false}
        showMandatoryLabel={false}
        onSelectMaterial={handleSelectMaterial}
        emptyMessage={t('empty_state.no_data_message')}
        ListHeaderComponent={renderHeader}
      />
    </View>
  )
}
