import React, { useCallback, useMemo, useState } from 'react'
import { FlatList, Text, View } from 'react-native'
import { Icons } from '@/assets/icons'
import Banner from '@/components/banner/Banner'
import { ConfirmationDialog } from '@/components/dialog/ConfirmationDialog'
import LoadingDialog from '@/components/LoadingDialog'
import ScreenFooterActions from '@/components/view/ScreenFooterActions'
import { AppStackScreenProps } from '@/navigators'
import AppStyles, { flexStyle } from '@/theme/AppStyles'
import { getTestID } from '@/utils/CommonUtils'
import ReviewStockTakingItem from './components/ReviewStockTakingItem'
import useReviewStockTaking from './hooks/useReviewStockTaking'

interface Props extends AppStackScreenProps<'ReviewStockTaking'> {}
export default function ReviewStockTakingScreen({
  route: { params },
  navigation,
}: Props) {
  const {
    t,
    detail,
    periodName,
    isLoading,
    reviewItems,
    handleSubmitStockTaking,
  } = useReviewStockTaking(params.data, params.createdAt)

  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false)
  const [showConfirmReplaceDialog, setShowConfirmReplaceDialog] =
    useState(false)

  const openDeleteAllDialog = () => {
    setShowDeleteAllDialog(true)
  }

  const dismissDeleteAllDialog = () => {
    setShowDeleteAllDialog(false)
  }

  const openConfirmReplaceDialog = () => {
    setShowConfirmReplaceDialog(true)
  }

  const dismissConfirmReplaceDialog = () => {
    setShowConfirmReplaceDialog(false)
  }

  const handleValidateSubmit = async () => {
    if (detail.lastStockOpname) {
      openConfirmReplaceDialog()
      return
    }
    await handleSubmitStockTaking()
  }

  const handleConfirmReplace = async () => {
    dismissConfirmReplaceDialog()
    await handleSubmitStockTaking()
  }

  const handleDeleteAll = () => {
    navigation.navigate('CreateStockTaking', { deleteAll: true })
  }

  const renderHeader = useCallback(() => {
    return (
      <View className='gap-y-2'>
        <View className='flex-row'>
          <Text className={AppStyles.textBold} style={flexStyle}>
            {t('stock_taking.review_title')}
          </Text>
          <Text className={AppStyles.labelRegular}>
            {t('label.period')}:{' '}
            <Text className={AppStyles.labelBold}>{periodName}</Text>
          </Text>
        </View>
        <Banner
          title={t('stock_taking.review_info')}
          testID='banner-review-stock-taking'
          containerClassName='mb-0'
        />
      </View>
    )
  }, [periodName, t])

  const renderItem = useCallback(({ item }) => {
    return (
      <ReviewStockTakingItem
        parentMaterialName={item.parentMaterialName}
        materialName={item.materialName}
        createdAt={item.createdAt}
        totalActualQty={item.totalActualQty}
        items={item.items}
      />
    )
  }, [])

  const flatListProps = useMemo(
    () => ({
      data: reviewItems,
      renderItem,
      ListHeaderComponent: renderHeader,
      showsVerticalScrollIndicator: false,
      contentContainerClassName: 'bg-lightBlueGray p-4 gap-y-2',
      keyExtractor: (item: any, index: number) =>
        item.materialId?.toString() || index.toString(),
    }),
    [reviewItems, renderItem, renderHeader]
  )

  return (
    <View className='flex-1'>
      <FlatList {...flatListProps} />
      <ScreenFooterActions
        primaryAction={{
          text: t('button.send'),
          onPress: handleValidateSubmit,
          LeftIcon: Icons.IcArrowForward,
          testID: 'btn-submit-stock-taking',
        }}
        secondaryAction={{
          text: t('button.delete_all'),
          onPress: openDeleteAllDialog,
          LeftIcon: Icons.IcDelete,
          testID: 'btn-delete-all-stock-taking',
        }}
        confirmationDialog={{
          title: t('dialog.delete_all_item'),
          message: t('dialog.delete_all'),
          isVisible: showDeleteAllDialog,
          onCancel: dismissDeleteAllDialog,
          onConfirm: handleDeleteAll,
        }}
      />
      <ConfirmationDialog
        modalVisible={showConfirmReplaceDialog}
        dismissDialog={dismissConfirmReplaceDialog}
        onCancel={dismissConfirmReplaceDialog}
        onConfirm={handleConfirmReplace}
        message={t('dialog.confirm_replace_stock_taking')}
        cancelText={t('button.cancel')}
        cancelProps={{
          textClassName: 'text-main',
          containerClassName: 'rounded border border-main px-3 py-2',
          ...getTestID('btn-cancel-replace-stock-taking'),
        }}
        confirmProps={{
          textClassName: 'text-white',
          containerClassName: 'rounded bg-main px-3 py-2',
          ...getTestID('btn-confirm-replace-stock-taking'),
        }}
      />
      <LoadingDialog
        modalVisible={isLoading}
        testID='Loadingdialog-submit-stock-taking'
      />
    </View>
  )
}
