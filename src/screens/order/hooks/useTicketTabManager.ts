import { useCallback, useMemo, useRef, useState } from 'react'
import PagerView from 'react-native-pager-view'
import {
  EventReportItem,
  GetEventReportFilters,
} from '@/models/order/EventReport'
import { useAppSelector, ticketState } from '@/services/store'
import { PAGE_SIZE } from '@/utils/Constants'

interface TabData {
  tickets: EventReportItem[]
  page: number
  hasMore: boolean
  isLoading: boolean
  isFetchingMore: boolean
  searchQuery: string
  lastFetchedFilter: GetEventReportFilters | null
  total_item?: number
}

interface UseTicketTabManagerProps {
  statusItems: Array<{ status_id: number | null; label: string; count: number }>
}

export function useTicketTabManager({ statusItems }: UseTicketTabManagerProps) {
  const { filter } = useAppSelector(ticketState)
  const [currentTab, setCurrentTab] = useState(0)
  const pagerRef = useRef<PagerView>(null)

  const [tabsData, setTabsData] = useState<Map<string, TabData>>(new Map())

  const getTabKey = useCallback((statusId: number | null): string => {
    return statusId === null ? 'all' : String(statusId)
  }, [])

  const currentTabKey = useMemo(() => {
    if (!statusItems || statusItems.length === 0) return 'all'
    const currentStatus = statusItems[currentTab]?.status_id
    return getTabKey(currentStatus)
  }, [currentTab, statusItems, getTabKey])

  const initializeTabData = useCallback((): TabData => {
    return {
      tickets: [],
      page: 1,
      hasMore: true,
      isLoading: false,
      isFetchingMore: false,
      searchQuery: '',
      lastFetchedFilter: null,
      total_item: 0,
    }
  }, [])

  const getTabData = useCallback(
    (tabKey: string): TabData => {
      const data = tabsData.get(tabKey) || initializeTabData()
      return data
    },
    [tabsData, initializeTabData]
  )

  const updateTabData = useCallback(
    (tabKey: string, updates: Partial<TabData>) => {
      setTabsData((prev) => {
        const newMap = new Map(prev)
        const currentData = newMap.get(tabKey) || initializeTabData()
        const updatedData = { ...currentData, ...updates }
        newMap.set(tabKey, updatedData)

        return newMap
      })
    },
    [initializeTabData]
  )

  const getFilterForTab = useCallback(
    (tabKey: string, searchQuery?: string): GetEventReportFilters => {
      const statusId = tabKey === 'all' ? undefined : tabKey
      const tabData = getTabData(tabKey)

      return {
        ...filter,
        status: statusId,
        page: tabData.page,
        paginate: PAGE_SIZE,
        order_id_do_number: searchQuery ?? tabData.searchQuery,
      }
    },
    [filter, getTabData]
  )

  const hasFilterChanged = useCallback(
    (tabKey: string, newFilter: GetEventReportFilters): boolean => {
      const tabData = getTabData(tabKey)
      const lastFilter = tabData.lastFetchedFilter

      if (!lastFilter) return true

      const fieldsToCompare: (keyof GetEventReportFilters)[] = [
        'status',
        'order_id_do_number',
        'entity_id',
        'from_arrived_date',
        'to_arrived_date',
      ]

      return fieldsToCompare.some(
        (field) => lastFilter[field] !== newFilter[field]
      )
    },
    [getTabData]
  )

  const resetTabIfNeeded = useCallback(
    (tabKey: string, newFilter: GetEventReportFilters) => {
      if (hasFilterChanged(tabKey, newFilter)) {
        updateTabData(tabKey, {
          tickets: [],
          page: 1,
          hasMore: true,
          isLoading: true,
          isFetchingMore: false,
          lastFetchedFilter: newFilter,
        })
      } else {
        updateTabData(tabKey, { isLoading: true })
      }
    },
    [hasFilterChanged, updateTabData]
  )

  const handleTabPress = useCallback((index: number) => {
    setCurrentTab(index)
    pagerRef.current?.setPage(index)
  }, [])

  const handlePageSelected = useCallback((e: any) => {
    const newPosition = e.nativeEvent.position
    setCurrentTab(newPosition)
  }, [])

  const handleSearch = useCallback(
    (searchQuery: string) => {
      const currentData = getTabData(currentTabKey)

      if (currentData.searchQuery === searchQuery) {
        return
      }

      setTabsData((prev) => {
        const newMap = new Map()

        for (const [key] of prev.entries()) {
          const tabData = initializeTabData()

          newMap.set(key, {
            ...tabData,
            searchQuery,
            tickets: [],
            page: 1,
            hasMore: true,
            isLoading: true,
            isFetchingMore: false,
            lastFetchedFilter: null,
          })
        }

        if (newMap.size === 0) {
          newMap.set(currentTabKey, {
            ...initializeTabData(),
            searchQuery,
            tickets: [],
            page: 1,
            hasMore: true,
            isLoading: true,
            isFetchingMore: false,
            lastFetchedFilter: null,
          })
        }

        return newMap
      })
    },
    [currentTabKey, initializeTabData, getTabData]
  )

  const clearSearch = useCallback(() => {
    if (getTabData(currentTabKey).searchQuery !== '') {
      handleSearch('')
    }
  }, [handleSearch, getTabData, currentTabKey])

  const resetAllTabs = useCallback(() => {
    setTabsData(new Map())
    setCurrentTab(0)
  }, [])

  return {
    currentTab,
    currentTabKey,
    pagerRef,
    tabsData,
    getTabData,
    updateTabData,
    getFilterForTab,
    resetTabIfNeeded,
    handleTabPress,
    handlePageSelected,
    handleSearch,
    clearSearch,
    resetAllTabs,
  }
}
