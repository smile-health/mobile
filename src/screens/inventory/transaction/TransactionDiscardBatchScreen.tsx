import React, { useMemo, useState } from 'react'
import { View } from 'react-native'
import { FormProvider } from 'react-hook-form'
import { AppStackScreenProps } from '@/navigators'
import { TRANSACTION_TYPE } from '@/utils/Constants'
import SaveTransactionButton from '../component/button/SaveTransactionButton'
import CreateTransactionSectionList from '../component/transaction/CreateTransactionSectionList'
import DiscardBatchItem from '../component/transaction/DiscardBatchItem'
import TransactionBatchContainer from '../component/transaction/TransactionBatchContainer'
import { getTrxStockSection } from '../helpers/TransactionHelpers'
import useDiscardTransactionForm from '../hooks/transactionCreate/useDiscardTransactionForm'

interface Props extends AppStackScreenProps<'TransactionDiscardBatch'> {}
function TransactionDiscardBatchScreen({ route }: Props) {
  const { stock: stockMaterial } = route.params
  const { methods, handleSubmit } = useDiscardTransactionForm(stockMaterial)

  const formDiscard = methods.watch()
  const discardSections = useMemo(
    () => getTrxStockSection(formDiscard),
    [formDiscard]
  )
  const [selectedBatchCode, setSelectedBatchCode] = useState<string | null>(
    null
  )

  const toggleDiscardBatchItem = (batchCode: string) => {
    setSelectedBatchCode(selectedBatchCode === batchCode ? null : batchCode)
  }

  const renderDiscardBatchItem = ({ item, index, section }) => {
    const isSelected = selectedBatchCode === item.batch?.code
    return (
      <DiscardBatchItem
        testID={`discardBatchItem-${item.batch?.code}`}
        index={index}
        isSelected={isSelected}
        batchType={section.fieldname}
        onToggleDetail={() => toggleDiscardBatchItem(item.batch?.code)}
      />
    )
  }

  return (
    <FormProvider {...methods}>
      <TransactionBatchContainer key={TRANSACTION_TYPE.DISCARDS}>
        <CreateTransactionSectionList
          materialData={stockMaterial}
          sections={discardSections}
          renderItem={renderDiscardBatchItem}
        />
        <View className='flex-row px-4 py-5  border-whiteTwo border-t gap-x-2'>
          <SaveTransactionButton onSubmit={handleSubmit} />
        </View>
      </TransactionBatchContainer>
    </FormProvider>
  )
}

export default TransactionDiscardBatchScreen
