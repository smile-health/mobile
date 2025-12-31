import React, { useCallback } from 'react'
import { ActivityIndicator, FlatList, View } from 'react-native'
import { Icons } from '@/assets/icons'
import EmptyState from '@/components/EmptyState'
import { useLanguage } from '@/i18n/useLanguage'
import colors from '@/theme/colors'
import StockTakingMaterialItem from './StockTakingMaterialItem'

interface Props<T> {
  materials: T[]
  isLoading: boolean
  showMandatoryLabel?: boolean
  isLoadMore?: boolean
  onLoadMore?: () => void
  onSelectMaterial: (material: T) => void
  emptyMessage: string
  ListHeaderComponent?: () => React.ReactElement
}

export default function StockTakingMaterialList<T>({
  materials,
  isLoading,
  isLoadMore,
  showMandatoryLabel = true,
  onLoadMore,
  onSelectMaterial,
  emptyMessage,
  ListHeaderComponent,
}: Readonly<Props<T>>) {
  const { t } = useLanguage()
  const renderItem = useCallback(
    ({ item }) => (
      <StockTakingMaterialItem
        name={item.material.name}
        remainingQty={item.total_qty}
        lastStockTaking={item.last_opname_date ?? ''}
        isMandatory={
          showMandatoryLabel && !!item.material.is_stock_opname_mandatory
        }
        onPress={() => onSelectMaterial(item)}
        showArrow
      />
    ),
    [onSelectMaterial, showMandatoryLabel]
  )

  const renderLoader = () => {
    if (!isLoadMore) return null
    return (
      <View className='py-4'>
        <ActivityIndicator size='large' color={colors.app()} />
      </View>
    )
  }

  const renderEmpty = () => (
    <View className='flex-1 items-center'>
      <EmptyState
        testID='empty-state-material'
        Icon={Icons.IcEmptyStateOrder}
        title={t('empty_state.no_data_available')}
        subtitle={emptyMessage}
      />
    </View>
  )

  const keyExtractor = (item, index) => `${item.material.id}-${index}`

  if (isLoading) {
    return renderLoader()
  }

  return (
    <FlatList
      data={materials}
      onEndReached={onLoadMore}
      onEndReachedThreshold={0.5}
      initialNumToRender={5}
      keyExtractor={keyExtractor}
      contentContainerClassName='flex-grow bg-white'
      showsHorizontalScrollIndicator={false}
      renderItem={renderItem}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={renderLoader}
      ListEmptyComponent={renderEmpty}
    />
  )
}
