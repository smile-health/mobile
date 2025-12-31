/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useCallback } from 'react'
import { useNavigation } from '@react-navigation/native'
import {
  EventReportItem,
  GetEventReportFilters,
} from '@/models/order/EventReport'
import { useGetEventReportListQuery } from '@/services/apis/event-report.api'

interface UseTicketDataProps {
  baseFilter: GetEventReportFilters
  tabKey: string
  onDataUpdate: (
    tabKey: string,
    data: {
      tickets: EventReportItem[]
      page: number
      hasMore: boolean
      isLoading: boolean
      isFetchingMore: boolean
      lastFetchedFilter: GetEventReportFilters
      total_item?: number
    }
  ) => void
}

export function useTicketData({
  baseFilter,
  tabKey,
  onDataUpdate,
}: UseTicketDataProps) {
  const navigation = useNavigation()

  const [page, setPage] = useState(1)
  const [tickets, setTickets] = useState<EventReportItem[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [isEndReached, setIsEndReached] = useState(false)
  const [isFetchingMore, setIsFetchingMore] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(false)
  const [lastFetchedFilter, setLastFetchedFilter] =
    useState<GetEventReportFilters | null>(null)

  const mergedFilter: GetEventReportFilters = {
    ...baseFilter,
    page,
  }

  const {
    data: ticketResponse,
    isLoading: isQueryLoading,
    isFetching,
    error,
    refetch,
  } = useGetEventReportListQuery(mergedFilter, {
    skip: false,
    refetchOnMountOrArgChange: true,
  })

  useEffect(() => {
    const isFirstPage = page === 1
    const newIsLoading = isQueryLoading && isFirstPage
    const newIsFetchingMore = isFetching && !isFirstPage

    setIsInitialLoading(newIsLoading)
    setIsFetchingMore(newIsFetchingMore)
  }, [isQueryLoading, isFetching, page])

  useEffect(() => {
    if (ticketResponse?.data) {
      const isFirstPage = page === 1
      const newTickets = isFirstPage
        ? ticketResponse.data
        : [...tickets, ...ticketResponse.data]

      const more =
        page < (ticketResponse.total_page ?? 1) &&
        ticketResponse.data.length > 0

      setTickets(newTickets)
      setHasMore(more)
      setLastFetchedFilter(mergedFilter)

      onDataUpdate(tabKey, {
        tickets: newTickets,
        page,
        hasMore: more,
        isLoading: false,
        isFetchingMore: false,
        lastFetchedFilter: mergedFilter,
        total_item: ticketResponse.total_item || 0,
      })
    }
  }, [ticketResponse])

  useEffect(() => {
    if (error) {
      onDataUpdate(tabKey, {
        tickets,
        page,
        hasMore,
        isLoading: false,
        isFetchingMore: false,
        lastFetchedFilter: lastFetchedFilter || mergedFilter,
        total_item: 0,
      })
    }
  }, [error])

  const loadMore = useCallback(() => {
    if (!hasMore || isFetchingMore || isInitialLoading) return
    setPage((prev) => prev + 1)
  }, [hasMore, isFetchingMore, isInitialLoading])

  const handleEndReached = useCallback(() => {
    if (!isEndReached && hasMore) {
      loadMore()
      setIsEndReached(true)
    }
  }, [isEndReached, hasMore, loadMore])

  const handleMomentumScrollBegin = useCallback(() => {
    setIsEndReached(false)
  }, [])

  const onPressItem = useCallback(
    (item: EventReportItem) => {
      navigation.navigate('TicketDetail', { id: item.id })
    },
    [navigation]
  )

  const keyExtractor = useCallback(
    (item: EventReportItem, index: number) => `${tabKey}-${item.id}-${index}`,
    [tabKey]
  )

  const isEmpty = !isInitialLoading && tickets.length === 0

  return {
    tickets,
    isLoading: isInitialLoading,
    isFetchingMore,
    hasMore,
    isEmpty,
    error,
    handleEndReached,
    handleMomentumScrollBegin,
    onPressItem,
    keyExtractor,
    loadMore,
    refetch,
  }
}
