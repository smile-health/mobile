import React, { useState } from 'react'
import { View } from 'react-native'
import { Icons } from '@/assets/icons'
import HeaderMaterial from '@/components/header/HeaderMaterial'
import MaterialListHeader from '@/components/list/MaterialListHeader'
import { RefreshHomeAction } from '@/components/toolbar/actions/RefreshHomeAction'
import { useToolbar } from '@/components/toolbar/hooks/useToolbar'
import ScreenFooterActions from '@/components/view/ScreenFooterActions'
import { clearTransaction } from '@/services/features/transaction.slice'
import TransferStockMaterialList from './components/TransferStockMaterialList'
import { useTransferStockMaterial } from './hooks/useTransferStockMaterial'

export default function TransferStockMaterialScreen() {
  const {
    t,
    program,
    searchControl,
    materialList,
    title,
    transactions,
    page,
    programId,
    isLoadingMaterial,
    dispatch,
    handleLoadMoreList,
    handleRefreshList,
    handleSearch,
    handleSelectMaterial,
    navigateToReviewTransferStock,
  } = useTransferStockMaterial()

  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false)
  const shouldShowFooter = transactions.length > 0

  const openDeleteAllDialog = () => setShowDeleteAllDialog(true)
  const dismissDeleteAllDialog = () => setShowDeleteAllDialog(false)

  const handleDeleteTransferStock = () => {
    if (programId) {
      dispatch(clearTransaction({ programId }))
      dismissDeleteAllDialog()
    }
  }

  useToolbar({
    title,
    actions: <RefreshHomeAction onRefresh={handleRefreshList} />,
  })

  return (
    <View className='flex-1 bg-white'>
      <HeaderMaterial
        items={[
          {
            label: t('transfer_stock.destination_program'),
            value: program?.name,
          },
        ]}
      />
      <MaterialListHeader
        control={searchControl}
        itemCount={materialList.length}
        onSearch={handleSearch}
      />
      <TransferStockMaterialList
        transactions={transactions}
        materials={materialList}
        isLoading={isLoadingMaterial && page === 1}
        isLoadMore={isLoadingMaterial}
        onLoadMore={handleLoadMoreList}
        onSelectMaterial={handleSelectMaterial}
      />
      {shouldShowFooter && (
        <ScreenFooterActions
          primaryAction={{
            text: t('button.review'),
            onPress: navigateToReviewTransferStock,
            LeftIcon: Icons.IcArrowForward,
            testID: 'btn-review-transfer-stock',
          }}
          secondaryAction={{
            text: t('button.delete_all'),
            onPress: openDeleteAllDialog,
            LeftIcon: Icons.IcDelete,
            testID: 'btn-delete-all-transfer-stock',
          }}
          confirmationDialog={{
            title: t('dialog.delete_all_item'),
            message: t('dialog.delete_all'),
            isVisible: showDeleteAllDialog,
            onCancel: dismissDeleteAllDialog,
            onConfirm: handleDeleteTransferStock,
          }}
        />
      )}
    </View>
  )
}
