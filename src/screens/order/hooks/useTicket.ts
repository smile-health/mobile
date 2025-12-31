import { useCallback, useState, useEffect, useRef } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import { useForm } from 'react-hook-form'
import { GetEventReportFilters } from '@/models/order/EventReport'
import { setTicketFilter } from '@/services/features/ticket.slice'
import { ticketState, useAppDispatch, useAppSelector } from '@/services/store'
import { useEventReportCount } from './useEventReportCount'
import { useTicketTabManager } from './useTicketTabManager'

export function useTicket() {
  const dispatch = useAppDispatch()
  const { filter } = useAppSelector(ticketState)
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false)
  const [shouldRefetch, setShouldRefetch] = useState(false)
  const prevFilterRef = useRef<GetEventReportFilters | null>(null)

  const {
    control,
    formState: { errors },
  } = useForm({
    defaultValues: { searchTicket: '' },
  })

  const { statusItems, refetch: refetchCounts } = useEventReportCount()

  const {
    currentTab,
    currentTabKey,
    pagerRef,
    getTabData,
    updateTabData,
    getFilterForTab,
    handleTabPress: tabManagerHandleTabPress,
    handlePageSelected,
    handleSearch: tabManagerHandleSearch,
    resetAllTabs,
  } = useTicketTabManager({ statusItems: statusItems || [] })

  useFocusEffect(
    useCallback(() => {
      refetchCounts()
    }, [refetchCounts])
  )

  useEffect(() => {
    const prevFilter = prevFilterRef.current

    if (prevFilter) {
      const filterFieldsToCheck: (keyof GetEventReportFilters)[] = [
        'from_arrived_date',
        'to_arrived_date',
        'entity_id',
      ]

      const hasFilterChanged = filterFieldsToCheck.some(
        (field) => prevFilter[field] !== filter[field]
      )

      if (hasFilterChanged) {
        resetAllTabs()
      }
    }

    prevFilterRef.current = filter
  }, [filter, resetAllTabs])

  const toggleFilterSheet = () => {
    setIsFilterSheetOpen(!isFilterSheetOpen)
  }

  const handleTabPress = useCallback(
    (index: number) => {
      tabManagerHandleTabPress(index)

      if (statusItems && statusItems.length > 0) {
        const selectedStatus = statusItems[index]?.status_id
        const statusFilter =
          selectedStatus === null ? undefined : String(selectedStatus)

        dispatch(
          setTicketFilter({
            ...filter,
            status: statusFilter,
            page: 1,
          })
        )
      }
    },
    [tabManagerHandleTabPress, dispatch, statusItems, filter]
  )

  const handleRefresh = useCallback(() => {
    setShouldRefetch(true)
    setTimeout(() => setShouldRefetch(false), 100)
    resetAllTabs()
    refetchCounts()
  }, [resetAllTabs, refetchCounts])

  const handleSearch = useCallback(
    (text: string) => {
      if (filter.order_id_do_number === text) {
        return
      }

      tabManagerHandleSearch(text)

      setTimeout(() => {
        dispatch(
          setTicketFilter({
            ...filter,
            order_id_do_number: text === '' ? undefined : text,
            page: 1,
          })
        )

        if (text === '') {
          resetAllTabs()
          refetchCounts()
        }
      }, 50)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tabManagerHandleSearch, dispatch, filter]
  )

  return {
    filter,
    currentTab,
    currentTabKey,
    isFilterSheetOpen,
    shouldRefetch,
    pagerRef,
    control,
    errors,
    statusItems,
    getTabData,
    updateTabData,
    getFilterForTab,
    handlePageSelected,
    toggleFilterSheet,
    handleTabPress,
    handleRefresh,
    handleSearch,
  }
}
