import React, { useCallback } from 'react'
import { View } from 'react-native'
import { FlatList } from 'react-native-gesture-handler'
import { ConfirmationDialog } from '@/components/dialog/ConfirmationDialog'
import { SearchField } from '@/components/forms'
import LoadingDialog from '@/components/LoadingDialog'
import { RefreshHomeAction } from '@/components/toolbar/actions/RefreshHomeAction'
import { useToolbar } from '@/components/toolbar/hooks/useToolbar'
import TransferStockProgramHeader from './components/TransferStockProgramHeader'
import TransferStockProgramItem from './components/TransferStockProgramItem'
import useTransferStockProgram from './hooks/useTransferStockProgram'

export default function TransferStockProgramScreen() {
  const {
    t,
    title,
    control,
    draftProgram,
    programList,
    shouldShowLoading,
    isOpenModalExistTrx,
    closeModalExistTrx,
    handleSelectProgram,
    handleRefreshList,
  } = useTransferStockProgram()

  const renderProgramItem = useCallback(
    ({ item }) => {
      const showFlag = item.id === draftProgram?.id
      return (
        <TransferStockProgramItem
          showFlag={showFlag}
          item={item}
          onPress={handleSelectProgram}
        />
      )
    },
    [draftProgram?.id, handleSelectProgram]
  )

  const renderProgramListHeader = useCallback(() => {
    return <TransferStockProgramHeader itemCount={programList.length} />
  }, [programList.length])

  useToolbar({
    title,
    actions: <RefreshHomeAction onRefresh={handleRefreshList} />,
  })

  return (
    <View className='flex-1 bg-white'>
      <SearchField
        testID='search-field-program-name'
        control={control}
        name='name'
        placeholder={t('transfer_stock.search_program')}
        containerClassName='bg-white px-4 py-2 border-b border-quillGrey'
      />
      <FlatList
        data={programList}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderProgramItem}
        ListHeaderComponent={renderProgramListHeader}
        contentContainerClassName='p-4'
      />
      <ConfirmationDialog
        modalVisible={isOpenModalExistTrx}
        dismissDialog={closeModalExistTrx}
        title={t('dialog.information')}
        message={t('dialog.have_transaction_draft')}
        cancelText={t('button.ok')}
        onCancel={closeModalExistTrx}
      />
      <LoadingDialog
        testID='loadingdialog-transfer-stock-program'
        modalVisible={shouldShowLoading}
      />
    </View>
  )
}
