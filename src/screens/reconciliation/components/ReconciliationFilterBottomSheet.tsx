import React, { useCallback, useEffect } from 'react'
import { View, Text } from 'react-native'
import { useForm } from 'react-hook-form'
import { Icons } from '@/assets/icons'
import {
  BottomSheet,
  BottomSheetProps,
} from '@/components/bottomsheet/BottomSheet'
import { Button, ImageButton } from '@/components/buttons'
import DateRangePicker from '@/components/filter/DateRangePicker'
import { useLanguage } from '@/i18n/useLanguage'
import { ReconciliationFilter } from '@/models/reconciliation/ReconciliationList'
import AppStyles from '@/theme/AppStyles'
import { getTestID } from '@/utils/CommonUtils'

interface Props extends Omit<BottomSheetProps, 'name'> {
  filter: ReconciliationFilter
  onApplyFilter: (filter: ReconciliationFilter) => void
}

function ReconciliationFilterBottomSheet({
  filter,
  onApplyFilter,
  toggleSheet,
  isOpen,
  ...bottomSheetProps
}: Readonly<Props>) {
  const { t } = useLanguage()

  const { handleSubmit, watch, reset } = useForm({
    defaultValues: filter,
  })
  const form = watch()

  const handleApplyCreatedDateRange = useCallback(
    (start: string, end: string) => {
      reset((prev) => ({ ...prev, created_from: start, created_to: end }))
    },
    [reset]
  )

  const handleApplyPeriodDateRange = useCallback(
    (start: string, end: string) => {
      reset((prev) => ({ ...prev, start_date: start, end_date: end }))
    },
    [reset]
  )

  const dismissBottomSheet = () => {
    reset(filter)
    toggleSheet()
  }

  const handleApplyFilter = (data) => {
    onApplyFilter(data)
    toggleSheet()
  }

  const handleResetFilter = () => {
    reset({
      start_date: undefined,
      end_date: undefined,
      created_from: undefined,
      created_to: undefined,
    })
  }

  useEffect(() => {
    if (isOpen) {
      reset(filter)
    }
  }, [filter, isOpen, reset])

  return (
    <BottomSheet
      isOpen={isOpen}
      name='ReconciliationFilterBottomSheet'
      toggleSheet={toggleSheet}
      {...bottomSheetProps}>
      <View className='pt-4'>
        <View className='flex-row justify-between items-center px-4'>
          <Text className={AppStyles.textBold}>{t('label.all_filter')}</Text>
          <ImageButton
            onPress={dismissBottomSheet}
            Icon={Icons.IcDelete}
            size={20}
            {...getTestID('btn-close-filter')}
          />
        </View>
        <View className='p-4 gap-y-2'>
          <DateRangePicker
            name='CreatedDateRangeFilter'
            startDate={form.created_from}
            endDate={form.created_to}
            onApply={handleApplyCreatedDateRange}
            label={t('label.created_date_range')}
            placeholder={t('label.created_date_range')}
            testID='daterangepicker-created-filter'
          />
          <DateRangePicker
            name='PeriodDateRangeFilter'
            startDate={form.start_date}
            endDate={form.end_date}
            onApply={handleApplyPeriodDateRange}
            label={t('label.period_date_range')}
            placeholder={t('label.period_date_range')}
            testID='daterangepicker-period-filter'
          />
        </View>
        <View className='flex-row justify-between border-t border-quillGrey items-center p-4 gap-x-2'>
          <Button
            preset='outlined-primary'
            text={t('button.reset')}
            containerClassName='flex-1'
            onPress={handleResetFilter}
            {...getTestID('btn-reset-filter')}
          />
          <Button
            preset='filled'
            text={t('button.apply')}
            containerClassName='flex-1'
            onPress={handleSubmit(handleApplyFilter)}
            {...getTestID('btn-apply-filter')}
          />
        </View>
      </View>
    </BottomSheet>
  )
}

export default React.memo(ReconciliationFilterBottomSheet)
