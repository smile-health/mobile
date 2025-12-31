import React, { useCallback, useMemo } from 'react'
import { ActivityIndicator, FlatList, View, Text } from 'react-native'
import { Icons } from '@/assets/icons'
import EmptyState from '@/components/EmptyState'
import MaterialItem from '@/components/list/MaterialItem'
import { useLanguage } from '@/i18n/useLanguage'
import { StockItem } from '@/models/shared/Material'
import { CreateTransaction } from '@/models/transaction/TransactionCreate'
import AppStyles from '@/theme/AppStyles'
import colors from '@/theme/colors'
import { cn } from '@/theme/theme-config'
import { numberFormat } from '@/utils/CommonUtils'

interface Props {
  materials: StockItem[]
  transactions: CreateTransaction[]
  isLoading: boolean
  isLoadMore?: boolean
  onLoadMore?: () => void
  onSelectMaterial: (material: StockItem) => void
}

export default function TransferStockMaterialList({
  materials,
  transactions,
  isLoading,
  isLoadMore,
  onLoadMore,
  onSelectMaterial,
}: Readonly<Props>) {
  const { t } = useLanguage()

  const transactionMap = useMemo(() => {
    const map = new Map<number, number>()

    for (const transaction of transactions) {
      const materialId = transaction.material_id
      const currentQty = map.get(materialId) ?? 0
      map.set(materialId, currentQty + (transaction.change_qty ?? 0))
    }

    return map
  }, [transactions])

  const getTransactionLabel = useCallback(
    (materialId: number) => {
      const totalQty = transactionMap.get(materialId) ?? 0
      if (totalQty === 0) return ''

      return t('transaction.transaction_label.transfer_stock', {
        qty: numberFormat(totalQty),
      })
    },
    [transactionMap, t]
  )

  const renderHeaderMaterialList = () => {
    return (
      <View className='flex-row px-4 py-3 items-start border border-amber-400 bg-amber-50 gap-x-2.5 mx-4 rounded mb-4'>
        <Icons.IcAlertCircle height={16} width={16} />
        <Text className={cn(AppStyles.textBoldSmall, 'text-amber-500')}>
          {t('transfer_stock.alert_material')}
        </Text>
      </View>
    )
  }

  const renderTransferStockMaterialItem = useCallback(
    ({ item }) => (
      <MaterialItem
        name={item.material.name}
        updatedAt={item.updated_at}
        qty={item.aggregate?.total_qty ?? 0}
        min={item.aggregate?.min ?? 0}
        max={item.aggregate?.max ?? 0}
        className='mx-4 mb-1'
        transactionLabel={getTransactionLabel(item.material.id)}
        onPress={() => onSelectMaterial(item)}
      />
    ),
    [onSelectMaterial, getTransactionLabel]
  )

  const renderLoader = () => {
    if (!isLoadMore) return null
    return (
      <View className='py-4 flex-1'>
        <ActivityIndicator size='large' color={colors.app()} />
      </View>
    )
  }

  const renderEmptyMaterial = () => (
    <View className='flex-1 items-center'>
      <EmptyState
        Icon={Icons.IcEmptyStateOrder}
        title={t('empty_state.no_data_available')}
        subtitle={t('empty_state.no_data_message')}
        testID='empty-state-material'
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
      initialNumToRender={10}
      onEndReachedThreshold={0.5}
      renderItem={renderTransferStockMaterialItem}
      ListHeaderComponent={renderHeaderMaterialList}
      ListFooterComponent={renderLoader}
      ListEmptyComponent={renderEmptyMaterial}
      keyExtractor={keyExtractor}
      showsHorizontalScrollIndicator={false}
      contentContainerClassName='flex-grow bg-white'
    />
  )
}
