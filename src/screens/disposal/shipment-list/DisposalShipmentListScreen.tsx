import React, { useCallback, useRef, useState } from 'react'
import { FlatList, View } from 'react-native'
import PagerView, {
  PagerViewOnPageSelectedEvent,
} from 'react-native-pager-view'
import LoadingDialog from '@/components/LoadingDialog'
import { SearchToolbarAction } from '@/components/toolbar/actions/SearchToolbarAction'
import { useSearchBar } from '@/components/toolbar/hooks/useSearchBar'
import { useLanguage } from '@/i18n/useLanguage'
import { IOptions } from '@/models/Common'
import DisposalShipmentFilter from '../components/shipment-list/DisposalShipmentFilter'
import DisposalShipmentList from '../components/shipment-list/DisposalShipmentList'
import { disposalStatusTabs } from '../disposal-constant'
import useDisposalShipmentList from '../hooks/useDisposalShipmentList'

const pagerViewStyle = { flexGrow: 1 }
export default function DisposalShipmentListScreen() {
  const {
    isSender,
    data,
    filter,
    statusCounts,
    isLoadMore,
    shouldShowLoading,
    handleApplyFilter,
    handleRefresh,
    handleLoadMore,
  } = useDisposalShipmentList()

  const { t } = useLanguage()
  const [isSearch, setIsSearch] = useState(false)
  const [activeTab, setActiveTab] = useState(0)

  const tabRef = useRef<FlatList<IOptions>>(null)
  const pagerViewRef = useRef<PagerView>(null)

  const handleSelectTab = useCallback((index: number) => {
    setActiveTab(index)
    pagerViewRef.current?.setPage(index)
  }, [])

  const handlePageSelected = (event: PagerViewOnPageSelectedEvent) => {
    const { position: index } = event.nativeEvent
    handleApplyFilter({ status: disposalStatusTabs[index].value })
    setActiveTab(index)
    tabRef.current?.scrollToIndex({ animated: true, index })
  }

  const toggleSearch = () => setIsSearch(true)

  const onSubmitSearch = (shippedNumber: string) => {
    handleApplyFilter({ shipped_number: shippedNumber })
  }

  useSearchBar({
    isSearch,
    setIsSearch,
    onSubmitSearch,
    placeholder: t('disposal.shipment_number'),
    keyboardType: 'number-pad',
    toolbarProps: {
      title: t('home.menu.list_disposal'),
      withDefaultSubtitle: true,
      actions: (
        <SearchToolbarAction
          onSearch={toggleSearch}
          onRefresh={handleRefresh}
        />
      ),
    },
  })

  return (
    <View className='bg-white flex-1'>
      <DisposalShipmentFilter
        ref={tabRef}
        isSender={isSender}
        activeTab={activeTab}
        filter={filter}
        statusCounts={statusCounts}
        onApplyFilter={handleApplyFilter}
        onSelectTab={handleSelectTab}
      />
      <PagerView
        ref={pagerViewRef}
        initialPage={0}
        style={pagerViewStyle}
        onPageSelected={handlePageSelected}>
        {disposalStatusTabs.map((item) => (
          <DisposalShipmentList
            key={item.value}
            isSender={isSender}
            data={data}
            isLoadMore={isLoadMore}
            onEndReached={handleLoadMore}
          />
        ))}
      </PagerView>
      <LoadingDialog
        testID='loadingdialog-disposal-shipment-list'
        modalVisible={shouldShowLoading}
      />
    </View>
  )
}
