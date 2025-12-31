import React, { forwardRef, useCallback, useMemo, useState } from 'react'
import { View, Text, FlatList, ListRenderItem } from 'react-native'
import { Icons } from '@/assets/icons'
import { Button, ImageButton } from '@/components/buttons'
import { PopupMenu } from '@/components/menu/PopupMenu'
import { TabItem } from '@/components/tabs/TabItem'
import { useLanguage } from '@/i18n/useLanguage'
import { Activity, BaseEntity, NotifResponse, OrderStatusData } from '@/models'
import { resetFilter, setOrderFilter } from '@/services/features/order.slice'
import { orderState, useAppDispatch, useAppSelector } from '@/services/store'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import { concatString, getTestID } from '@/utils/CommonUtils'
import {
  DATE_FORMAT,
  orderIntegrationListNames,
  orderPurposeNames,
  orderTypeNames,
} from '@/utils/Constants'
import { convertString } from '@/utils/DateFormatUtils'
import { getOrderStatusFromIndex } from '../helpers/OrderHelpers'

type ItemOrderStatus = {
  orderStatusId: number | null
  title: string
  testID: string
}

type OrderPurpose = 'sales' | 'purchase'

export interface OrderFilterProps {
  vendor: BaseEntity[]
  customer: BaseEntity[]
  activities: Activity[]
  statuses: ItemOrderStatus[]
  activeTab: number
  notif?: NotifResponse
  orderStatusData: OrderStatusData[]
  onSelectTab: (id: number | null) => void
  toggleBottomSheet: () => void
}

export type OrderStatusRef = FlatList<ItemOrderStatus>

// ✅ REFACTOR: Extract purpose change logic to reduce nesting
const usePurposeChangeHandler = (
  activeTab: number,
  dispatch: any,
  filter: any
) => {
  const lastPurposeChangeRef = React.useRef(0)
  const purposeProcessingRef = React.useRef(false)

  const executePurposeChange = useCallback(
    (key: string) => {
      const selectedStatus =
        activeTab === 0 ? null : getOrderStatusFromIndex(activeTab)

      const updatePurpose = () => {
        dispatch(
          setOrderFilter({
            purpose: key as OrderPurpose,
            status: selectedStatus,
            type: filter.type,
          })
        )

        setTimeout(() => {
          purposeProcessingRef.current = false
        }, 300)
      }

      requestAnimationFrame(updatePurpose)
    },
    [activeTab, dispatch, filter.type]
  )

  const onSelectPurpose = useCallback(
    ({ key }: { key: string }) => {
      const now = Date.now()

      if (
        now - lastPurposeChangeRef.current < 500 ||
        purposeProcessingRef.current
      ) {
        return
      }

      lastPurposeChangeRef.current = now
      purposeProcessingRef.current = true

      setTimeout(() => executePurposeChange(key), 100)
    },
    [executePurposeChange]
  )

  return onSelectPurpose
}

// ✅ REFACTOR: Extract tab press logic to reduce nesting
const useTabPressHandler = (
  dispatch: any,
  onSelectTab: (id: number | null) => void
) => {
  const lastTabPressRef = React.useRef(0)
  const tabProcessingRef = React.useRef(false)

  const executeTabPress = useCallback(
    (index: number) => {
      const updateTabState = () => {
        const orderStatusValue = getOrderStatusFromIndex(index)

        dispatch(setOrderFilter({ status: orderStatusValue }))
        onSelectTab(index)

        setTimeout(() => {
          tabProcessingRef.current = false
        }, 250)
      }

      requestAnimationFrame(updateTabState)
    },
    [dispatch, onSelectTab]
  )

  const createTabPressHandler = useCallback(
    (index: number) => {
      const handlePress = () => {
        const now = Date.now()

        if (now - lastTabPressRef.current < 300 || tabProcessingRef.current) {
          return
        }

        lastTabPressRef.current = now
        tabProcessingRef.current = true

        setTimeout(() => executeTabPress(index), 50)
      }

      return handlePress
    },
    [executeTabPress]
  )

  return createTabPressHandler
}

