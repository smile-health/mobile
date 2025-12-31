import React from 'react'
import { View, Text } from 'react-native'
import { Icons } from '@/assets/icons'
import { ImageButton } from '@/components/buttons'
import DateRangePickerChip from '@/components/filter/DateRangePickerChip'
import { useLanguage } from '@/i18n/useLanguage'
import { SelfDisposalListFilter as ListFilter } from '@/models/disposal/SelfDisposalList'
import AppStyles from '@/theme/AppStyles'
import { getTestID } from '@/utils/CommonUtils'

interface FilterText {
  material?: string
  activity?: string
}
interface SelfDisposalListFilterProps {
  filter: ListFilter
  filterText: FilterText
  onOpenFilter: () => void
  onApply: (filter: ListFilter) => void
}

export default function SelfDisposalListFilter({
  filter,
  filterText,
  onOpenFilter,
  onApply,
}: Readonly<SelfDisposalListFilterProps>) {
  const { t } = useLanguage()

  const hasActiveFilter = filterText.activity ?? filterText.material

  const FilterIcon = hasActiveFilter
    ? Icons.IcFilterFilled
    : Icons.IcFilterOutlined

  const handleApplyDateRangeFilter = (startDate: string, endDate: string) => {
    onApply({
      ...filter,
      start_date: startDate,
      end_date: endDate,
    })
  }

  const handleResetFilter = () => {
    onApply({
      ...filter,
      material_id: undefined,
      activity_id: undefined,
    })
  }

  return (
    <View className='bg-white border-b border-gray-200'>
      <View className='flex-row items-center justify-between px-4 py-3'>
        <View className='flex-1 items-start'>
          {filter.start_date != null && filter.end_date != null ? (
            <DateRangePickerChip
              name='TransactionDateFilter'
              startDate={filter?.start_date}
              endDate={filter?.end_date}
              onApply={handleApplyDateRangeFilter}
              testID='daterangepicker-transaction'
            />
          ) : (
            <Text className={AppStyles.labelRegular}>
              {t('empty.no_filter_date_range')}
            </Text>
          )}
        </View>

        <ImageButton onPress={onOpenFilter} Icon={FilterIcon} size={24} />
      </View>

      {hasActiveFilter && (
        <View className='flex-row items-start bg-polynesianBlue px-4 py-2 gap-y-1'>
          <View className='flex-row items-center flex-1 flex-wrap'>
            {Number(filter.activity_id) > 0 && (
              <Text className={AppStyles.textBoldSmall}>
                {t('label.activity')}:{' '}
                <Text className={AppStyles.textRegularSmall}>
                  {filterText.activity}
                </Text>
              </Text>
            )}
            <Text>{', '}</Text>
            {Number(filter.material_id) > 0 && (
              <Text className={AppStyles.textBoldSmall}>
                {t('label.material')}:{' '}
                <Text className={AppStyles.textRegularSmall}>
                  {filterText.material}
                </Text>
              </Text>
            )}
          </View>
          <ImageButton
            onPress={handleResetFilter}
            Icon={Icons.IcDelete}
            size={16}
            {...getTestID('btn-reset-filters')}
          />
        </View>
      )}
    </View>
  )
}
