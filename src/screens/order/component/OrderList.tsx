import React, {
  useCallback,
  memo,
  useState,
  useEffect,
  useMemo,
  useRef,
} from 'react'
import { FlatList, ListRenderItem, ActivityIndicator, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { Icons } from '@/assets/icons'
import EmptyState from '@/components/EmptyState'
import { useLanguage } from '@/i18n/useLanguage'
import { OrderResponse } from '@/models'
import { useGetOrderListQuery } from '@/services/apis'
import { orderState, useAppSelector } from '@/services/store'
import { OrderItem } from './OrderItem'
import { useOrderFilter } from '../hooks/useOrderFilter'

// Constants
const THROTTLE_DELAY = 400
const PROCESSING_DELAY = 200
const LOCK_RELEASE_DELAY = 200
const LOAD_MORE_THROTTLE = 300
const REFRESH_DELAY = 300

// ✅ Throttle value changes
const useThrottledValue = <T,>(value: T, delay: number) => {
  const [throttledValue, setThrottledValue] = useState(value)
  const lastUpdateRef = useRef(0)
  const processingRef = useRef(false)

  useEffect(() => {
    if (processingRef.current) return

    const now = Date.now()
    const timeSinceLastUpdate = now - lastUpdateRef.current

    const updateValue = () => {
      processingRef.current = true
      setThrottledValue(value)
      lastUpdateRef.current = Date.now()
      setTimeout(() => {
        processingRef.current = false
      }, PROCESSING_DELAY)
    }

    if (timeSinceLastUpdate >= delay) {
      updateValue()
    } else {
      const timeoutId = setTimeout(updateValue, delay - timeSinceLastUpdate)
      return () => clearTimeout(timeoutId)
    }
  }, [value, delay])

  return throttledValue
}

// ✅ Handle filter changes (mirror lock to state via onLockChange)
const useFilterChangeHandler = (
  throttledFilter: any,
  setPage: React.Dispatch<React.SetStateAction<number>>,
  setFilteredOrderList: React.Dispatch<React.SetStateAction<OrderResponse[]>>,
  setIsInitialLoad: React.Dispatch<React.SetStateAction<boolean>>,
  isLoadingMoreRef: React.MutableRefObject<boolean>,
  onLockChange: (v: boolean) => void
) => {
  const lastFilterRef = useRef(JSON.stringify(throttledFilter))
  const processingLockRef = useRef(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const executeFilterChange = useCallback(
    (currentFilter: string) => {
      const filterChangeAction = () => {
        setPage(1)
        setIsInitialLoad(true)
        isLoadingMoreRef.current = false
        lastFilterRef.current = currentFilter
        // delay clear untuk hindari flicker
        setTimeout(() => setFilteredOrderList([]), 50)
        // lock dilepas oleh data processor
      }
      requestAnimationFrame(filterChangeAction)
    },
    [setPage, setFilteredOrderList, setIsInitialLoad, isLoadingMoreRef]
  )

  useEffect(() => {
    const currentFilter = JSON.stringify(throttledFilter)
    if (currentFilter !== lastFilterRef.current && !processingLockRef.current) {
      processingLockRef.current = true
      onLockChange(true) // trigger re-render

      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => {
        executeFilterChange(currentFilter)
      }, PROCESSING_DELAY)
    }
  }, [throttledFilter, executeFilterChange, onLockChange])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  return processingLockRef
}

// ✅ Process incoming data (also mirrors lock state)
const useDataProcessor = (
  data: any,
  page: number,
  setIsInitialLoad: React.Dispatch<React.SetStateAction<boolean>>,
  setFilteredOrderList: React.Dispatch<React.SetStateAction<OrderResponse[]>>,
  isLoadingMoreRef: React.MutableRefObject<boolean>,
  processingLockRef: React.MutableRefObject<boolean>,
  onLockChange: (v: boolean) => void
) => {
  const isMountedRef = useRef(true)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const processNewData = useCallback(
    (currentData: any, currentPage: number) => {
      setIsInitialLoad(false)
      isLoadingMoreRef.current = false

      setFilteredOrderList((prevList) => {
        let newList: OrderResponse[]

        if (currentPage === 1) {
          newList = Array.isArray(currentData?.data)
            ? [...currentData.data]
            : []
        } else {
          const existingIds = new Set(prevList.map((item) => item.id))
          const newItems = (currentData?.data ?? []).filter(
            (item: OrderResponse) => !existingIds.has(item.id)
          )
          newList = newItems.length > 0 ? [...prevList, ...newItems] : prevList
        }

        // Release lock setelah update data
        setTimeout(() => {
          if (isMountedRef.current) {
            processingLockRef.current = false
            onLockChange(false)
          }
        }, LOCK_RELEASE_DELAY)

        return newList
      })
    },
    [
      setIsInitialLoad,
      setFilteredOrderList,
      isLoadingMoreRef,
      processingLockRef,
      onLockChange,
    ]
  )

  const executeDataProcessing = useCallback(() => {
    if (!isMountedRef.current) return
    requestAnimationFrame(() => processNewData(data, page))
  }, [data, page, processNewData])

  useEffect(() => {
    if (!data?.data || !isMountedRef.current) return

    if (timeoutRef.current) clearTimeout(timeoutRef.current)

    if (processingLockRef.current) {
      // tunda kalau lagi lock
      timeoutRef.current = setTimeout(() => {
        if (isMountedRef.current) executeDataProcessing()
      }, REFRESH_DELAY)
    } else {
      // mulai processing + set lock
      processingLockRef.current = true
      onLockChange(true)
      timeoutRef.current = setTimeout(executeDataProcessing, 50)
    }
  }, [data, executeDataProcessing, processingLockRef, onLockChange])

  useEffect(() => {
    return () => {
      isMountedRef.current = false
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  return isMountedRef
}

// ✅ Load more handler (mirrors lock state)
interface LoadMoreHandlerParams {
  isLoading: boolean
  isFetching: boolean
  hasMoreData: boolean
  filteredOrderList: OrderResponse[]
  setPage: React.Dispatch<React.SetStateAction<number>>
  isLoadingMoreRef: React.MutableRefObject<boolean>
  processingLockRef: React.MutableRefObject<boolean>
  isMountedRef: React.MutableRefObject<boolean>
  onLockChange: (v: boolean) => void
}

const useLoadMoreHandler = (params: LoadMoreHandlerParams) => {
  const {
    isLoading,
    isFetching,
    hasMoreData,
    filteredOrderList,
    setPage,
    isLoadingMoreRef,
    processingLockRef,
    isMountedRef,
    onLockChange,
  } = params

  const lastLoadMoreRef = useRef(0)

  const executeLoadMore = useCallback(() => {
    setPage((prevPage) => prevPage + 1)
    setTimeout(() => {
      processingLockRef.current = false
      onLockChange(false)
    }, PROCESSING_DELAY)
  }, [setPage, processingLockRef, onLockChange])

  const loadMore = useCallback(() => {
    const now = Date.now()
    if (now - lastLoadMoreRef.current < LOAD_MORE_THROTTLE) return
    if (!isMountedRef.current || processingLockRef.current) return

    const canLoadMore =
      !isLoading &&
      !isFetching &&
      hasMoreData &&
      !isLoadingMoreRef.current &&
      filteredOrderList.length > 0

    if (canLoadMore) {
      lastLoadMoreRef.current = now
      isLoadingMoreRef.current = true
      processingLockRef.current = true
      onLockChange(true)
      requestAnimationFrame(executeLoadMore)
    }
  }, [
    isLoading,
    isFetching,
    hasMoreData,
    filteredOrderList.length,
    isLoadingMoreRef,
    processingLockRef,
    isMountedRef,
    onLockChange,
    executeLoadMore,
  ])

  return loadMore
}

// ✅ Refresh handler (mirrors lock state)
interface RefreshHandlerParams {
  setPage: React.Dispatch<React.SetStateAction<number>>
  setFilteredOrderList: React.Dispatch<React.SetStateAction<OrderResponse[]>>
  setIsInitialLoad: React.Dispatch<React.SetStateAction<boolean>>
  refetch: () => void
  isLoadingMoreRef: React.MutableRefObject<boolean>
  processingLockRef: React.MutableRefObject<boolean>
  isMountedRef: React.MutableRefObject<boolean>
  onLockChange: (v: boolean) => void
}

const useRefreshHandler = (params: RefreshHandlerParams) => {
  const {
    setPage,
    setFilteredOrderList,
    setIsInitialLoad,
    refetch,
    isLoadingMoreRef,
    processingLockRef,
    isMountedRef,
    onLockChange,
  } = params

  const executeRefresh = useCallback(() => {
    setPage(1)
    setFilteredOrderList([])
    setIsInitialLoad(true)
    isLoadingMoreRef.current = false
    refetch()

    setTimeout(() => {
      processingLockRef.current = false
      onLockChange(false)
    }, REFRESH_DELAY)
  }, [
    setPage,
    setFilteredOrderList,
    setIsInitialLoad,
    isLoadingMoreRef,
    refetch,
    processingLockRef,
    onLockChange,
  ])

  const refresh = useCallback(() => {
    if (!isMountedRef.current || processingLockRef.current) return
    processingLockRef.current = true
    onLockChange(true)
    requestAnimationFrame(executeRefresh)
  }, [isMountedRef, processingLockRef, executeRefresh, onLockChange])

  return refresh
}

// ✅ Memoized item
const MemoizedOrderItem = memo<{
  item: OrderResponse
  purpose: 'purchase' | 'sales'
  onPressItem: (item: OrderResponse) => void
}>(
  ({ item, purpose, onPressItem }) => {
    const handlePress = useCallback(
      () => onPressItem(item),
      [item, onPressItem]
    )
    return <OrderItem item={item} purpose={purpose} onPress={handlePress} />
  },
  (prev, next) =>
    prev.item.id === next.item.id &&
    prev.purpose === next.purpose &&
    prev.item.updated_at === next.item.updated_at
)
MemoizedOrderItem.displayName = 'MemoizedOrderItem'

// ✅ Main component
export const OrderList = memo(function OrderList() {
  const { filter } = useAppSelector(orderState)
  const navigation = useNavigation()
  const { t } = useLanguage()

  const throttledFilter = useThrottledValue(filter, THROTTLE_DELAY)

  const [page, setPage] = useState(1)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [filteredOrderList, setFilteredOrderList] = useState<OrderResponse[]>(
    []
  )
  const [isProcessing, setIsProcessing] = useState(false)

  const isLoadingMoreRef = useRef(false)
  const isMountedRef = useRef(true)

  const { queryParamsListOrder } = useOrderFilter(page)

  const { data, isFetching, isLoading, refetch } = useGetOrderListQuery(
    queryParamsListOrder,
    {
      refetchOnMountOrArgChange: true,
      pollingInterval: 0,
      skip: false,
    }
  )

  // keep track unmount for external handlers
  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  // hooks with lock mirroring
  const processingLockRef = useFilterChangeHandler(
    throttledFilter,
    setPage,
    setFilteredOrderList,
    setIsInitialLoad,
    isLoadingMoreRef,
    setIsProcessing
  )

  useDataProcessor(
    data,
    page,
    setIsInitialLoad,
    setFilteredOrderList,
    isLoadingMoreRef,
    processingLockRef,
    setIsProcessing
  )

  // computed
  const hasMoreData = useMemo(
    () => (data ? page < (data.total_page ?? 0) : false),
    [data, page]
  )

  const shouldShowLoading = useMemo(
    () => (isLoading || isFetching) && isInitialLoad,
    [isLoading, isFetching, isInitialLoad]
  )

  const isLoadingMore = useMemo(
    () => isFetching && page > 1 && !isInitialLoad,
    [isFetching, page, isInitialLoad]
  )

  const loadMore = useLoadMoreHandler({
    isLoading,
    isFetching,
    hasMoreData,
    filteredOrderList,
    setPage,
    isLoadingMoreRef,
    processingLockRef,
    isMountedRef,
    onLockChange: setIsProcessing,
  })

  const refresh = useRefreshHandler({
    setPage,
    setFilteredOrderList,
    setIsInitialLoad,
    refetch,
    isLoadingMoreRef,
    processingLockRef,
    isMountedRef,
    onLockChange: setIsProcessing,
  })

  const onPressItem = useCallback(
    (item: OrderResponse) => {
      navigation.navigate('OrderDetail' as never, item as never)
    },
    [navigation]
  )

  const keyExtractor = useCallback(
    (item: OrderResponse) => `order-${item.id}`,
    []
  )

  const renderItem: ListRenderItem<OrderResponse> = useCallback(
    ({ item }) => (
      <MemoizedOrderItem
        item={item}
        purpose={throttledFilter.purpose}
        onPressItem={onPressItem}
      />
    ),
    [throttledFilter.purpose, onPressItem]
  )

  const ListFooterComponent = useMemo(() => {
    if (!isLoadingMore) return null
    return (
      <View className='py-4 items-center'>
        <ActivityIndicator size='small' />
      </View>
    )
  }, [isLoadingMore])

  const ListEmptyComponent = useMemo(() => {
    // tampilkan spinner saat initial fetch atau saat processing aktif
    if (shouldShowLoading || isProcessing) {
      return (
        <View className='flex-1 justify-center items-center'>
          <ActivityIndicator size='large' className='mt-8' />
        </View>
      )
    }

    if (filteredOrderList.length === 0) {
      return (
        <View className='flex-1 justify-center items-center'>
          <EmptyState
            testID='empty-state-order'
            Icon={Icons.IcEmptyStateOrder}
            title={t('empty_state.no_data_available')}
            subtitle={t('empty_state.no_orders_message')}
          />
        </View>
      )
    }

    return null
  }, [shouldShowLoading, isProcessing, filteredOrderList.length, t])

  return (
    <FlatList
      data={filteredOrderList}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      ListEmptyComponent={ListEmptyComponent}
      onEndReached={loadMore}
      onRefresh={refresh}
      refreshing={isLoading && page === 1}
      onEndReachedThreshold={0.5}
      ListFooterComponent={ListFooterComponent}
      contentContainerClassName='flex-grow'
      removeClippedSubviews
      maxToRenderPerBatch={3}
      updateCellsBatchingPeriod={250}
      initialNumToRender={5}
      windowSize={3}
      getItemLayout={undefined}
      extraData={throttledFilter.purpose}
    />
  )
})
