import React, { useEffect, useMemo, useState } from 'react'
import { View } from 'react-native'
import { FormProvider } from 'react-hook-form'
import { Icons } from '@/assets/icons'
import { Button } from '@/components/buttons'
import { useLanguage } from '@/i18n/useLanguage'
import { CreateTransactionStock } from '@/models/transaction/TransactionCreate'
import { AppStackScreenProps } from '@/navigators'
import colors from '@/theme/colors'
import { getTestID } from '@/utils/CommonUtils'
import { TRANSACTION_TYPE } from '@/utils/Constants'
import SaveTransactionButton from '../component/button/SaveTransactionButton'
import AddStockBatchItem from '../component/transaction/AddStockBatchItem'
import CreateTransactionSectionList from '../component/transaction/CreateTransactionSectionList'
import TransactionBatchContainer from '../component/transaction/TransactionBatchContainer'
import {
  getTrxStockSection,
  updatePartialValues,
} from '../helpers/TransactionHelpers'
import useAddStockTransactionForm from '../hooks/transactionCreate/useAddStockTransactionForm'

interface Props extends AppStackScreenProps<'TransactionAddStockBatch'> {}
function TransactionAddStockBatchScreen({ route, navigation }: Props) {
  const { stock: stockMaterial, formUpdate } = route.params
  const { methods, handleSubmit } = useAddStockTransactionForm(stockMaterial)
  const { watch, setValue } = methods
  const formAdd = watch()
  const addStockSections = useMemo(() => getTrxStockSection(formAdd), [formAdd])

  const { t } = useLanguage()
  const [selectedBatchCode, setSelectedBatchCode] = useState<string | null>(
    null
  )

  const handleAddBatch = () => {
    navigation.navigate('AddNewBatch', {
      batchList: [...formAdd.activeBatch, ...formAdd.expiredBatch],
    })
  }

  const toggleAddStockBatchItem = (batchCode: string) => {
    setSelectedBatchCode(selectedBatchCode === batchCode ? null : batchCode)
  }

  const renderAddStockBatchItem = ({ item, index, section }) => {
    const isSelected = selectedBatchCode === item.batch?.code
    return (
      <AddStockBatchItem
        testID={`addStockBatchItem-${item.batch?.code}`}
        index={index}
        isSelected={isSelected}
        batchType={section.fieldname}
        onToggleDetail={() => toggleAddStockBatchItem(item.batch?.code)}
      />
    )
  }

  useEffect(() => {
    if (formUpdate) {
      if (formUpdate.isNewBatch) {
        const currentValues = methods.getValues(
          formUpdate.path
        ) as CreateTransactionStock[]
        const newBatch = formUpdate.values as CreateTransactionStock

        methods.setValue(formUpdate.path, [...currentValues, newBatch])
      } else {
        updatePartialValues(formUpdate.path, setValue, formUpdate.values)
      }
    }
  }, [formUpdate, setValue, methods])

  return (
    <FormProvider {...methods}>
      <TransactionBatchContainer key={TRANSACTION_TYPE.ADD_STOCK}>
        <CreateTransactionSectionList
          materialData={stockMaterial}
          sections={addStockSections}
          renderItem={renderAddStockBatchItem}
        />
        <View className='flex-row px-4 py-5  border-whiteTwo border-t gap-x-2'>
          <Button
            preset='outlined-primary'
            containerClassName='flex-1 gap-x-2'
            text={t('button.new_batch')}
            LeftIcon={Icons.IcAdd}
            leftIconColor={colors.main()}
            leftIconSize={20}
            onPress={handleAddBatch}
            {...getTestID('btn-add-batch')}
          />
          <SaveTransactionButton onSubmit={handleSubmit} />
        </View>
      </TransactionBatchContainer>
    </FormProvider>
  )
}

export default TransactionAddStockBatchScreen
