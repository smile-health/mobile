import React, { useCallback, useState } from 'react'
import { FlatList, KeyboardAvoidingView, Platform, View } from 'react-native'
import { FormProvider } from 'react-hook-form'
import EntityActivityHeader from '@/components/header/EntityActivityHeader'
import { StockDetail } from '@/models/shared/Material'
import { AppStackScreenProps } from '@/navigators'
import { flexStyle } from '@/theme/AppStyles'
import NextMaterialButton from '../component/button/NextMaterialButton'
import SaveTransactionButton from '../component/button/SaveTransactionButton'
import StockActivityButton from '../component/button/StockActivityButton'
import MaterialCard from '../component/MaterialCard'
import ConsumptionNonBatchItem from '../component/transaction/ConsumptionNonBatchItem'
import SelectActivityStockBottomSheet from '../component/transaction/SelectActivityStockBottomSheet'
import { setAdditionalFormValue } from '../helpers/ConsumptionHelpers'
import { getMaterialCardProps } from '../helpers/TransactionHelpers'
import useConsumptionTransactionForm from '../hooks/transactionCreate/useConsumptionTransactionForm'
import useTransactionStockDetails from '../hooks/useTransactionStockDetails'

interface Props extends AppStackScreenProps<'TransactionConsumption'> {}
function TransactionConsumptionScreen({ route }: Props) {
  const { stock: stockMaterial } = route.params

  const { activityStocks, allStockData, onSelectActivityStock } =
    useTransactionStockDetails()

  const {
    methods,
    handleSubmit,
    isDisableNextButton,
    navigateToNextMaterial,
    isNextMaterialExist,
    transactions,
    activity,
    customer,
    isOpenVial,
  } = useConsumptionTransactionForm(stockMaterial, allStockData)

  const { activeBatch } = methods.watch()
  const headerDataProps = getMaterialCardProps(stockMaterial)

  const [isOpenActivityBottomSheet, setIsOpenActivityBottomSheet] =
    useState(false)

  const closeActivityStockBottomSheet = () => {
    setIsOpenActivityBottomSheet(false)
  }

  const openActivityStockBottomSheet = () => {
    setIsOpenActivityBottomSheet(true)
  }

  const handleSelectActivityStock = (item: StockDetail) => {
    const currentStock = [...activeBatch]
    setAdditionalFormValue(
      currentStock,
      item.stocks,
      transactions,
      stockMaterial,
      isOpenVial,
      (consumptionFormValues) => methods.reset(consumptionFormValues)
    )
    onSelectActivityStock(item)
    closeActivityStockBottomSheet()
  }

  const renderHeader = () => <MaterialCard {...headerDataProps} />

  const renderItem = useCallback(
    ({ index }) => (
      <ConsumptionNonBatchItem
        index={index}
        testID={`form-consumption-${index}`}
      />
    ),
    []
  )

  const renderFooter = () => (
    <StockActivityButton onPress={openActivityStockBottomSheet} />
  )

  return (
    <FormProvider {...methods}>
      <View className='bg-white flex-1'>
        <EntityActivityHeader
          activityName={activity.name}
          entityName={customer?.name}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={flexStyle}>
          <FlatList
            data={activeBatch}
            ListHeaderComponent={renderHeader}
            renderItem={renderItem}
            ListFooterComponent={renderFooter}
            ListHeaderComponentClassName='mb-4'
            contentContainerClassName='pb-14'
            keyboardShouldPersistTaps='handled'
            keyboardDismissMode='none'
            removeClippedSubviews={false}
          />
          <View className='flex-row px-4 py-5  border-quillGrey border-t gap-x-2'>
            {isNextMaterialExist && (
              <NextMaterialButton
                onPress={navigateToNextMaterial}
                disabled={isDisableNextButton}
              />
            )}
            <SaveTransactionButton onSubmit={handleSubmit} />
          </View>
        </KeyboardAvoidingView>
        <SelectActivityStockBottomSheet
          activityStocks={activityStocks}
          isOpen={isOpenActivityBottomSheet}
          toggleSheet={closeActivityStockBottomSheet}
          onSelectActivity={handleSelectActivityStock}
        />
      </View>
    </FormProvider>
  )
}

export default TransactionConsumptionScreen
