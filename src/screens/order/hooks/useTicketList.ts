import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import {
  EventReportItem,
  GetEventReportFilters,
} from '@/models/order/EventReport'
import { useAppSelector, ticketState } from '@/services/store'

interface UseTicketListProps {
  readonly filter: GetEventReportFilters
}

export function useTicketList({ filter }: UseTicketListProps) {
  const navigation = useNavigation()
  const { ticketList, isLoading: isFetching } = useAppSelector(ticketState)

  const [page, setPage] = useState(1)
  const [tickets, setTickets] = useState<EventReportItem[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [isFetchingMore, setIsFetchingMore] = useState(false)
  const [isEndReached, setIsEndReached] = useState(false)
  const prevFilterRef = useRef<GetEventReportFilters>()

  useFocusEffect(
    useCallback(() => {
      setPage(1)
      setTickets([])
      setHasMore(true)
      setIsEndReached(false)
      setIsFetchingMore(false)

      return () => {}
    }, [])
  )

  useEffect(() => {
    if (ticketList?.data) {
      setTickets((prevTickets) =>
        page === 1 ? ticketList.data : [...prevTickets, ...ticketList.data]
      )
      setHasMore(page < (ticketList.total_page ?? 1))
    }
  }, [ticketList, page, filter.status, filter.order_id_do_number])

  useEffect(() => {
    const filterChanged =
      JSON.stringify(prevFilterRef.current) !== JSON.stringify(filter)

    if (filterChanged) {
      setPage(1)
      setTickets([])
      setHasMore(true)
      setIsEndReached(false)
      setIsFetchingMore(false)
      prevFilterRef.current = { ...filter }
    }
  }, [filter])

  useEffect(() => {
    if (ticketList?.data) {
      setIsFetchingMore(false)
    }
  }, [ticketList])

  const fetchMoreTickets = useCallback(() => {
    if (!hasMore || isFetchingMore || isEndReached) return

    if (ticketList && page < ticketList.total_page) {
      setIsFetchingMore(true)
      setPage((prevPage) => prevPage + 1)
    }
  }, [hasMore, isFetchingMore, isEndReached, ticketList, page])

  const handleEndReached = useCallback(() => {
    if (!isEndReached) {
      fetchMoreTickets()
      setIsEndReached(true)
    }
  }, [isEndReached, fetchMoreTickets])

  const handleMomentumScrollBegin = useCallback(() => {
    setIsEndReached(false)
  }, [])

  const onPressItem = useCallback(
    (item: EventReportItem) =>
      navigation.navigate('TicketDetail', { id: item.id }),
    [navigation]
  )

  const keyExtractor = useCallback(
    (item: EventReportItem, index: number) => `${item.id}-${index}`,
    []
  )

  const isEmpty =
    !isFetching && (!ticketList?.data || ticketList.data.length === 0)

  return {
    tickets,
    isFetching,
    isFetchingMore,
    ticketList,
    isEmpty,
    handleEndReached,
    handleMomentumScrollBegin,
    onPressItem,
    keyExtractor,
  }
}
