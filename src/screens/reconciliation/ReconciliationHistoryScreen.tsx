import React, { useCallback } from 'react'
import { View, FlatList, ActivityIndicator } from 'react-native'
import { Icons } from '@/assets/icons'
import EmptyState from '@/components/EmptyState'
import ListTitle from '@/components/list/ListTitle'
import LoadingDialog from '@/components/LoadingDialog'
import { useToolbar } from '@/components/toolbar/hooks/useToolbar'
import { useLanguage } from '@/i18n/useLanguage'
import colors from '@/theme/colors'
import { getDateRangeText } from '@/utils/DateFormatUtils'
import ReconciliationFilter from './components/ReconciliationFilter'
import ReconciliationHistoryItem from './components/ReconciliationHistoryItem'
import useReconciliationHistoryList from './hooks/useReconciliationHistoryList'

export default function ReconciliationHistoryScreen() {
  const { t } = useLanguage()
  const {
    activityName,
    materialName,
    filter,
    reconciliationList,
    isLoadMore,
    shouldShowLoading,
    handleLoadMore,
    handleApplyFilter,
  } = useReconciliationHistoryList()

  const renderItem = useCallback(({ item }) => {
    return (
      <ReconciliationHistoryItem
        id={item.id}
        items={item.items}
        period={getDateRangeText(item.start_date, item.end_date) ?? '-'}
        updatedAt={item.updated_at}
      />
    )
  }, [])

  const renderReconciliationHistoryHeader = useCallback(
    () => (
      <ListTitle
        title={t('label.history_list')}
        itemCount={reconciliationList.length}
      />
    ),
    [reconciliationList.length, t]
  )

  const renderReconciliationHistoryFooter = useCallback(() => {
    if (!isLoadMore) return null
    return (
      <View className='py-4'>
        <ActivityIndicator size='large' color={colors.main()} />
      </View>
    )
  }, [isLoadMore])

  const renderEmptyReconciliationHistory = useCallback(() => {
    if (shouldShowLoading) return null
    return (
      <EmptyState
        Icon={Icons.IcEmptyStateSearch}
        title={t('empty_state.no_data_available')}
        subtitle={t('empty_state.no_data_message')}
        testID='empty-state-reconciliation-history'
      />
    )
  }, [shouldShowLoading, t])

  useToolbar({
    title: t('reconciliation.history'),
    subtitle: materialName,
    withDefaultSubtitle: false,
  })

  return (
    <View className='flex-1 bg-slate-100'>
      <ReconciliationFilter
        activityName={activityName}
        filter={filter}
        onApply={handleApplyFilter}
      />
      <FlatList
        data={reconciliationList}
        renderItem={renderItem}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        initialNumToRender={5}
        showsHorizontalScrollIndicator={false}
        contentContainerClassName='flex-grow bg-lightBlueGray pb-6'
        keyExtractor={(item) => String(item.id)}
        ListHeaderComponent={renderReconciliationHistoryHeader}
        ListEmptyComponent={renderEmptyReconciliationHistory}
        ListFooterComponent={renderReconciliationHistoryFooter}
      />
      <LoadingDialog
        modalVisible={shouldShowLoading}
        testID='loading-dialog-reconciliation-list'
      />
    </View>
  )
}
