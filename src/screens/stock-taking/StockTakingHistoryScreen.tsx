import React, { useCallback } from 'react'
import { ActivityIndicator, SectionList, View } from 'react-native'
import { Icons } from '@/assets/icons'
import EmptyState from '@/components/EmptyState'
import HeaderMaterial from '@/components/header/HeaderMaterial'
import ListSectionDateSeparator from '@/components/list/ListSectionDateSeparator'
import LoadingDialog from '@/components/LoadingDialog'
import { useToolbar } from '@/components/toolbar/hooks/useToolbar'
import { useLanguage } from '@/i18n/useLanguage'
import { StockTaking } from '@/models/stock-taking/StockTakingList'
import colors from '@/theme/colors'
import StockTakingFilter from './components/StockTakingFilter'
import StockTakingItem from './components/StockTakingItem'
import useStockTakingHistoryList from './hooks/useStockTakingHistoryList'

export default function StockTakingHistoryScreen() {
  const { t } = useLanguage()
  const {
    periodName,
    detail,
    filter,
    sections,
    isLoadMore,
    shouldShowLoading,
    handleApplyFilter,
    handleLoadMore,
  } = useStockTakingHistoryList()

  const renderItem = useCallback((props: { item: StockTaking }) => {
    const { item } = props
    return (
      <StockTakingItem
        activityName={item.activity.name}
        createdAt={item.created_at}
        batch={item.batch}
        actualQty={item.actual_qty}
        inTransitQty={item.in_transit_qty}
        remainingQty={item.recorded_qty}
      />
    )
  }, [])

  const renderSectionHeader = useCallback(
    ({ section }) => (
      <ListSectionDateSeparator
        date={section.title}
        count={section.data.length}
      />
    ),
    []
  )

  const renderFooter = useCallback(() => {
    if (!isLoadMore) return null
    return (
      <View className='py-4'>
        <ActivityIndicator size='large' color={colors.main()} />
      </View>
    )
  }, [isLoadMore])

  const renderEmpty = useCallback(
    () => (
      <EmptyState
        testID='empty-state-stock-taking-history'
        Icon={Icons.IcEmptyStateSearch}
        title={t('empty_state.no_data_available')}
        subtitle={t('empty_state.no_data_message')}
      />
    ),
    [t]
  )

  useToolbar({
    title: t('stock_taking.stock_taking_history'),
    subtitle: detail.materialName,
  })

  return (
    <View className='flex-1 bg-slate-100'>
      <HeaderMaterial
        items={[{ label: t('label.period'), value: periodName }]}
      />
      <StockTakingFilter filter={filter} onApplyFilter={handleApplyFilter} />
      <SectionList
        sections={sections}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        initialNumToRender={5}
        keyExtractor={(item) => String(item.id)}
        contentContainerClassName='flex-grow bg-lightBlueGray pb-6'
        showsHorizontalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
      />
      <LoadingDialog
        modalVisible={shouldShowLoading}
        testID='loading-dialog-stock=taking-history-list'
      />
    </View>
  )
}
