import React from 'react'
import { ScrollView, Text, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Icons } from '@/assets/icons'
import { Button } from '@/components/buttons'
import DisposalHistorySection from '@/screens/disposal/components/DisposalHistorySection'
import MaterialBatchItem from '@/screens/disposal/components/DisposalMaterialBatchItem'
import DisposalMaterialSection from '@/screens/disposal/components/DisposalMaterialSection'
import AppStyles from '@/theme/AppStyles'
import colors from '@/theme/colors'
import { cn } from '@/theme/theme-config'
import { getTestID } from '@/utils/CommonUtils'
import DisposalShipmentHeader from '../components/DisposalShipmentHeader'
import { DISPOSAL_TYPE } from '../disposal-constant'
import useDisposalShipmentCreate from '../hooks/useDisposalShipmentCreate'

export default function CreateDisposalShipmentMaterialScreen() {
  const { t } = useTranslation()
  const {
    activity,
    material,
    expandedStockId,
    stocks,
    materialDetail,
    canSaveMaterial,
    isBatch,
    toggleExpandStockItem,
    getStockQuantities,
    handleSaveDisposalMaterial,
  } = useDisposalShipmentCreate()

  return (
    <View className='flex-1 bg-lightBlueGray'>
      <DisposalShipmentHeader t={t} />
      <ScrollView contentContainerClassName='flex-grow'>
        {/* Material Header Section */}
        <DisposalMaterialSection material={material} />

        {/* Material Batch Section */}
        <View className='bg-white mb-4 p-4'>
          {isBatch && (
            <Text className={cn(AppStyles.textBold, 'mb-2 text-warmGrey')}>
              {t('disposal.material_batch')}
            </Text>
          )}
          {/* Stocks Section */}
          {stocks.map((stock) => (
            <MaterialBatchItem
              key={stock.id}
              stock={stock}
              activity={activity.name}
              expanded={expandedStockId === stock.id}
              type={DISPOSAL_TYPE.SHIPMENT}
              onToggleExpand={() => toggleExpandStockItem(stock.id)}
              quantities={getStockQuantities(stock.id)}
            />
          ))}
        </View>
        {/* Disposal History Section */}
        <DisposalHistorySection
          totalSelfDisposalQty={materialDetail?.disposal_qty ?? 0}
          totalDisposalShippedQty={materialDetail?.disposal_shipped_qty ?? 0}
        />
      </ScrollView>
      <View className='p-4 bg-white border-t border-quillGrey'>
        <Button
          preset='filled'
          text={t('button.save')}
          containerClassName='gap-x-2'
          onPress={handleSaveDisposalMaterial}
          LeftIcon={Icons.IcCheck}
          leftIconColor={colors.mainText()}
          disabled={!canSaveMaterial}
          {...getTestID('btn-save-disposal-shipment-material')}
        />
      </View>
    </View>
  )
}
