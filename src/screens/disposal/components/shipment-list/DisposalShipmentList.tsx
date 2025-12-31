import React, { useCallback } from 'react'
import { FlatList, ListRenderItem, View } from 'react-native'
import { Icons } from '@/assets/icons'
import CircularLoadingIndicator from '@/components/CircularLoadingIndicator'
import EmptyState from '@/components/EmptyState'
import { useLanguage } from '@/i18n/useLanguage'
import { IDisposalShipment } from '@/models/disposal/DisposalShipmentList'
import { navigate } from '@/utils/NavigationUtils'
import DisposalShipmentItem from './DisposalShipmentItem'

interface Props {
  data: IDisposalShipment[]
  isSender: boolean
  isLoadMore: boolean
  onEndReached: () => void
}

const handlePressItem = (id: number, isSender: boolean) => {
  navigate('DisposalShipmentDetail', { id, isSender })
}

function DisposalShipmentList({
  data,
  isSender,
  isLoadMore,
  onEndReached,
}: Readonly<Props>) {
  const { t } = useLanguage()

  const renderItem: ListRenderItem<IDisposalShipment> = useCallback(
    ({ item }) => (
      <DisposalShipmentItem
        item={item}
        isSender={isSender}
        onPress={() => handlePressItem(item.id, isSender)}
      />
    ),
    [isSender]
  )

  const renderLoader = useCallback(() => {
    if (!isLoadMore) return null
    return <CircularLoadingIndicator />
  }, [isLoadMore])

  const renderEmpty = useCallback(() => {
    if (isLoadMore) return null
    return (
      <View className='flex-1 items-center'>
        <EmptyState
          Icon={Icons.IcEmptyStateOrder}
          title={t('empty_state.no_data_available')}
          subtitle={t('empty_state.no_data_message')}
          testID='empty-state-disposal-shipment'
        />
      </View>
    )
  }, [t, isLoadMore])

  const keyExtractor = useCallback(
    (item: IDisposalShipment) => `KPM-${item.id}`,
    []
  )
  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      ListEmptyComponent={renderEmpty}
      ListFooterComponent={renderLoader}
      keyExtractor={keyExtractor}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      contentContainerClassName='flex-grow bg-catskillWhite'
    />
  )
}

export default React.memo(DisposalShipmentList)
