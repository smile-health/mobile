import React, { forwardRef, Ref, useCallback, useMemo } from 'react'
import { View, Text, FlatList, ListRenderItem } from 'react-native'
import { Control, FieldErrors } from 'react-hook-form'
import { Icons } from '@/assets/icons'
import { ImageButton } from '@/components/buttons'
import { TabItem } from '@/components/tabs/TabItem'
import { useLanguage } from '@/i18n/useLanguage'
import {
  resetTicketFilter,
  setTicketFilter,
} from '@/services/features/ticket.slice'
import { ticketState, useAppDispatch, useAppSelector } from '@/services/store'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import { concatString, getTestID } from '@/utils/CommonUtils'
import { DATE_FORMAT } from '@/utils/Constants'
import { convertString } from '@/utils/DateFormatUtils'

type ItemTicketStatus = {
  orderType: number | null
  title: string
  count: number
  testID: string
}

type FormFields = {
  searchTicket: string
}

export interface TicketFilterProps {
  statuses: ItemTicketStatus[]
  activeTab: number
  onSelectTab: (index: number) => void
  toggleBottomSheet: () => void
  readonly control: Control<FormFields>
  readonly errors: FieldErrors<FormFields>
  onPressFilter: () => void
  currentTab: number
  onTabPress: (index: number) => void
  countAll?: number
}

export type TicketStatusRef = FlatList<ItemTicketStatus>

const FilterText = ({
  filterContent,
  onReset,
}: {
  filterContent: string | null
  onReset: () => void
}) => {
  const { t } = useLanguage()

  if (filterContent) {
    return (
      <>
        <Text className={cn(AppStyles.textMedium, 'flex-1')}>
          {filterContent}
        </Text>
        <ImageButton
          onPress={onReset}
          Icon={Icons.IcClearFilter}
          size={20}
          {...getTestID('btn-reset-ticket-filter')}
        />
      </>
    )
  }

  return (
    <Text className={cn(AppStyles.textMedium, 'text-warmGrey flex-1')}>
      {t('empty.no_filter_arrival_date')}
    </Text>
  )
}

export const TicketFilter = forwardRef(function TicketFilter(
  props: TicketFilterProps,
  ref: Ref<TicketStatusRef>
) {
  const { activeTab, onSelectTab, statuses, onPressFilter, countAll } = props
  const dispatch = useAppDispatch()
  const { filter } = useAppSelector(ticketState)

  const hasActiveFilters = useMemo(() => {
    const {
      entity_id,
      from_arrived_date,
      to_arrived_date,
      order_id,
      do_number,
      order_id_do_number,
    } = filter

    return Boolean(
      entity_id ||
        from_arrived_date ||
        to_arrived_date ||
        order_id ||
        do_number ||
        order_id_do_number
    )
  }, [filter])

  const renderTabItem: ListRenderItem<ItemTicketStatus> = useCallback(
    ({ item, index }) => {
      const isActive = activeTab === index

      let count = item.count ?? 0

      if (hasActiveFilters && countAll !== undefined && isActive) {
        count = countAll
      }

      const statusValue = index === 0 ? null : item.orderType

      const onPress = () => {
        dispatch(
          setTicketFilter({
            status: statusValue === null ? undefined : String(statusValue),
            page: 1,
          })
        )
        onSelectTab(index)
      }

      const showCount = !hasActiveFilters || index === 0

      return (
        <TabItem
          text={item.title}
          count={count}
          showCount={showCount}
          isActive={isActive}
          onPress={onPress}
          {...getTestID(`tab-item-${item.title}`)}
        />
      )
    },
    [activeTab, hasActiveFilters, countAll, dispatch, onSelectTab]
  )

  const filterTextContent = useMemo(() => {
    const {
      entity_id,
      from_arrived_date,
      to_arrived_date,
      order_id,
      do_number,
    } = filter

    if (
      entity_id ||
      from_arrived_date ||
      to_arrived_date ||
      order_id ||
      do_number
    ) {
      return concatString([
        order_id,
        do_number,
        convertString(from_arrived_date, DATE_FORMAT),
        convertString(to_arrived_date, DATE_FORMAT),
      ])
    }

    return null
  }, [filter])

  const handleResetFilter = () => {
    dispatch(resetTicketFilter())
  }

  return (
    <View>
      <View className='flex-row items-center bg-white border-b border-b-whiteTwo px-4 py-3 gap-x-2'>
        <FilterText
          filterContent={filterTextContent}
          onReset={handleResetFilter}
        />
        <ImageButton
          Icon={Icons.IcFilterOutline}
          size={24}
          onPress={onPressFilter}
          {...getTestID('btn-ticket-filter')}
        />
      </View>
      <FlatList
        ref={ref}
        data={statuses}
        renderItem={renderTabItem}
        keyExtractor={(item, index) =>
          `${item.title}-${item.orderType}-${index}`
        }
        horizontal
        scrollEnabled
        showsHorizontalScrollIndicator={false}
        contentContainerClassName='bg-iceBlue'
      />
    </View>
  )
})
