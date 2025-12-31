import React, { useEffect, useMemo, useState } from 'react'
import { View } from 'react-native'
import { FormProvider } from 'react-hook-form'
import { StockDetail } from '@/models/shared/Material'
import { AppStackScreenProps } from '@/navigators'
import { useGetRabiesSequenceQuery } from '@/services/apis/vaccine-sequence.api'
import { TRANSACTION_TYPE } from '@/utils/Constants'
import NextMaterialButton from '../component/button/NextMaterialButton'
import SaveTransactionButton from '../component/button/SaveTransactionButton'
import StockActivityButton from '../component/button/StockActivityButton'
import ConsumptionBatchItem from '../component/transaction/ConsumptionBatchItem'
import CreateTransactionSectionList from '../component/transaction/CreateTransactionSectionList'
import SelectActivityStockBottomSheet from '../component/transaction/SelectActivityStockBottomSheet'
import TransactionBatchContainer from '../component/transaction/TransactionBatchContainer'
import { setAdditionalFormValue } from '../helpers/ConsumptionHelpers'
import {
  getTrxStockSection,
  updatePartialValues,
} from '../helpers/TransactionHelpers'
import useConsumptionTransactionForm from '../hooks/transactionCreate/useConsumptionTransactionForm'
import useTransactionStockDetails from '../hooks/useTransactionStockDetails'

interface Props extends AppStackScreenProps<'TransactionConsumptionBatch'> {}
function TransactionConsumptionBatchScreen({ route }: Props) {
  const { stock: stockMaterial, formUpdate } = route.params
  const isPatientNeeded = !!stockMaterial.protocol.is_patient_needed

  useGetRabiesSequenceQuery(undefined, { skip: !isPatientNeeded })

  const { activityStocks, allStockData, onSelectActivityStock } =
    useTransactionStockDetails()

  const {
    methods,
    isDisableNextButton,
    isNextMaterialExist,
    transactions,
    isOpenVial,
    handleSubmit,
    navigateToNextMaterial,
  } = useConsumptionTransactionForm(stockMaterial, allStockData)

  const { watch, setValue } = methods

  const formConsumption = watch()
  const consumptionSections = useMemo(
    () => getTrxStockSection(formConsumption),
    [formConsumption]
  )

  const [selectedBatchCode, setSelectedBatchCode] = useState<string | null>(
    null
  )
  const [isOpenActivityBottomSheet, setIsOpenActivityBottomSheet] =
    useState(false)

  const toggleConsumptionBatchItem = (batchCode: string) => {
    if (isPatientNeeded) return
    setSelectedBatchCode(selectedBatchCode === batchCode ? null : batchCode)
  }

  const closeActivityStockBottomSheet = () => {
    setIsOpenActivityBottomSheet(false)
  }

  const openActivityStockBottomSheet = () => {
    setIsOpenActivityBottomSheet(true)
  }

  const handleSelectActivityStock = (item: StockDetail) => {
    const currentStock = [
      ...formConsumption.activeBatch,
      ...formConsumption.expiredBatch,
    ]
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

  const renderFooter = () => (
    <StockActivityButton onPress={openActivityStockBottomSheet} />
  )

  const renderConsumptionBatchItem = ({ item, index, section }) => {
    const isSelected = selectedBatchCode === item.batch?.code
    return (
      <ConsumptionBatchItem
        testID={`consumptionBatchItem-${item.batch?.code}`}
        index={index}
        isSelected={isSelected}
        isPatientNeeded={isPatientNeeded}
        batchType={section.fieldname}
        onToggleDetail={() => toggleConsumptionBatchItem(item.batch?.code)}
      />
    )
  }

  useEffect(() => {
    if (formUpdate) {
      updatePartialValues(formUpdate.path, setValue, formUpdate.values)
    }
  }, [formUpdate, setValue])

  return (
    <FormProvider {...methods}>
      <TransactionBatchContainer key={TRANSACTION_TYPE.CONSUMPTION}>
        <CreateTransactionSectionList
          materialData={stockMaterial}
          sections={consumptionSections}
          renderItem={renderConsumptionBatchItem}
          ListFooterComponent={renderFooter}
        />
        <View className='flex-row px-4 py-5  border-whiteTwo border-t gap-x-2'>
          {isNextMaterialExist && (
            <NextMaterialButton
              onPress={navigateToNextMaterial}
              disabled={isDisableNextButton}
            />
          )}
          <SaveTransactionButton onSubmit={handleSubmit} />
        </View>
      </TransactionBatchContainer>
      <SelectActivityStockBottomSheet
        activityStocks={activityStocks}
        isOpen={isOpenActivityBottomSheet}
        toggleSheet={closeActivityStockBottomSheet}
        onSelectActivity={handleSelectActivityStock}
      />
    </FormProvider>
  )
}

export default TransactionConsumptionBatchScreen
