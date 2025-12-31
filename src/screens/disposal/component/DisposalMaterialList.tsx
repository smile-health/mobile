import React, { useCallback, useMemo } from 'react'
import { FlatList, ListRenderItem, Text } from 'react-native'
import { useForm } from 'react-hook-form'
import MaterialItem from '@/components/list/MaterialItem'
import MaterialListHeader from '@/components/list/MaterialListHeader'
import { useLanguage } from '@/i18n/useLanguage'
import {
  DisposalDetailMaterialItem,
  DisposalStockItemResponse,
} from '@/models/disposal/DisposalStock'
import { MATERIAL_LIST_TYPE } from '@/utils/Constants'

export type MaterialListType =
  (typeof MATERIAL_LIST_TYPE)[keyof typeof MATERIAL_LIST_TYPE]

interface DisposalMaterialListProps {
  data: DisposalStockItemResponse[] | DisposalDetailMaterialItem[]
  onPressMaterial: (
    val: DisposalStockItemResponse | DisposalDetailMaterialItem
  ) => void
  title?: string
  type?: MaterialListType
  searchText?: string
  onEndReach?: () => void
}

const FLATLIST_CONFIG = {
  showsVerticalScrollIndicator: false,
  onEndReachedThreshold: 0.1, // Reduced threshold to trigger earlier
  initialNumToRender: 10,
  maxToRenderPerBatch: 10,
  windowSize: 10,
  removeClippedSubviews: false, // Disable to ensure onEndReached works properly
  contentContainerClassName: 'pb-6',
} as const

const getMaterialKeyExtractor = (
  item: DisposalStockItemResponse | DisposalDetailMaterialItem,
  index: number
): string => {
  // Use combination of material_id and index to ensure uniqueness
  // entity_id is only present in DisposalStockItemResponse, use a placeholder for DisposalDetailMaterialItem
  const entityId = 'entity_id' in item ? item.entity_id : 'detail'
  return `${item.material_id}-${entityId}-${index}`
}

const getMaterialId = (
  item: DisposalStockItemResponse | DisposalDetailMaterialItem
): number | undefined => {
  return item.material_id
}

const getMaterialName = (
  item: DisposalStockItemResponse | DisposalDetailMaterialItem
): string => {
  if ('material' in item && item.material?.name) {
    return item.material.name
  }
  // DisposalDetailMaterialItem does not have a 'material' property with a 'name'.
  // Return an empty string or a suitable placeholder if the name cannot be determined directly.
  return ''
}

const computeStockData = (
  item: DisposalStockItemResponse | DisposalDetailMaterialItem
) => {
  if ('total_disposal_discard_qty' in item) {
    // It's a DisposalStockItemResponse
    const stockItem = item
    return {
      qty:
        stockItem.total_disposal_discard_qty +
        stockItem.total_disposal_received_qty,
      min: 0,
      max: 0,
      updatedAt: stockItem?.updated_at || '',
    }
  } else {
    // It's a DisposalDetailMaterialItem
    const detailItem = item
    return {
      qty: detailItem.disposal_discard_qty + detailItem.disposal_received_qty, // Assuming disposal_qty is the relevant quantity for detail items
      min: 0,
      max: 0,
      updatedAt: detailItem?.updated_at || '',
    }
  }
}

export default function DisposalMaterialList({
  type,
  data,
  onPressMaterial,
  title,
  onEndReach,
}: Readonly<DisposalMaterialListProps>) {
  const { control, watch } = useForm<{ name: string }>()
  const watchedName = watch('name')
  const { t } = useLanguage()

  const filteredItems = useMemo(() => {
    if (!watchedName?.trim()) {
      return data
    }
    const searchTerm = watchedName.toLowerCase().trim()
    const filtered = data.filter((item) => {
      const materialName = getMaterialName(item)
      return materialName.toLowerCase().includes(searchTerm)
    })
    return filtered
  }, [watchedName, data])

  const stockDataMap = useMemo(() => {
    const map = new Map<number, ReturnType<typeof computeStockData>>()

    for (const item of filteredItems) {
      const materialId = getMaterialId(item)
      if (materialId) {
        map.set(materialId, computeStockData(item))
      }
    }

    return map
  }, [filteredItems])

  const renderItem: ListRenderItem<
    DisposalStockItemResponse | DisposalDetailMaterialItem
  > = useCallback(
    ({ item }) => {
      const materialId = getMaterialId(item)
      if (!materialId) return null

      const stockData = stockDataMap.get(materialId)
      if (!stockData) return null

      const materialName = getMaterialName(item)

      return (
        <MaterialItem
          type={type}
          name={materialName}
          updatedAt={stockData.updatedAt}
          qty={stockData.qty}
          min={stockData.min}
          max={stockData.max}
          className='mx-4 mb-1'
          showQuantity={true} // Always show quantity for disposal materials
          onPress={() => onPressMaterial(item)}
        />
      )
    },
    [stockDataMap, type, onPressMaterial]
  )

  const renderEmptyList = () => (
    <Text className='text-center text-mediumGray'>{t('no_items_found')}</Text>
  )

  const headerProps = useMemo(
    () => ({
      control,
      itemCount: filteredItems.length,
      title,
      type: type ?? MATERIAL_LIST_TYPE.VIEW_STOCK,
    }),
    [control, filteredItems.length, title, type]
  )

  return (
    <FlatList
      {...FLATLIST_CONFIG}
      data={filteredItems}
      keyExtractor={getMaterialKeyExtractor}
      renderItem={renderItem}
      ListEmptyComponent={renderEmptyList}
      onEndReached={() => {
        onEndReach?.()
      }}
      ListHeaderComponent={<MaterialListHeader {...headerProps} />}
    />
  )
}
