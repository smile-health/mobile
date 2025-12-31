import { useCallback, useMemo, useState } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import { IDisposalShipmentFilter } from '@/models/disposal/DisposalShipmentList'
import {
  useGetDisposalShipmentCountQuery,
  useGetDisposalShipmentListInfiniteQuery,
} from '@/services/apis'
import { DISPOSAL_PURPOSE } from '../disposal-constant'

const initialFilter: IDisposalShipmentFilter = {
  purpose: DISPOSAL_PURPOSE.SENDER,
  is_vendor: 0,
}

export default function useDisposalShipmentList() {
  const [filter, setFilter] = useState<IDisposalShipmentFilter>(initialFilter)
  const isSender = filter.purpose === DISPOSAL_PURPOSE.SENDER

  const queryParams = {
    ...filter,
    status: filter.status || undefined,
    is_vendor: isSender ? 0 : 1,
  }

  const {
    data,
    isLoading,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useGetDisposalShipmentListInfiniteQuery(queryParams, {
    refetchOnMountOrArgChange: true,
  })

  const { data: statusCounts = [], refetch: refetchStatusCount } =
    useGetDisposalShipmentCountQuery(
      { ...queryParams, status: undefined },
      { refetchOnMountOrArgChange: true }
    )

  const flattenedData = useMemo(() => {
    if (!data?.pages) return []
    return data.pages.flatMap((data) => data.data)
  }, [data?.pages])

  const handleApplyFilter = useCallback((payload: IDisposalShipmentFilter) => {
    const { purpose, ...restPayload } = payload
    setFilter((prevFilter) => ({
      ...(purpose
        ? { ...initialFilter, purpose, status: prevFilter.status }
        : prevFilter),
      ...restPayload,
    }))
  }, [])

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  const handleRefresh = async () => {
    await refetch()
    await refetchStatusCount()
  }

  useFocusEffect(
    useCallback(() => {
      refetch()
      refetchStatusCount()
    }, [refetch, refetchStatusCount])
  )

  return {
    isSender,
    filter,
    data: flattenedData,
    statusCounts,
    shouldShowLoading: (isLoading || isFetching) && !isFetchingNextPage,
    isLoadMore: isFetchingNextPage,
    handleRefresh,
    handleApplyFilter,
    handleLoadMore,
  }
}
