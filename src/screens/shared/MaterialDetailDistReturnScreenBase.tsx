import React from 'react'
import { KeyboardAvoidingView, Platform, View } from 'react-native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { TFunction } from 'i18next'
import { useToolbar } from '@/components/toolbar/hooks/useToolbar'
import { AppStackParamList } from '@/navigators'
import { useAppSelector, vendorState } from '@/services/store'
import useProgramId from '@/utils/hooks/useProgramId'
import { MaterialBatchList } from './component/MaterialBatchList'
import { MaterialHeader } from './component/MaterialHeader'
import { MaterialInfo } from './component/MaterialInfo'
import { useMaterialDetailDistReturn } from './hooks/useMaterialDetailDistReturn'
import { useMaterialDetailForm } from './hooks/useMaterialDetailForm'
import { useStocksManagement } from './hooks/useStocksManagement'
import { MaterialData, DispatchActionData } from './types/MaterialDetail'
import { OrderType } from '../order/types/order'

interface Props<T extends keyof AppStackParamList> {
  navigation: NativeStackNavigationProp<AppStackParamList, T>
  data: MaterialData
  activityName?: string
  dispatchAction: (payload: DispatchActionData) => void
  title: string
  orderType: OrderType
  t: TFunction
}

export const MaterialDetailDistReturnScreenBase = <
  T extends keyof AppStackParamList,
>({
  navigation,
  data,
  activityName,
  dispatchAction,
  title,
  orderType,
  t,
}: Props<T>) => {
  const { vendor } = useAppSelector(vendorState)

  const programId = useProgramId()

  const { qtyMaterial, currentMinMax, activeActivity } = useMaterialDetailForm(
    data,
    navigation,
    dispatchAction,
    orderType
  )

  const { addedStocks, baseSectionData } = useStocksManagement(data)

  const {
    methods,
    selectedStockId,
    handleToggleBatch,
    sectionData,
    handleSubmit,
    isAnyQtyExceedStock,
    stockOtherActivity,
    handleSelectOtherActivtyStock,
    isOpenActivityBottomSheet,
    setIsOpenActivityBottomSheet,
  } = useMaterialDetailDistReturn(
    data,
    data.consumption_unit_per_distribution_unit,
    addedStocks,
    baseSectionData,
    navigation
  )

  useToolbar({ title })

  const renderHeader = () => (
    <MaterialInfo
      data={data}
      qtyMaterial={qtyMaterial}
      currentMinMax={currentMinMax}
      showStockQty
    />
  )

  const dataItems = [
    {
      label: t('label.activity'),
      value: activityName ?? activeActivity?.name,
    },
    {
      label: t('label.customer'),
      value: vendor?.name,
    },
  ]

  const isBatch = data.is_managed_in_batch
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className='flex-1'
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}>
      <View className='flex-1 bg-paleGrey'>
        <MaterialHeader
          activityName={activityName}
          activeActivity={activeActivity?.[programId]}
          vendorName={vendor?.name}
          items={dataItems}
        />
        <MaterialBatchList
          methods={methods}
          isBatch={isBatch}
          selectedStockId={selectedStockId}
          handleToggleBatch={handleToggleBatch}
          enrichedStocks={stockOtherActivity}
          sectionData={sectionData}
          isOpenSheet={isOpenActivityBottomSheet}
          openSheet={() => setIsOpenActivityBottomSheet(true)}
          closeSheet={() => setIsOpenActivityBottomSheet(false)}
          handleSubmit={handleSubmit}
          onSelectActivity={handleSelectOtherActivtyStock}
          activeActivityName={activeActivity?.name}
          renderHeader={renderHeader}
          isAnyQtyExceedStock={isAnyQtyExceedStock}
        />
      </View>
    </KeyboardAvoidingView>
  )
}
