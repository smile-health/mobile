import React, { useCallback, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  View,
} from 'react-native'
import { Icons } from '@/assets/icons'
import { Button } from '@/components/buttons'
import { ConfirmationDialog } from '@/components/dialog/ConfirmationDialog'
import EmptyState from '@/components/EmptyState'
import LoadingDialog from '@/components/LoadingDialog'
import { useLanguage } from '@/i18n/useLanguage'
import AppStyles from '@/theme/AppStyles'
import colors from '@/theme/colors'
import { cn } from '@/theme/theme-config'
import { getTestID } from '@/utils/CommonUtils'
import NotificationFilter from './components/NotificationFilter'
import NotificationItem from './components/NotificationItem'
import useNotificationList from './hooks/useNotificationList'

export default function NotificationScreen() {
  const {
    notificationList,
    filter,
    programOptions,
    shouldShowLoading,
    isLoadMore,
    handleApplyFilter,
    handleResetFilter,
    handleLoadMore,
    refetch,
    handleReadNotification,
    handleReadAllNotification,
  } = useNotificationList()

  const [showReadAllDialog, setShowReadAllDialog] = useState(false)

  const { t } = useLanguage()

  const dismissReadAllDialog = () => {
    setShowReadAllDialog(false)
  }

  const openReadAllDialog = () => {
    setShowReadAllDialog(true)
  }

  const confirmReadAllNotification = () => {
    handleReadAllNotification()
    dismissReadAllDialog()
  }

  const renderHeaderNotification = useCallback(() => {
    return (
      <View className='flex-row items-center px-4 py-3'>
        <Text className={cn(AppStyles.textBold, 'flex-1')}>
          {t('notification.list_title')}
        </Text>
        <Button
          text={t('button.mark_all_as_read')}
          textClassName='text-bluePrimary'
          onPress={openReadAllDialog}
        />
      </View>
    )
  }, [t])

  const renderItem = useCallback(
    ({ item, index }) => (
      <NotificationItem
        item={item}
        onPress={handleReadNotification}
        testID={`notification-item-${index}`}
      />
    ),
    [handleReadNotification]
  )

  const renderFooterNotification = useCallback(() => {
    if (!isLoadMore) return null
    return (
      <View className='py-4'>
        <ActivityIndicator size='large' color={colors.bluePrimary} />
      </View>
    )
  }, [isLoadMore])

  const renderEmptyNotification = useCallback(() => {
    if (shouldShowLoading) return null
    return (
      <View className='flex-1'>
        <EmptyState
          Icon={Icons.IcEmptyStateOrder}
          title={t('empty_state.no_data_available')}
          subtitle={t('empty_state.no_data_message')}
          testID='empty-state-notification-list'
        />
      </View>
    )
  }, [shouldShowLoading, t])

  return (
    <View className='bg-white flex-1'>
      <NotificationFilter
        programIds={filter}
        programs={programOptions}
        onApplyFilter={handleApplyFilter}
        onResetFilter={handleResetFilter}
      />
      <FlatList
        data={notificationList}
        keyExtractor={(item) => `notification-${item.id}`}
        contentContainerClassName='flex-grow'
        renderItem={renderItem}
        ListHeaderComponent={renderHeaderNotification}
        ListFooterComponent={renderFooterNotification}
        ListEmptyComponent={renderEmptyNotification}
        onEndReached={handleLoadMore}
        refreshControl={
          <RefreshControl
            refreshing={shouldShowLoading}
            onRefresh={refetch}
            colors={[colors.bluePrimary]}
          />
        }
      />
      <ConfirmationDialog
        title={t('dialog.mark_all_read_title')}
        message={t('dialog.mark_all_read_subtitle')}
        cancelText={t('button.cancel')}
        confirmText={t('button.confirm_mark_all')}
        modalVisible={showReadAllDialog}
        dismissDialog={dismissReadAllDialog}
        onCancel={dismissReadAllDialog}
        onConfirm={confirmReadAllNotification}
        cancelProps={{
          containerClassName: 'rounded border border-bluePrimary px-3 py-2',
          textClassName: 'text-bluePrimary',
          ...getTestID('btn-cancel-read-all'),
        }}
        confirmProps={{
          containerClassName: 'rounded bg-bluePrimary px-3 py-2',
          textClassName: 'text-white',
          ...getTestID('btn-confirm-read-all'),
        }}
      />
      <LoadingDialog
        modalVisible={shouldShowLoading}
        testID='loading-dialog-notification-list'
      />
    </View>
  )
}
