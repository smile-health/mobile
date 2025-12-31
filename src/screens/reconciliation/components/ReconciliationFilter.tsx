import React, { useMemo, useState } from 'react'
import { Pressable, View, Text } from 'react-native'
import { Icons } from '@/assets/icons'
import { ImageButton } from '@/components/buttons'
import EntityActivityHeader from '@/components/header/EntityActivityHeader'
import { useLanguage } from '@/i18n/useLanguage'
import { ReconciliationFilter as Filter } from '@/models/reconciliation/ReconciliationList'
import AppStyles, { flexStyle } from '@/theme/AppStyles'
import colors from '@/theme/colors'
import { cn } from '@/theme/theme-config'
import { getTestID } from '@/utils/CommonUtils'
import { getDateRangeText } from '@/utils/DateFormatUtils'
import { SelectPeriodLabel } from './CreateReconciliationHeader'
import ReconciliationFilterBottomSheet from './ReconciliationFilterBottomSheet'

interface Props {
  activityName: string
  filter: Filter
  onApply: (filter: Filter) => void
}
function ReconciliationFilter({
  activityName,
  filter,
  onApply,
}: Readonly<Props>) {
  const { t } = useLanguage()
  const [isOpenFilter, setIsOpenFilter] = useState(false)

  const filterText = useMemo(() => {
    const { start_date, end_date, created_from, created_to } = filter
    return {
      createdDateRange: getDateRangeText(created_from, created_to),
      periodDateRange: getDateRangeText(start_date, end_date),
    }
  }, [filter])

  const shouldShowFilter = Object.values(filterText).some(Boolean)

  const handleToggleFilter = () => setIsOpenFilter((prev) => !prev)

  const handleDeleteFilter = () => {
    onApply({
      ...filter,
      start_date: undefined,
      end_date: undefined,
    })
  }

  return (
    <React.Fragment>
      <EntityActivityHeader activityName={activityName} />
      <Pressable
        className='flex-row items-center px-4 py-3 border-b border-quillGrey bg-white'
        onPress={handleToggleFilter}
        {...getTestID('btn-filter-reconciliation-history')}>
        <View className='flex-1 items-start'>
          <SelectPeriodLabel
            label={t('label.select_period')}
            value={filterText.createdDateRange}
          />
        </View>
        <View
          className={cn(
            'border-[0.5px] border-mediumGray h-5 w-5 rounded',
            AppStyles.colCenter,
            shouldShowFilter ? 'bg-main' : 'bg-white'
          )}>
          <Icons.IcDate
            height={16}
            width={16}
            color={shouldShowFilter ? colors.white : colors.mediumGray}
          />
        </View>
      </Pressable>
      {!!filterText.periodDateRange && (
        <View className='bg-polynesianBlue flex-row items-center px-4 py-1 gap-y-1'>
          <Text className={cn(AppStyles.textBoldSmall)} style={flexStyle}>
            {t('label.period')}:{' '}
            <Text className={AppStyles.textRegularSmall}>
              {filterText.periodDateRange}
            </Text>
          </Text>
          <ImageButton
            containerClassName='mt-1'
            Icon={Icons.IcDelete}
            size={16}
            onPress={handleDeleteFilter}
            {...getTestID('btn-reset-filters')}
          />
        </View>
      )}
      <ReconciliationFilterBottomSheet
        toggleSheet={handleToggleFilter}
        isOpen={isOpenFilter}
        filter={filter}
        onApplyFilter={onApply}
      />
    </React.Fragment>
  )
}

export default React.memo(ReconciliationFilter)
