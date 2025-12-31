import React, { useCallback, useMemo, useState } from 'react'
import { View, RefreshControl } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import PagerView from 'react-native-pager-view'
import LoadingDialog from '@/components/LoadingDialog'
import { SearchToolbarAction } from '@/components/toolbar/actions/SearchToolbarAction'
import { useSearchBar } from '@/components/toolbar/hooks/useSearchBar'
import { useLanguage } from '@/i18n/useLanguage'
import { ticketState, useAppSelector } from '@/services/store'
import { flexStyle } from '@/theme/AppStyles'
import { TicketFilter } from '../component/ticket/TicketFilter'
import TicketFilterBottomSheet from '../component/ticket/TicketFilterBottomSheet'
import { TicketTabContent } from '../component/ticket/TicketTabContent'
import { useTicket } from '../hooks/useTicket'

interface StatusItem {
  orderType: number | null
  title: string
  testID: string
}

const ViewListTicketScreen = () => {
  const { t } = useLanguage()
  const [isSearch, setIsSearch] = useState(false)
  const { isLoading: globalLoading } = useAppSelector(ticketState)

  const {
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
  } = useTicket()

  useFocusEffect(
    useCallback(() => {
      handleRefresh()
    }, [handleRefresh])
  )

  const toggleSearch = () => {
    setIsSearch(true)
  }

  const onSubmitSearch = (text: string) => {
    handleSearch(text)
  }

  useSearchBar({
    isSearch,
    setIsSearch,
    onSubmitSearch,
    placeholder: t('ticket.search_ticket_placeholder'),
    keyboardType: 'default',
    toolbarProps: {
      title: t('title.view_list_ticket'),
      withDefaultSubtitle: true,
      actions: (
        <SearchToolbarAction
          onSearch={toggleSearch}
          onRefresh={handleRefresh}
        />
      ),
    },
  })

  const statuses = useMemo(() => {
    const result = (statusItems || []).map((item) => ({
      orderType: item.status_id,
      title: item.label,
      count: item.count,
      testID: `tab-${item.label}`,
    }))
    return result
  }, [statusItems])

  const getTabKeyForStatus = useCallback((status: StatusItem) => {
    return status.orderType === null ? 'all' : String(status.orderType)
  }, [])

  const renderRefreshControl = useMemo(
    () => <RefreshControl refreshing={false} onRefresh={handleRefresh} />,
    [handleRefresh]
  )

  const getStatusKey = useCallback(
    (status: StatusItem) =>
      `status-${status.orderType ?? 'all'}-${status.testID}`,
    []
  )

  const renderTicketListPage = useCallback(
    (status: StatusItem) => {
      const tabKey = getTabKeyForStatus(status)
      const tabFilter = getFilterForTab(tabKey)

      return (
        <View key={getStatusKey(status)} className='flex-1'>
          <TicketTabContent
            baseFilter={tabFilter}
            tabKey={tabKey}
            refreshControl={renderRefreshControl}
            onDataUpdate={updateTabData}
            shouldRefetch={shouldRefetch}
          />
        </View>
      )
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      getTabKeyForStatus,
      getFilterForTab,
      getStatusKey,
      renderRefreshControl,
      updateTabData,
    ]
  )

  return (
    <View className='flex-1 bg-white'>
      <TicketFilter
        control={control}
        countAll={getTabData(currentTabKey).total_item}
        errors={errors}
        onPressFilter={toggleFilterSheet}
        currentTab={currentTab}
        onTabPress={handleTabPress}
        statuses={statuses}
        activeTab={currentTab}
        onSelectTab={handleTabPress}
        toggleBottomSheet={toggleFilterSheet}
      />

      <PagerView
        ref={pagerRef}
        style={flexStyle}
        initialPage={0}
        onPageSelected={handlePageSelected}
        offscreenPageLimit={3}
        key={`pager-view-${statuses.length}`}>
        {statuses.map((element) => {
          return renderTicketListPage(element)
        })}
      </PagerView>

      <TicketFilterBottomSheet
        name='ticket-filter-bottom-sheet'
        isOpen={isFilterSheetOpen}
        toggleSheet={toggleFilterSheet}
      />

      <LoadingDialog
        modalVisible={getTabData(currentTabKey).isLoading || globalLoading}
        testID='ticket-loading-dialog'
      />
    </View>
  )
}

export default ViewListTicketScreen
