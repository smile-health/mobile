import React, { useCallback } from 'react'
import { ActivityIndicator, FlatList, Text, View } from 'react-native'
import { Icons } from '@/assets/icons'
import EmptyState from '@/components/EmptyState'
import { useLanguage } from '@/i18n/useLanguage'
import { AssetInventory } from '@/models/asset-inventory/AssetInventory'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import AssetInventoryItem from './AssetInventoryItem'

interface AssetInventoryListProps {
  data: AssetInventory[]
  isLoading: boolean
  onEndReached: () => void
  refresh: () => void
}

function AssetInventoryList({
  data,
  isLoading,
  onEndReached,
  refresh,
}: Readonly<AssetInventoryListProps>) {
  const { t } = useLanguage()

  const renderHeader = useCallback(() => {
    return (
      <View className={AppStyles.rowBetween}>
        <Text className={AppStyles.textBoldLarge}>
          {t('asset.asset_inventory_list')}
        </Text>
        <Text className={cn(AppStyles.textRegularSmall, 'text-mediumGray')}>
          {t('label.total')}{' '}
          <Text className={cn(AppStyles.textBoldSmall, 'text-mediumGray')}>
            {t('label.count_items', { count: data?.length ?? 0 })}
          </Text>
        </Text>
      </View>
    )
  }, [data, t])

  const renderItem = useCallback(({ item }) => {
    return <AssetInventoryItem item={item} />
  }, [])

  const renderEmptyState = useCallback(
    () => (
      <View className='flex-1 items-center'>
        {isLoading ? (
          <ActivityIndicator size='large' className='mt-8' />
        ) : (
          <EmptyState
            testID='empty-state-activity-stock'
            Icon={Icons.IcEmptyStateOrder}
            title={t('empty_state.no_data_available')}
            subtitle={t('empty_state.no_data_message')}
          />
        )}
      </View>
    ),
    [t, isLoading]
  )

  // Render footer with loading indicator for load more
  const renderFooter = useCallback(() => {
    if (!isLoading) return null

    return (
      <View className='py-4 items-center'>
        <ActivityIndicator size='small' />
      </View>
    )
  }, [isLoading])

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      ListHeaderComponent={renderHeader}
      ListEmptyComponent={renderEmptyState}
      ListFooterComponent={renderFooter}
      keyExtractor={(item) => item.id.toString()}
      contentContainerClassName='flex-grow p-4 gap-4'
      showsVerticalScrollIndicator={false}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.3}
      onRefresh={refresh}
      refreshing={isLoading}
    />
  )
}

export default AssetInventoryList
