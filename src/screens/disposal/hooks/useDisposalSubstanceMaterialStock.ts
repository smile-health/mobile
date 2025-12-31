import { useCallback, useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import {
  DisposalDetailMaterialItem,
  DisposalStockItemResponse,
  DisposalStockQueryParams,
  DisposalStockSelectedItem,
} from '@/models/disposal/DisposalStock'
import { useGetDisposalStockQuery } from '@/services/apis'
import { setSelectedDisposalStock } from '@/services/features/disposal.slice'
import {
  stockState,
  useAppDispatch,
  useAppSelector,
  workspaceState,
} from '@/services/store'
import { PAGE_SIZE } from '@/utils/Constants'
import { transformDisposalStockItemToSelectedItem } from '../helper/DisposalStockHelpers'

interface UseDisposalSubstanceMaterialStockProps {
  searchText?: string
}

export const useDisposalSubstanceMaterialStock = ({
  searchText,
}: UseDisposalSubstanceMaterialStockProps) => {
  const { stockActivity } = useAppSelector(stockState)
  const { selectedWorkspace } = useAppSelector(workspaceState)
  const dispatch = useAppDispatch()

  const [page, setPage] = useState(1)
  const [filteredStockList, setFilteredStockList] = useState<
    DisposalStockItemResponse[]
  >([])

  // Prepare query params
  const queryParams: DisposalStockQueryParams = {
    page: page,
    paginate: PAGE_SIZE,
    activity_id: stockActivity?.id,
    entity_id: selectedWorkspace?.entity_id,
    only_have_qty: 1,
    ...(searchText && { keyword: searchText }),
  }

  // Use RTK Query hook for API call
  const { data, isLoading, isFetching, refetch } = useGetDisposalStockQuery(
    queryParams,
    { refetchOnMountOrArgChange: true }
  )

  // Determine if there's more data to load
  const hasMoreData = data ? page < data.total_page : false
  const totalItems = data?.total_item ?? 0

  useEffect(() => {
    if (!data) return

    // Implement pagination similar to working ticket list hook
    setFilteredStockList((prevList) => {
      const newList = page === 1 ? data.data : [...prevList, ...data.data]
      return newList
    })
  }, [data, page])

  // Reset pagination when search text changes
  useEffect(() => {
    setPage(1)
    setFilteredStockList([])
  }, [searchText])

  // Load more data
  const loadMore = useCallback(() => {
    if (!isLoading && !isFetching && hasMoreData) {
      setPage((prevPage) => prevPage + 1)
    }
  }, [isLoading, isFetching, hasMoreData])

  // Refresh data
  const refresh = useCallback(() => {
    setPage(1)
    setFilteredStockList([])
    refetch()
  }, [refetch])

  // Reset search
  const resetSearch = useCallback(() => {
    setPage(1)
    setFilteredStockList([])
  }, [])

  const shouldShowLoading = isFetching ?? isLoading

  const navigation = useNavigation()

  const navigateToTrademarkMaterialList = (
    stock: DisposalStockItemResponse | DisposalDetailMaterialItem
  ) => {
    if ('entity_id' in stock) {
      const selectedStock: DisposalStockSelectedItem =
        transformDisposalStockItemToSelectedItem(stock)
      dispatch(setSelectedDisposalStock(selectedStock))
      navigation.navigate('DisposalTrademarkMaterialSelect')
    }
  }

  return {
    stockActivity,
    stockList: filteredStockList,
    isLoading,
    isFetching,
    hasMoreData,
    totalItems,
    loadMore,
    refresh,
    shouldShowLoading,
    page,
    resetSearch,
    navigateToTrademarkMaterialList,
  }
}
