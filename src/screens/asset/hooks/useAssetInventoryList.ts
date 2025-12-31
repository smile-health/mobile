import { useCallback, useEffect, useState } from 'react'
import {
  AssetInventory,
  AssetInventoryQueryParams,
} from '@/models/asset-inventory/AssetInventory'
import { useGetAssetInventoryListQuery } from '@/services/apis/asset-inventory.api'

interface UseAssetInventoryListProps {
  searchText?: string
  statusId?: number | null
}

export const useAssetInventoryList = ({
  searchText,
  statusId,
}: UseAssetInventoryListProps) => {
  const [isSearch, setIsSearch] = useState(false)
  const [page, setPage] = useState(1)
  const [filteredAssetList, setFilteredAssetList] = useState<AssetInventory[]>(
    []
  )

  // Prepare query params
  const queryParams: AssetInventoryQueryParams = {
    page: page,
    paginate: 10,
    keyword: searchText ?? '',
  }

  // Add filter params if provided
  if (statusId !== null && statusId !== undefined && statusId !== 0) {
    queryParams.working_status_id = statusId.toString()
  }

  // Add search text as keyword if provided
  if (searchText) {
    queryParams.keyword = searchText
  }

  // Get data from API
  const { data, isLoading, isFetching, refetch } =
    useGetAssetInventoryListQuery(queryParams, {
      refetchOnMountOrArgChange: true,
    })

  // Determine if there's more data to load
  const hasMoreData = data ? page < data.total_page : false
  const totalItems = data?.total_item || 0

  useEffect(() => {
    if (!data) return
    setFilteredAssetList(data.data)
  }, [data])

  // Load more data
  const loadMore = useCallback(() => {
    if (!isLoading && !isFetching && hasMoreData) {
      setPage((prevPage) => prevPage + 1)
    }
  }, [isLoading, isFetching, hasMoreData])

  // Refresh data
  const refresh = useCallback(() => {
    setPage(1)
    refetch()
  }, [refetch])

  const toggleSearch = () => {
    setIsSearch(true)
  }

  return {
    assetList: filteredAssetList,
    isLoading,
    isFetching,
    hasMoreData,
    totalItems,
    loadMore,
    refresh,
    shouldShowLoading: isLoading || isFetching,
    page,
    isSearch,
    setIsSearch,
    toggleSearch,
  }
}
