import React, { useCallback } from 'react'
import { View, FlatList } from 'react-native'
import { Icons } from '@/assets/icons'
import HeaderMaterial from '@/components/header/HeaderMaterial'
import ListTitle from '@/components/list/ListTitle'
import LoadingDialog from '@/components/LoadingDialog'
import ScreenFooterActions from '@/components/view/ScreenFooterActions'
import ReviewTransferStockMaterialItem from './components/ReviewTransferStockMaterialItem'
import useReviewTransferStock from './hooks/useReviewTransferStock'

export default function ReviewTransferStockScreen() {
  const {
    t,
    headerLabel,
    program,
    shouldShowLoading,
    showDeleteAllDialog,
    reviewItems,
    dismissDeleteAllDialog,
    openDeleteAllDialog,
    handleClearTransferStock,
    handleDeleteItem,
    handleSubmitTransferStock,
  } = useReviewTransferStock()

  const renderHeader = useCallback(() => {
    return (
      <ListTitle
        title={t('transaction.review_and_submit_transaction')}
        itemCount={reviewItems.length}
        className='p-0 mb-4'
      />
    )
  }, [t, reviewItems.length])

  const renderItem = useCallback(
    ({ item }) => {
      return (
        <ReviewTransferStockMaterialItem
          item={item}
          onDelete={handleDeleteItem}
        />
      )
    },
    [handleDeleteItem]
  )

  return (
    <View className='flex-1 flex-col bg-lightBlueGray'>
      <HeaderMaterial items={[{ label: headerLabel, value: program?.name }]} />
      <FlatList
        data={reviewItems}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        showsVerticalScrollIndicator={false}
        contentContainerClassName='p-4'
      />
      <ScreenFooterActions
        primaryAction={{
          text: t('button.send'),
          LeftIcon: Icons.IcArrowForward,
          onPress: handleSubmitTransferStock,
          testID: 'btn-submit-transfer-stock',
        }}
        secondaryAction={{
          text: t('button.delete_all'),
          LeftIcon: Icons.IcDelete,
          onPress: openDeleteAllDialog,
          testID: 'btn-delete-all-transfer-stock',
        }}
        confirmationDialog={{
          title: t('dialog.delete_all_item'),
          message: t('dialog.delete_all'),
          isVisible: showDeleteAllDialog,
          onCancel: dismissDeleteAllDialog,
          onConfirm: handleClearTransferStock,
        }}
      />
      <LoadingDialog
        modalVisible={shouldShowLoading}
        testID='Loadingdialog-submit-transfer-stock'
      />
    </View>
  )
}
