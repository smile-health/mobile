import React, { Ref, useCallback, useMemo, useState } from 'react'
import { FlatList, View, ListRenderItem } from 'react-native'
import { ParseKeys } from 'i18next'
import { TabItem } from '@/components/tabs/TabItem'
import { useLanguage } from '@/i18n/useLanguage'
import { IOptions } from '@/models/Common'
import { IDisposalShipmentFilter } from '@/models/disposal/DisposalShipmentList'
import { DisposalShipmentStatusCount } from '@/models/disposal/DisposalShipmentStatus'
import { getActivityOption, getEntityOption } from '@/services/features'
import { useAppSelector } from '@/services/store'
import { getTestID } from '@/utils/CommonUtils'
import DisposalShipmentFilterBottomsheet from './DisposalShipmentFilterBottomsheet'
import DisposalShipmentHeaderFilter from './DisposalShipmentHeaderFilter'
import SelectPurposeFilter from './SelectPurposeFilter'
import {
  DISPOSAL_PURPOSE,
  disposalPurposeNames,
  disposalStatusTabs,
} from '../../disposal-constant'

interface Props {
  ref: Ref<FlatList<IOptions>>
  isSender: boolean
  activeTab: number
  filter: IDisposalShipmentFilter
  statusCounts: DisposalShipmentStatusCount[]
  onApplyFilter: (payload: IDisposalShipmentFilter) => void
  onSelectTab: (index: number) => void
}

const FILTER_BOTTOM_SHEET_NAME = 'DisposalShipmentFilterBottomSheet'
const getFilterText = (customers, vendors, activities, isSender, filter) => {
  const sender = customers.find((c) => c.value === filter.customer_id)
  const receiver = vendors.find((v) => v.value === filter.vendor_id)
  const activity = activities.find((ac) => ac.value === filter.activity_id)
  return {
    activity: activity?.label,
    entity: isSender ? receiver?.label : sender?.label,
  }
}

function DisposalShipmentFilter(props: Readonly<Props>) {
  const {
    ref,
    isSender,
    activeTab,
    filter,
    onApplyFilter,
    onSelectTab,
    statusCounts,
  } = props
  const { t } = useLanguage()

  const activities = useAppSelector(getActivityOption)
  const { customers, vendors } = useAppSelector(getEntityOption)

  const [isOpen, setIsOpen] = useState(false)

  const filterText = useMemo(
    () => getFilterText(customers, vendors, activities, isSender, filter),
    [customers, vendors, activities, isSender, filter]
  )

  const disposalPurposeOptions = useMemo(() => {
    return Object.entries(disposalPurposeNames).map(([value, label]) => ({
      label: t(label),
      value: value,
    }))
  }, [t])

  const getStatusCount = useCallback(
    (status: number) => {
      return statusCounts.find((s) => s.status === status)?.total
    },
    [statusCounts]
  )

  const handleApplyDateRangeFilter = useCallback(
    (startDate: string, endDate: string) => {
      onApplyFilter({ from_date: startDate, to_date: endDate })
    },
    [onApplyFilter]
  )

  const handleResetFilter = useCallback(() => {
    onApplyFilter({
      vendor_id: undefined,
      customer_id: undefined,
      activity_id: undefined,
    })
  }, [onApplyFilter])

  const onSelectPurpose = useCallback(
    ({ value }) => {
      onApplyFilter({ purpose: value })
    },
    [onApplyFilter]
  )

  const toggleBottomSheet = useCallback(() => {
    setIsOpen((prev) => !prev)
  }, [])

  const renderTabItem: ListRenderItem<IOptions> = useCallback(
    ({ item, index }) => {
      const isActive = activeTab === index
      const onPress = () => {
        onApplyFilter({ status: item.value })
        onSelectTab(index)
      }

      return (
        <TabItem
          text={t(item.label as ParseKeys)}
          isActive={isActive}
          onPress={onPress}
          count={getStatusCount(item.value)}
          {...getTestID(`tab-item-${item.label}`)}
        />
      )
    },
    [activeTab, getStatusCount, onApplyFilter, onSelectTab, t]
  )

  return (
    <React.Fragment>
      <View>
        <SelectPurposeFilter
          data={disposalPurposeOptions}
          onSelect={onSelectPurpose}
          purpose={filter.purpose ?? DISPOSAL_PURPOSE.SENDER}
          t={t}
        />
        <DisposalShipmentHeaderFilter
          filter={filter}
          filterText={filterText}
          openFilter={toggleBottomSheet}
          onApplyDateRange={handleApplyDateRangeFilter}
          resetFilter={handleResetFilter}
          t={t}
        />
        <FlatList
          ref={ref}
          data={disposalStatusTabs}
          renderItem={renderTabItem}
          keyExtractor={(item) => item.label}
          horizontal
          scrollEnabled
          showsHorizontalScrollIndicator={false}
          contentContainerClassName='bg-iceBlue flex-grow justify-between'
        />
      </View>
      <DisposalShipmentFilterBottomsheet
        name={FILTER_BOTTOM_SHEET_NAME}
        isOpen={isOpen}
        filter={filter}
        isSender={isSender}
        senders={customers}
        receivers={vendors}
        activities={activities}
        onApply={onApplyFilter}
        toggleSheet={toggleBottomSheet}
      />
    </React.Fragment>
  )
}

export default React.memo(DisposalShipmentFilter)
