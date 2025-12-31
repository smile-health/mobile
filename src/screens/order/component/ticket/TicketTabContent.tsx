import React, { useCallback, memo, useEffect } from 'react'
import {
  FlatList,
  ListRenderItem,
  ActivityIndicator,
  RefreshControlProps,
} from 'react-native'
import { Icons } from '@/assets/icons'
import EmptyState from '@/components/EmptyState'
import { useLanguage } from '@/i18n/useLanguage'
import {
  EventReportItem,
  GetEventReportFilters,
} from '@/models/order/EventReport'
import { useTicketData } from '@/screens/order/hooks/useTicketData'
import { TicketItem } from './TicketItem'

interface TicketTabContentProps {
  readonly baseFilter: GetEventReportFilters
  readonly tabKey: string
  readonly refreshControl?: React.ReactElement<RefreshControlProps>
  readonly onDataUpdate: (
    tabKey: string,
    data: {
      tickets: EventReportItem[]
      page: number
      hasMore: boolean
      isLoading: boolean
      isFetchingMore: boolean
      lastFetchedFilter: GetEventReportFilters
      total_item?: number
    }
  ) => void
  readonly shouldRefetch?: boolean
}

function TicketTabContentComponent({
  baseFilter,
  tabKey,
  refreshControl,
  onDataUpdate,
  shouldRefetch,
}: TicketTabContentProps) {
  const { t } = useLanguage()

  const {
    tickets,
    isLoading,
    isFetchingMore,
    isEmpty,
    handleEndReached,
    handleMomentumScrollBegin,
    onPressItem,
    keyExtractor,
    refetch,
  } = useTicketData({
    baseFilter,
    tabKey,
    onDataUpdate,
  })

  useEffect(() => {
    if (shouldRefetch) {
      refetch()
    }
  }, [shouldRefetch, refetch])

  const renderItem = useCallback<ListRenderItem<EventReportItem>>(
    ({ item }) => <TicketItem item={item} onPress={() => onPressItem(item)} />,
    [onPressItem]
  )

  const renderEmptyState = useCallback(() => {
    if (!isLoading && isEmpty) {
      return (
        <EmptyState
          testID={`empty-state-ticket-${tabKey}`}
          Icon={Icons.IcEmptyStateOrder}
          title={t('empty_state.no_data_available')}
          subtitle={t('empty_state.no_tickets_message')}
        />
      )
    }
    return null
  }, [isEmpty, isLoading, t, tabKey])

  const renderFooter = useCallback(() => {
    if (isFetchingMore) {
      return (
        <ActivityIndicator
          size='small'
          color='#0000ff'
          className='mt-1'
          testID={`loading-more-${tabKey}`}
        />
      )
    }
    return null
  }, [isFetchingMore, tabKey])

  return (
    <FlatList
      data={tickets}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      refreshControl={refreshControl}
      ListEmptyComponent={renderEmptyState}
      onEndReached={handleEndReached}
      onMomentumScrollBegin={handleMomentumScrollBegin}
      onEndReachedThreshold={0.5}
      ListFooterComponent={renderFooter}
      contentContainerClassName='flex-grow'
      removeClippedSubviews={true}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={11}
      updateCellsBatchingPeriod={100}
      testID={`ticket-list-${tabKey}`}
      key={`ticket-tab-content-${tabKey}`}
    />
  )
}

export const TicketTabContent = memo(TicketTabContentComponent)