// ✅ REFACTOR: Extract filter text generation to reduce nesting
const useFilterTextContent = (
  filter: any,
  customerMap: Map<number, string>,
  vendorMap: Map<number, string>,
  activityMap: Map<number, string>,
  t: any
) => {
  const filterTextContent = useMemo(() => {
    const {
      type,
      purpose,
      vendor_id,
      customer_id,
      activity_id,
      from_date,
      to_date,
      integration,
    } = filter

    const hasAnyFilter =
      type ||
      vendor_id ||
      customer_id ||
      activity_id ||
      from_date ||
      to_date ||
      integration

    if (!hasAnyFilter) {
      return null
    }

    const getEntityName = () => {
      if (purpose === 'sales') {
        return customerMap.get(Number(customer_id))
      }
      return vendorMap.get(Number(vendor_id))
    }

    const entity = getEntityName()
    const activity = activityMap.get(activity_id as unknown as number)
    const orderTypeName = type ? t(orderTypeNames[type as number]) : null
    const orderIntegrationName = integration
      ? orderIntegrationListNames[integration as number]
      : null

    const formatDate = (date: string) => convertString(date, DATE_FORMAT)

    const textParts = [
      orderTypeName,
      orderIntegrationName,
      entity,
      activity,
      from_date ? formatDate(from_date) : null,
      to_date ? formatDate(to_date) : null,
    ].filter(Boolean)

    return concatString(textParts)
  }, [filter, customerMap, vendorMap, activityMap, t])

  return filterTextContent
}

