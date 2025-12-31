import React, { useCallback, useMemo, useRef, useState } from 'react'
import { SafeAreaView } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import PagerView from 'react-native-pager-view'
import LoadingDialog from '@/components/LoadingDialog'
import { SearchToolbarAction } from '@/components/toolbar/actions/SearchToolbarAction'
import { useSearchBar } from '@/components/toolbar/hooks/useSearchBar'
import { useOrderNotif } from '@/hooks/useOrderNotif'
import { useLanguage } from '@/i18n/useLanguage'
import {
  useGetOrderListQuery,
  useGetOrderStatusCountQuery,
} from '@/services/apis'
import { getActivityOption } from '@/services/features'
import { setOrderFilter } from '@/services/features/order.slice'
import { cvaState, useAppDispatch, useAppSelector } from '@/services/store'
import { ORDER_STATUS, orderStatusNames } from '@/utils/Constants'
import { OrderFilter, OrderStatusRef } from './component/OrderFilter'
import OrderFilterBottomSheet from './component/OrderFilterBottomSheet'
import { OrderList } from './component/OrderList'
import { usePageSelectionHandler } from './hooks/list/usePageSelectionHandler'
import { useTabChangeHandler } from './hooks/list/usePurposeChangeHandler'
import { useRefreshHandler } from './hooks/list/useRefreshHandler'
import { useOrderFilter } from './hooks/useOrderFilter'

// Constants
const DEFAULT_PAGE = 1
const INITIAL_TAB_INDEX = 0
const PAGER_VIEW_STYLE = { flexGrow: 1 }

// ✅ OPTIMIZATION: Stable order statuses creation outside component
const createOrderStatuses = (t: any) => [
  {
    index: 0,
    orderStatusId: ORDER_STATUS.ALL,
    title: t('order.status.all'),
    testID: 'tab-all',
  },
  {
    index: 1,
    orderStatusId: ORDER_STATUS.DRAFT,
    title: t('order.status.draft'),
    testID: 'tab-draft',
  },
  ...Object.entries(orderStatusNames).map(([id, label]) => ({
    index: Number(id) + 1,
    orderStatusId: Number(id),
    title: t(label),
    testID: `tab-${label}`,
  })),
]

export default function OrderListScreen() {
  const { cva } = useAppSelector(cvaState)
  const activityList = useAppSelector(getActivityOption)
  const {
    orderNotif,
    isLoading: isOrderNotifLoading,
    refetch,
  } = useOrderNotif()

  const { queryParamsListOrder, queryParamsStatusCountOrder } =
    useOrderFilter(DEFAULT_PAGE)

  const { t } = useLanguage()
  const dispatch = useAppDispatch()

  const {
    isLoading: isOrderListLoading,
    refetch: refetchOrderList,
    isFetching: isOrderListFetching,
  } = useGetOrderListQuery(queryParamsListOrder)

  const {
    data: orderStatusData,
    isLoading: isOrderStatusLoading,
    refetch: refetchOrderStatus,
  } = useGetOrderStatusCountQuery(queryParamsStatusCountOrder)

  const [isSearch, setIsSearch] = useState(false)
  const [activeTab, setActiveTab] = useState(INITIAL_TAB_INDEX)
  const [isOpen, setIsOpen] = useState(false)

  const tabRef = useRef<OrderStatusRef>(null)
  const pagerViewRef = useRef<PagerView>(null)

  // ✅ REFACTOR: Use extracted custom hooks
  const onSelectTab = useTabChangeHandler(
    pagerViewRef as React.RefObject<PagerView>,
    setActiveTab
  )
  const onPageSelected = usePageSelectionHandler(
    dispatch,
    setActiveTab,
    tabRef as React.RefObject<OrderStatusRef>
  )
  const { onRefresh, focusEffectCallback } = useRefreshHandler(
    refetchOrderList,
    refetchOrderStatus,
    refetch,
    orderNotif,
    dispatch
  )

  // ✅ OPTIMIZATION: Memoize order statuses with stable dependencies
  const orderStatuses = useMemo(() => createOrderStatuses(t), [t])

  const toggleBottomSheet = useCallback(() => {
    setIsOpen((prev) => !prev)
  }, [])

  const toggleSearch = useCallback(() => {
    setIsSearch(true)
  }, [])

  const onSubmitSearch = useCallback(
    (text: string) => {
      dispatch(
        setOrderFilter({
          order_number: text || null,
        })
      )
    },
    [dispatch]
  )

  // ✅ OPTIMIZATION: Stable search bar config with minimal dependencies
  const searchBarConfig = useMemo(
    () => ({
      placeholder: t('order.search_order_placeholder'),
      keyboardType: 'numeric' as const,
      toolbarProps: {
        title: t('title.view_order'),
        withDefaultSubtitle: true,
        actions: (
          <SearchToolbarAction onSearch={toggleSearch} onRefresh={onRefresh} />
        ),
      },
    }),
    [t, onRefresh, toggleSearch]
  )

  useSearchBar({
    isSearch,
    setIsSearch,
    onSubmitSearch,
    ...searchBarConfig,
  })

  useFocusEffect(focusEffectCallback)

  // ✅ OPTIMIZATION: Simple loading state without over-computation
  const isLoading =
    isOrderListLoading ||
    isOrderListFetching ||
    isOrderStatusLoading ||
    isOrderNotifLoading

  // ✅ OPTIMIZATION: Stable CVA data with specific dependencies
  const cvaData = useMemo(
    () => ({
      vendors: cva.vendors || [],
      customers: cva.customers || [],
      activities: cva.origin_activities || [],
    }),
    [cva.vendors, cva.customers, cva.origin_activities]
  )

  return (
    <SafeAreaView className='flex-1 bg-white'>
      <OrderFilter
        ref={tabRef}
        vendor={cvaData.vendors}
        customer={cvaData.customers}
        activities={cvaData.activities}
        statuses={orderStatuses}
        activeTab={activeTab}
        notif={orderNotif?.order_not_received}
        onSelectTab={onSelectTab}
        orderStatusData={orderStatusData?.data || []}
        toggleBottomSheet={toggleBottomSheet}
      />

      <PagerView
        ref={pagerViewRef}
        initialPage={INITIAL_TAB_INDEX}
        style={PAGER_VIEW_STYLE}
        onPageSelected={onPageSelected}>
        {orderStatuses.map((item) => (
          <OrderList key={item.orderStatusId} />
        ))}
      </PagerView>

      <OrderFilterBottomSheet
        isOpen={isOpen}
        name='OrderFilterBottomSheet'
        toggleSheet={toggleBottomSheet}
        vendor={cvaData.vendors}
        customer={cvaData.customers}
        activities={activityList}
      />

      <LoadingDialog
        testID='loadingdialog-load-order'
        modalVisible={isLoading}
      />
    </SafeAreaView>
  )
}
