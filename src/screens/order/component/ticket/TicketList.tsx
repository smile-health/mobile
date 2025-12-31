import React, { useCallback, memo } from 'react'
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
import { useTicketList } from '@/screens/order/hooks/useTicketList'
import { TicketItem } from './TicketItem'

interface TicketListProps {
  readonly filter: GetEventReportFilters
  readonly refreshControl?: React.ReactElement<RefreshControlProps>
}

function TicketListComponent({ filter, refreshControl }: TicketListProps) {
  const { t } = useLanguage()

  const {
    tickets,
    isFetching,
    isFetchingMore,
    isEmpty,
    handleEndReached,
    handleMomentumScrollBegin,
    onPressItem,
    keyExtractor,
  } = useTicketList({ filter })

  const renderItem = useCallback<ListRenderItem<EventReportItem>>(
    ({ item }) => <TicketItem item={item} onPress={() => onPressItem(item)} />,
    [onPressItem]
  )

  const renderEmptyState = useCallback(() => {
    if (!isFetching && isEmpty) {
      return (
        <EmptyState
          testID='empty-state-ticket'
          Icon={Icons.IcEmptyStateOrder}
          title={t('empty_state.no_data_available')}
          subtitle={t('empty_state.no_tickets_message')}
        />
      )
    }
    return null
  }, [isEmpty, isFetching, t])

  const renderFooter = useCallback(() => {
    if (isFetchingMore) {
      return <ActivityIndicator size='small' color='#0000ff' className='mt-1' />
    }
    return null
  }, [isFetchingMore])

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
      key={`ticket-list-${JSON.stringify(filter)}`}
    />
  )
}

// Menggunakan memo untuk mencegah render ulang yang tidak perlu
export const TicketList = memo(TicketListComponent)
