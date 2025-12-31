import React, { useMemo, useState } from 'react'
import { View } from 'react-native'
import { FormProvider } from 'react-hook-form'
import { AppStackScreenProps } from '@/navigators'
import { TRANSACTION_TYPE } from '@/utils/Constants'
import NextMaterialButton from '../component/button/NextMaterialButton'
import SaveTransactionButton from '../component/button/SaveTransactionButton'
import CreateTransactionSectionList from '../component/transaction/CreateTransactionSectionList'
import ReduceStockBatchItem from '../component/transaction/ReduceStockBatchItem'
import TransactionBatchContainer from '../component/transaction/TransactionBatchContainer'
import { getTrxStockSection } from '../helpers/TransactionHelpers'
import useReduceStockTransactionForm from '../hooks/transactionCreate/useReduceStockTransactionForm'

interface Props extends AppStackScreenProps<'TransactionReduceStockBatch'> {}
function TransactionReduceStockBatchScreen({ route }: Props) {
  const { stock: stockMaterial } = route.params
  const {
    methods,
    isDisableNextButton,
    isNextMaterialExist,
    handleSubmit,
    navigateToNextMaterial,
  } = useReduceStockTransactionForm(stockMaterial)

  const formReduce = methods.watch()
  const reduceStockSections = useMemo(
    () => getTrxStockSection(formReduce),
    [formReduce]
  )

  const [selectedBatchCode, setSelectedBatchCode] = useState<string | null>(
    null
  )

  const toggleReduceStockBatchItem = (batchCode: string) => {
    setSelectedBatchCode(selectedBatchCode === batchCode ? null : batchCode)
  }

  const renderReduceStockBatchItem = ({ item, index, section }) => {
    const isSelected = selectedBatchCode === item.batch?.code
    return (
      <ReduceStockBatchItem
        testID={`reduceStockBatchItem-${item.batch?.code}`}
        isSelected={isSelected}
        batchType={section.fieldname}
        index={index}
        onToggleDetail={() => toggleReduceStockBatchItem(item.batch?.code)}
      />
    )
  }

  return (
    <FormProvider {...methods}>
      <TransactionBatchContainer key={TRANSACTION_TYPE.REDUCE_STOCK}>
        <CreateTransactionSectionList
          materialData={stockMaterial}
          sections={reduceStockSections}
          renderItem={renderReduceStockBatchItem}
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
    </FormProvider>
  )
}

export default TransactionReduceStockBatchScreen
