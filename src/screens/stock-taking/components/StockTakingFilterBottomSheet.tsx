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
import { StockTakingFilter } from '@/models/stock-taking/StockTakingList'
import AppStyles from '@/theme/AppStyles'
import { getTestID } from '@/utils/CommonUtils'

interface Props extends Omit<BottomSheetProps, 'name'> {
  filter: StockTakingFilter
  onApplyFilter: (filter: StockTakingFilter) => void
}

function StockTakingFilterBottomSheet({
  isOpen,
  filter,
  onApplyFilter,
  toggleSheet,
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

  const handleApplyExpiredDateRange = useCallback(
    (start: string, end: string) => {
      reset((prev) => ({
        ...prev,
        expired_start_date: start,
        expired_end_date: end,
      }))
    },
    [reset]
  )

  const dismissBottomSheet = () => {
    reset(filter)
    toggleSheet()
  }

  const applyFilter = (data) => {
    onApplyFilter(data)
    toggleSheet()
  }

  const resetFilter = () => {
    reset({
      only_have_qty: filter.only_have_qty,
    })
  }

  useEffect(() => {
    if (isOpen) {
      reset(filter)
    }
  }, [filter, isOpen, reset])

  return (
    <BottomSheet
      name='StockTakingFilterBottomSheet'
      toggleSheet={toggleSheet}
      isOpen={isOpen}
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
            startDate={form.created_from}
            endDate={form.created_to}
            name='CreatedDateRangeFilter'
            onApply={handleApplyCreatedDateRange}
            label={t('label.created_date_range')}
            placeholder={t('label.created_date_range')}
            testID='daterangepicker-created-filter'
          />
          <DateRangePicker
            startDate={form.expired_start_date}
            endDate={form.expired_end_date}
            name='ExpiredDateRangeFilter'
            onApply={handleApplyExpiredDateRange}
            label={t('label.expired_date_range')}
            placeholder={t('label.expired_date_range')}
            testID='daterangepicker-expired-filter'
          />
        </View>
        <View className='flex-row justify-between border-t border-quillGrey items-center p-4 gap-x-2'>
          <Button
            preset='outlined-primary'
            containerClassName='flex-1'
            text={t('button.reset')}
            onPress={resetFilter}
            {...getTestID('btn-reset-filter')}
          />
          <Button
            preset='filled'
            containerClassName='flex-1'
            text={t('button.apply')}
            onPress={handleSubmit(applyFilter)}
            {...getTestID('btn-apply-filter')}
          />
        </View>
      </View>
    </BottomSheet>
  )
}

export default React.memo(StockTakingFilterBottomSheet)
