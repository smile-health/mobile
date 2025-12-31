import React, { useCallback } from 'react'
import { SectionList, Text, View } from 'react-native'
import { ParseKeys } from 'i18next'
import { FormProvider } from 'react-hook-form'
import { useLanguage } from '@/i18n/useLanguage'
import { StockDetail } from '@/models/shared/Material'
import SelectActivityStockBottomSheet from '@/screens/inventory/component/transaction/SelectActivityStockBottomSheet'
import BatchItemRenderer from '@/screens/order/component/BatchItemRenderer'
import OrderNonBatchItem from '@/screens/order/component/OrderNonBatchItem'
import { StockData } from '@/screens/order/types/order'
import { ordersState, useAppSelector } from '@/services/store'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import { OrderActions } from './OrderActions'
import StockActivityButton from '../../inventory/component/button/StockActivityButton'
import { StockSection } from '../types/MaterialDetail'
import type { UseMaterialDetailDistReturnResult } from '@/screens/order/hooks/useMaterialDetailDistReturn'

interface MaterialBatchListProps
  extends Pick<
    UseMaterialDetailDistReturnResult,
    | 'methods'
    | 'selectedStockId'
    | 'enrichedStocks'
    | 'sectionData'
    | 'handleToggleBatch'
    | 'isOpenSheet'
    | 'openSheet'
    | 'closeSheet'
    | 'handleSubmit'
    | 'isBatch'
    | 'isAnyQtyExceedStock'
  > {
  activeActivityName?: string
  onSelectActivity: (item: StockDetail) => void
  renderHeader: () => React.ReactElement
}

export function MaterialBatchList({
  methods,
  selectedStockId,
  handleToggleBatch,
  enrichedStocks,
  sectionData,
  isOpenSheet,
  openSheet,
  closeSheet,
  handleSubmit,
  activeActivityName,
  onSelectActivity,
  renderHeader,
  isBatch,
  isAnyQtyExceedStock,
}: Readonly<MaterialBatchListProps>) {
  const {
    watch,
    formState: { errors },
  } = methods

  const { t } = useLanguage()

  const { orderMaterial } = useAppSelector(ordersState)
  const isTemperatureSensitive = orderMaterial.is_temperature_sensitive

  const renderSectionHeader = useCallback(
    ({ section }: { section: StockSection }) => {
      if (!section.title || section.data.length === 0) return null
      return (
        <Text className={cn(AppStyles.labelBold, 'text-sm m-4 mb-2')}>
          {t(section.title as ParseKeys)}
        </Text>
      )
    },
    [t]
  )

  const renderItem = useCallback(
    ({ item }: { item: StockData }) =>
      isBatch === 1 ? (
        <BatchItemRenderer
          item={item}
          methods={methods}
          isTemperatureSensitive={isTemperatureSensitive}
          errors={errors}
          watch={watch}
          t={t}
          activeActivityName={activeActivityName}
          selectedStockId={selectedStockId}
          handleToggleBatch={handleToggleBatch}
        />
      ) : (
        <OrderNonBatchItem
          item={item}
          methods={methods}
          errors={errors}
          t={t}
        />
      ),
    [
      isBatch,
      isTemperatureSensitive,
      methods,
      errors,
      watch,
      t,
      activeActivityName,
      selectedStockId,
      handleToggleBatch,
    ]
  )

  return (
    <FormProvider {...methods}>
      <View className='flex-1'>
        <SectionList
          stickySectionHeadersEnabled={false}
          contentContainerClassName='pb-6 bg-white'
          sections={sectionData}
          keyExtractor={(item, i) => item.stock_id.toString() + i}
          renderSectionHeader={renderSectionHeader}
          renderItem={renderItem}
          ListHeaderComponent={renderHeader}
          ListFooterComponent={<StockActivityButton onPress={openSheet} />}
        />
        <OrderActions
          isSaveDisabled={isAnyQtyExceedStock}
          onPress={handleSubmit}
        />
        <SelectActivityStockBottomSheet
          activityStocks={enrichedStocks}
          isOpen={isOpenSheet}
          toggleSheet={closeSheet}
          onSelectActivity={onSelectActivity}
        />
      </View>
    </FormProvider>
  )
}
