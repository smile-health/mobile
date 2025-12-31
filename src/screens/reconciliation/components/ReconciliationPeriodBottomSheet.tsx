import React, { useCallback } from 'react'
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
import AppStyles from '@/theme/AppStyles'
import { getTestID } from '@/utils/CommonUtils'

interface Props extends Omit<BottomSheetProps, 'name'> {
  startDate?: string
  endDate?: string
  onSelectDate: (start: string, end: string) => void
}

function ReconciliationPeriodBottomSheet({
  startDate,
  endDate,
  onSelectDate,
  toggleSheet,
  ...bottomSheetProps
}: Readonly<Props>) {
  const { t } = useLanguage()

  const { handleSubmit, watch, reset } = useForm({
    defaultValues: {
      startDate,
      endDate,
    },
  })
  const form = watch()

  const handleApplyDateRange = useCallback(
    (start: string, end: string) => {
      reset({
        startDate: start,
        endDate: end,
      })
    },
    [reset]
  )

  const dismissBottomSheet = () => {
    reset({
      startDate,
      endDate,
    })
    toggleSheet()
  }

  const handleApplyPeriod = (data) => {
    onSelectDate(data.startDate, data.endDate)
    dismissBottomSheet()
  }

  const resetForm = () => {
    reset({ startDate: undefined, endDate: undefined })
  }

  return (
    <BottomSheet
      name='ReconciliationPeriodBottomSheet'
      toggleSheet={toggleSheet}
      {...bottomSheetProps}>
      <View className='pt-4'>
        <View className='flex-row justify-between items-center px-4'>
          <Text className={AppStyles.textBold}>
            {t('reconciliation.select_period')}
          </Text>
          <ImageButton
            onPress={dismissBottomSheet}
            Icon={Icons.IcDelete}
            size={20}
            {...getTestID('btn-close-filter')}
          />
        </View>
        <View className='p-4 gap-y-2'>
          <DateRangePicker
            startDate={form.startDate}
            endDate={form.endDate}
            name='PeriodDateRangeFilter'
            onApply={handleApplyDateRange}
            label={t('label.start_end_date')}
            placeholder={t('label.start_end_date')}
            testID='daterangepicker-reconciliation-period'
          />
        </View>
        <View className='flex-row justify-between border-t border-quillGrey items-center p-4 gap-x-2'>
          <Button
            preset='outlined-primary'
            containerClassName='flex-1'
            text={t('button.reset')}
            onPress={resetForm}
            {...getTestID('btn-reset-period')}
          />
          <Button
            preset='filled'
            containerClassName='flex-1'
            text={t('button.apply')}
            disabled={!form.startDate || !form.endDate}
            onPress={handleSubmit(handleApplyPeriod)}
            {...getTestID('btn-apply-period')}
          />
        </View>
      </View>
    </BottomSheet>
  )
}

export default React.memo(ReconciliationPeriodBottomSheet)
