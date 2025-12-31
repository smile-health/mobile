import React from 'react'
import { View, Text } from 'react-native'
import { TFunction } from 'i18next'
import { Icons } from '@/assets/icons'
import { ImageButton } from '@/components/buttons'
import DateRangePickerChip from '@/components/filter/DateRangePickerChip'
import { IDisposalShipmentFilter } from '@/models/disposal/DisposalShipmentList'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import { getTestID } from '@/utils/CommonUtils'
import { disposalPurposeNames } from '../../disposal-constant'

interface IFilterText {
  activity?: string
  entity?: string
}
interface Props {
  filter: IDisposalShipmentFilter
  filterText: IFilterText
  t: TFunction
  openFilter: () => void
  resetFilter: () => void
  onApplyDateRange: (start: string, end: string) => void
}

function DisposalShipmentHeaderFilter(props: Readonly<Props>) {
  const { t, filter, filterText, openFilter, resetFilter, onApplyDateRange } =
    props

  const hasActiveFilter = Object.values(filterText).some((value) => !!value)
  const hasDateRange = filter.from_date && filter.to_date
  const FilterIcon = hasActiveFilter
    ? Icons.IcFilterFilled
    : Icons.IcFilterOutlined

  return (
    <React.Fragment>
      <View className='flex-row items-center bg-white border-b border-b-whiteTwo px-4 py-3 gap-x-2'>
        {hasDateRange ? (
          <View className='flex-1 items-start'>
            <DateRangePickerChip
              name='TransactionDateFilter'
              startDate={filter.from_date}
              endDate={filter.to_date}
              onApply={onApplyDateRange}
              testID='daterangepicker-transaction'
            />
          </View>
        ) : (
          <Text className={cn(AppStyles.labelRegular, 'text-sm flex-1')}>
            {t('empty.no_filter_date_range')}
          </Text>
        )}
        <ImageButton
          Icon={FilterIcon}
          size={24}
          onPress={openFilter}
          {...getTestID('btn-filter-disposal-shipment')}
        />
      </View>
      {hasActiveFilter && (
        <View className='flex-row items-start bg-polynesianBlue px-4 py-1 gap-y-1'>
          <View className='flex-row items-center flex-1 flex-wrap'>
            {!!filterText.entity && (
              <Text className={AppStyles.textBoldSmall}>
                {t(disposalPurposeNames[filter.purpose ?? ''])}:{' '}
                <Text className={AppStyles.textRegularSmall}>
                  {filterText.entity}
                </Text>
              </Text>
            )}
            <Text>{', '}</Text>
            {!!filterText.activity && (
              <Text className={AppStyles.textBoldSmall}>
                {t('label.activity')}:{' '}
                <Text className={AppStyles.textRegularSmall}>
                  {filterText.activity}
                </Text>
              </Text>
            )}
          </View>
          <ImageButton
            onPress={resetFilter}
            Icon={Icons.IcDelete}
            size={16}
            {...getTestID('btn-reset-filters')}
          />
        </View>
      )}
    </React.Fragment>
  )
}

export default React.memo(DisposalShipmentHeaderFilter)