export const OrderFilter = forwardRef<OrderStatusRef, OrderFilterProps>(
  function OrderFilter(
    {
      customer,
      vendor,
      activities,
      activeTab,
      onSelectTab,
      statuses,
      toggleBottomSheet,
      notif,
      orderStatusData,
    },
    ref
  ) {
    const { t } = useLanguage()
    const dispatch = useAppDispatch()
    const { filter } = useAppSelector(orderState)

    const [purposePopupVisible, setPurposePopupVisible] = useState(false)

    // ✅ OPTIMIZATION: Simple boolean check without complex computation
    const hasActiveFilter = Boolean(
      filter.activity_id || filter.customer_id || filter.vendor_id
    )

    const FilterIcon = hasActiveFilter
      ? Icons.IcFilterFilled
      : Icons.IcFilterOutlined

    // ✅ OPTIMIZATION: Stable purpose options
    const purposeOptions = useMemo(
      () =>
        Object.entries(orderPurposeNames).map(([key, label]) => ({
          label: t(label),
          key,
          id: label,
        })),
      [t]
    )

    const notifCount =
      filter.purpose === 'sales'
        ? (notif?.as_vendor ?? 0)
        : (notif?.as_customer ?? 0)

    const purposeText = t(orderPurposeNames[filter.purpose])

    // ✅ CRITICAL FIX: Move entity maps outside useMemo to avoid hooks-in-callback error
    const vendorMap = useMemo(
      () => new Map(vendor.map((v) => [v.id, v.name])),
      [vendor]
    )
    const customerMap = useMemo(
      () => new Map(customer.map((c) => [c.id, c.name])),
      [customer]
    )
    const activityMap = useMemo(
      () => new Map(activities.map((a) => [a.id, a.name])),
      [activities]
    )

    // ✅ REFACTOR: Use extracted hooks
    const onSelectPurpose = usePurposeChangeHandler(activeTab, dispatch, filter)
    const filterTextContent = useFilterTextContent(
      filter,
      customerMap,
      vendorMap,
      activityMap,
      t
    )

    const togglePurposePopup = useCallback(() => {
      setPurposePopupVisible((prev) => !prev)
    }, [])

    const handleResetFilter = useCallback(() => {
      dispatch(resetFilter())
    }, [dispatch])

    // ✅ CRITICAL FIX: Optimized tab item rendering with status data map
    const statusDataMap = useMemo(
      () =>
        new Map(
          orderStatusData.map((item) => [item.order_status_id, item.total])
        ),
      [orderStatusData]
    )

    const createTabPressHandler = useTabPressHandler(dispatch, onSelectTab)

    // ✅ CRITICAL FIX: Enhanced throttling for tab press
    const renderTabItem: ListRenderItem<ItemOrderStatus> = useCallback(
      ({ item, index }) => {
        const isActive = activeTab === index
        const statusCount = statusDataMap.get(
          item.orderStatusId as unknown as number
        )

        const handlePress = createTabPressHandler(index)

        return (
          <TabItem
            text={item.title}
            isActive={isActive}
            count={statusCount}
            onPress={handlePress}
            {...getTestID(`tab-item-${item.title}`)}
          />
        )
      },
      [activeTab, statusDataMap, createTabPressHandler]
    )

    const keyExtractor = useCallback(
      (item: ItemOrderStatus) => `tab-${item.orderStatusId}`,
      []
    )

    const renderFilterText = useCallback(() => {
      if (filterTextContent) {
        return (
          <>
            <Text className={cn(AppStyles.textMedium, 'flex-1')}>
              {filterTextContent}
            </Text>
            <ImageButton
              onPress={handleResetFilter}
              Icon={Icons.IcClearFilter}
              size={20}
              {...getTestID('btn-reset-order-filter')}
            />
          </>
        )
      }

      return (
        <Text className={cn(AppStyles.textMedium, 'text-warmGrey flex-1')}>
          {t('empty.no_filter')}
        </Text>
      )
    }, [filterTextContent, handleResetFilter, t])

    return (
      <View>
        <View className='bg-white border-b border-b-whiteTwo px-4 py-3'>
          <PopupMenu
            modalVisible={purposePopupVisible}
            dismissDialog={togglePurposePopup}
            onPressItem={onSelectPurpose}
            containerClassName='ml-4'
            itemTextClassName='mr-1'
            data={purposeOptions}
            labelField='label'
            notif={notif}
            {...getTestID('popup-order-menu')}>
            <Button
              onPress={togglePurposePopup}
              containerClassName='justify-start'
              textClassName='flex-row items-center gap-x-2'
              {...getTestID('btn-order-expand')}>
              <Text>{purposeText}</Text>
              {notifCount > 0 && <Icons.IcError width='16' height='16' />}
              <Icons.IcExpandMore height={24} width={24} />
            </Button>
          </PopupMenu>

          {notifCount > 0 && (
            <View
              className={cn(
                AppStyles.rowCenterAlign,
                'rounded-sm bg-softPink p-1 mt-2'
              )}>
              <Icons.IcError />
              <Text className='ml-1 font-mainRegular text-xs text-lavaRed'>
                {t('order.orders_not_received', { num: notifCount })}
              </Text>
            </View>
          )}
        </View>

        <View className='flex-row items-center bg-white border-b border-b-whiteTwo px-4 py-3 gap-x-2'>
          {renderFilterText()}
          <ImageButton
            Icon={FilterIcon}
            size={24}
            onPress={toggleBottomSheet}
            {...getTestID('btn-order-filter')}
          />
        </View>

        <FlatList
          ref={ref}
          data={statuses}
          renderItem={renderTabItem}
          keyExtractor={keyExtractor}
          horizontal
          scrollEnabled
          showsHorizontalScrollIndicator={false}
          contentContainerClassName='bg-iceBlue'
          removeClippedSubviews={true}
          maxToRenderPerBatch={8}
          updateCellsBatchingPeriod={100}
          initialNumToRender={8}
          windowSize={8}
        />
      </View>
    )
  }
)
