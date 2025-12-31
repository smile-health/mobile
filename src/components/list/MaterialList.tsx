import React, { useCallback, useMemo } from 'react'
import { FlatList, ListRenderItem, Text } from 'react-native'
import { useForm } from 'react-hook-form'
import { useLanguage } from '@/i18n/useLanguage'
import { AppNotifActivityMaterial } from '@/models/notif/AppNotifMaterial'
import { OrderItem } from '@/models/order/OrderItem'
import { StockDetail, StockItem } from '@/models/shared/Material'
import { CreateTransaction } from '@/models/transaction/TransactionCreate'
import { getMaterialTrxLabel } from '@/screens/inventory/helpers/TransactionHelpers'
import { homeState, useAppSelector } from '@/services/store'
import { numberFormat } from '@/utils/CommonUtils'
import { MATERIAL_LIST_TYPE, TRANSACTION_TYPE } from '@/utils/Constants'
import { calculateTotalQty } from '@/utils/helpers/material/commonHelper'
import MaterialItem from './MaterialItem'
import MaterialListHeader from './MaterialListHeader'

export type MaterialListType =
  (typeof MATERIAL_LIST_TYPE)[keyof typeof MATERIAL_LIST_TYPE]

interface MaterialListProps<T extends StockItem | StockDetail> {
  data: T[]
  onPressMaterial: (val: T) => void
  title?: string
  orders?: OrderItem[]
  transactions?: CreateTransaction[]
  onEndReach?: () => void
  type?: MaterialListType
  alerts?: AppNotifActivityMaterial[]
}

const FLATLIST_CONFIG = {
  showsVerticalScrollIndicator: false,
  onEndReachedThreshold: 0.2,
  initialNumToRender: 10,
  maxToRenderPerBatch: 5,
  windowSize: 10,
  removeClippedSubviews: true,
  contentContainerClassName: 'pb-6',
} as const

const getMaterialKeyExtractor = (item: StockItem | StockDetail): string => {
  if ('id' in item && typeof item.id === 'number') {
    return String(item.id)
  }
  return String(item.material?.id ?? 0)
}

const getMaterialId = (item: StockItem | StockDetail): number | undefined => {
  if ('id' in item && typeof item.id === 'number') {
    return item.id
  }
  return item.material?.id
}

const getMaterialName = (item: StockItem | StockDetail): string => {
  if ('name' in item && typeof item.name === 'string') {
    return item.name
  }
  return item.material?.name ?? ''
}

const computeStockData = (item: StockItem | StockDetail) => {
  const isStockItem = 'details' in item

  if (isStockItem) {
    const details = item.details
    if (!details?.length) {
      return { qty: 0, min: 0, max: 0, updatedAt: '' }
    }

    return {
      qty: calculateTotalQty(details, 'total_available_qty'),
      min: calculateTotalQty(details, 'min'),
      max: calculateTotalQty(details, 'max'),
      updatedAt: details[0]?.updated_at || '',
    }
  }

  return {
    min: item.min ?? 0,
    max: item.max ?? 0,
    qty: item.total_available_qty ?? 0,
    updatedAt: item.updated_at ?? '',
  }
}

export default function MaterialList<T extends StockItem | StockDetail>({
  type,
  data,
  onPressMaterial,
  title,
  orders,
  transactions,
  alerts,
  onEndReach,
}: Readonly<MaterialListProps<T>>) {
  const { activeMenu } = useAppSelector(homeState)
  const { control, watch } = useForm<{ name: string }>()
  const watchedName = watch('name')
  const { t } = useLanguage()

  const shouldShowMaterialQty = useMemo(() => {
    const transactionType = activeMenu?.transactionType ?? 0
    return ![
      TRANSACTION_TYPE.RETURN,
      TRANSACTION_TYPE.CANCEL_DISCARDS,
    ].includes(transactionType)
  }, [activeMenu?.transactionType])

  const filteredItems = useMemo(() => {
    if (!watchedName?.trim()) return data

    const searchTerm = watchedName.toLowerCase().trim()
    return data.filter((item) => {
      const materialName = getMaterialName(item)
      return materialName.toLowerCase().includes(searchTerm)
    })
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

  const getTransactionLabel = useCallback(
    (materialId: number, transactionType: number): string => {
      if (!transactions?.length) return ''
      return (
        getMaterialTrxLabel(transactions, transactionType, materialId, t) ?? ''
      )
    },
    [transactions, t]
  )

  const getDirectOrderLabel = useCallback(
    (materialId: number): string => {
      if (!orders?.length) return ''
      const directOrder = orders.find((o) => o?.material_id === materialId)
      if (!directOrder) return ''

      return t('order.order_entered', {
        qty: numberFormat(Number(directOrder.ordered_qty)),
      })
    },
    [orders, t]
  )

  const getHierarchicalOrderLabel = useCallback(
    (materialId: number): string => {
      if (!orders?.length) return ''

      for (const parent of orders) {
        const hierarchy = parent?.material_hierarchy
        if (!hierarchy?.length) continue

        const child = hierarchy.find((c) => c.material_id === materialId)
        if (child) {
          return t('order.order_entered', {
            qty: numberFormat(Number(child.ordered_qty)),
          })
        }
      }
      return ''
    },
    [orders, t]
  )

  const getMaterialLabel = useCallback(
    (materialId: number, transactionType?: number): string => {
      if (transactionType !== undefined) {
        const transactionLabel = getTransactionLabel(
          materialId,
          transactionType
        )
        if (transactionLabel) return transactionLabel
      }

      const directOrderLabel = getDirectOrderLabel(materialId)
      if (directOrderLabel) return directOrderLabel

      return getHierarchicalOrderLabel(materialId)
    },
    [getTransactionLabel, getDirectOrderLabel, getHierarchicalOrderLabel]
  )

  const labelsMap = useMemo(() => {
    const map = new Map<number, string>()
    const transactionType = activeMenu?.transactionType

    for (const item of filteredItems) {
      const materialId = getMaterialId(item)
      if (materialId) {
        const label = getMaterialLabel(materialId, transactionType)
        if (label) {
          map.set(materialId, label)
        }
      }
    }

    return map
  }, [filteredItems, activeMenu?.transactionType, getMaterialLabel])

  const renderItem: ListRenderItem<T> = useCallback(
    ({ item }) => {
      const materialId = getMaterialId(item)
      if (!materialId) return null

      const stockData = stockDataMap.get(materialId)
      if (!stockData) return null

      const transactionLabel = labelsMap.get(materialId) ?? ''
      const materialName = getMaterialName(item)
      const materialAlert = alerts?.find((ma) => ma.id === item?.material?.id)

      return (
        <MaterialItem
          type={type}
          name={materialName}
          updatedAt={stockData.updatedAt}
          qty={stockData.qty}
          min={stockData.min}
          max={stockData.max}
          className='mx-4 mb-1'
          transactionLabel={transactionLabel}
          showQuantity={shouldShowMaterialQty}
          alert={materialAlert}
          onPress={() => onPressMaterial(item)}
        />
      )
    },
    [
      labelsMap,
      stockDataMap,
      type,
      shouldShowMaterialQty,
      onPressMaterial,
      alerts,
    ]
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
      onEndReached={onEndReach}
      ListHeaderComponent={<MaterialListHeader {...headerProps} />}
    />
  )
}
