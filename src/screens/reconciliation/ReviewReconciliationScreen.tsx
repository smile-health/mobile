import React, { useCallback, useMemo, useState } from 'react'
import { View, Text, FlatList } from 'react-native'
import { Icons } from '@/assets/icons'
import Banner from '@/components/banner/Banner'
import { ActivityHeader } from '@/components/header/ActivityHeader'
import LoadingDialog from '@/components/LoadingDialog'
import ScreenFooterActions from '@/components/view/ScreenFooterActions'
import { AppStackScreenProps } from '@/navigators'
import AppStyles from '@/theme/AppStyles'
import ReviewReconciliationItem from './components/ReviewReconciliationItem'
import useReviewReconciliation from './hooks/useReviewReconciliation'

interface Props extends AppStackScreenProps<'ReviewReconciliation'> {}
export default function ReviewReconciliationScreen({ route }: Props) {
  const {
    t,
    activityName,
    isLoading,
    reviewItems,
    handleSubmitReconciliation,
    handleDeleteAll,
  } = useReviewReconciliation(route.params)

  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false)

  const openDeleteAllDialog = () => {
    setShowDeleteAllDialog(true)
  }

  const dismissDeleteAllDialog = () => {
    setShowDeleteAllDialog(false)
  }

  const renderHeader = useCallback(() => {
    return (
      <View className='gap-y-2'>
        <Text className={AppStyles.textBold}>
          {t('reconciliation.review_title')}
        </Text>
        <Banner
          title={t('reconciliation.review_info')}
          testID='banner-review-reconciliation'
          containerClassName='mb-0'
        />
      </View>
    )
  }, [t])

  const renderItem = useCallback(({ item }) => {
    return (
      <ReviewReconciliationItem
        materialName={item.materialName}
        createdAt={item.createdAt}
        periodText={item.period}
        items={item.items}
      />
    )
  }, [])

  const flatListProps = useMemo(
    () => ({
      data: reviewItems,
      renderItem,
      ListHeaderComponent: renderHeader,
      contentContainerClassName: 'bg-lightBlueGray p-4 gap-y-2',
      showsVerticalScrollIndicator: false,
      keyExtractor: (index) => index.toString(),
    }),
    [reviewItems, renderItem, renderHeader]
  )

  return (
    <View className='flex-1'>
      <ActivityHeader name={activityName} />
      <FlatList {...flatListProps} />
      <ScreenFooterActions
        primaryAction={{
          text: t('button.send'),
          onPress: handleSubmitReconciliation,
          LeftIcon: Icons.IcArrowForward,
          testID: 'btn-submit-reconciliation',
        }}
        secondaryAction={{
          text: t('button.delete_all'),
          onPress: openDeleteAllDialog,
          LeftIcon: Icons.IcDelete,
          testID: 'btn-delete-all-reconciliation',
        }}
        confirmationDialog={{
          title: t('dialog.delete_all_item'),
          message: t('dialog.delete_all'),
          isVisible: showDeleteAllDialog,
          onCancel: dismissDeleteAllDialog,
          onConfirm: handleDeleteAll,
        }}
      />
      <LoadingDialog
        modalVisible={isLoading}
        testID='Loadingdialog-submit-reconciliation'
      />
    </View>
  )
}
