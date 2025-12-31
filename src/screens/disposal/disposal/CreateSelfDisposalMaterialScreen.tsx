import React from 'react'
import { ScrollView, Text, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import { Icons } from '@/assets/icons'
import { Button } from '@/components/buttons'
import { ActivityHeader } from '@/components/header/ActivityHeader'
import DisposalHistorySection from '@/screens/disposal/components/DisposalHistorySection'
import MaterialBatchItem from '@/screens/disposal/components/DisposalMaterialBatchItem'
import DisposalMaterialSection from '@/screens/disposal/components/DisposalMaterialSection'
import useDisposalSelfCreate from '@/screens/disposal/hooks/useDisposalSelfCreate'
import colors from '@/theme/colors'
import { DISPOSAL_TYPE } from '../disposal-constant'

export default function CreateSelfDisposalMaterialScreen() {
  const { t } = useTranslation()
  const navigation = useNavigation()
  const {
    activity,
    material,
    materialDetail,
    expandedStockId,
    stocks,
    toggleExpand,
    getStockQuantities,
    canSaveMaterial,
    handleSaveMaterial,
  } = useDisposalSelfCreate()

  const isBatch = !!materialDetail?.material.is_managed_in_batch

  const handleReview = () => {
    handleSaveMaterial()
    navigation.goBack()
  }

  return (
    <View className='flex-1 bg-lightBlueGray'>
      <ActivityHeader name={activity.name} />
      <ScrollView className='flex-1'>
        {/* Material Section */}
        <DisposalMaterialSection material={material} />

        {/* Material Batch Section */}
        <View className='mb-4 bg-white p-4'>
          {isBatch && (
            <Text className='text-sm font-bold mb-2 text-warmGrey'>
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
              onToggleExpand={() => toggleExpand(stock.id)}
              quantities={getStockQuantities(stock.id)}
              type={DISPOSAL_TYPE.SELF}
            />
          ))}
        </View>

        {/* Disposal History Section */}
        <DisposalHistorySection
          totalDisposalShippedQty={materialDetail?.disposal_shipped_qty ?? 0}
          totalSelfDisposalQty={materialDetail?.disposal_qty ?? 0}
        />
      </ScrollView>

      <View className='p-4 bg-white border-t border-paleGreyTwo'>
        <Button
          text={t('button.save')}
          onPress={handleReview}
          containerClassName='gap-x-2'
          preset='filled'
          leftIconColor={colors.mainText()}
          LeftIcon={Icons.IcCheck}
          disabled={!canSaveMaterial}
        />
      </View>
    </View>
  )
}
