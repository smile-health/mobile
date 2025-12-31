import React, { memo, useEffect } from 'react'
import { View, Text } from 'react-native'
import { SubmitHandler, useForm } from 'react-hook-form'
import {
  BottomSheet,
  BottomSheetProps,
} from '@/components/bottomsheet/BottomSheet'
import { Button } from '@/components/buttons'
import DateRangePicker from '@/components/filter/DateRangePicker'
import { useLanguage } from '@/i18n/useLanguage'
import { setTicketFilter } from '@/services/features/ticket.slice'
import { ticketState, useAppDispatch, useAppSelector } from '@/services/store'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import { getTestID } from '@/utils/CommonUtils'
import { TICKET_FILTER_DEFAULT_VALUES } from '@/utils/Constants'

interface TicketFilterBottomSheetProps extends BottomSheetProps {
  readonly toggleSheet: () => void
}

interface FormValues {
  readonly from_arrived_date: string
  readonly to_arrived_date: string
}

const TicketFilterBottomSheet = memo(function TicketFilterBottomSheet({
  isOpen,
  toggleSheet,
  ...props
}: TicketFilterBottomSheetProps) {
  const { t } = useLanguage()
  const dispatch = useAppDispatch()
  const { filter } = useAppSelector(ticketState)

  const { handleSubmit, reset, setValue, watch } = useForm<FormValues>({
    defaultValues: TICKET_FILTER_DEFAULT_VALUES,
  })

  const from_arrived_date = watch('from_arrived_date')
  const to_arrived_date = watch('to_arrived_date')

  useEffect(() => {
    if (isOpen) {
      setValue('from_arrived_date', filter.from_arrived_date ?? '')
      setValue('to_arrived_date', filter.to_arrived_date ?? '')
    }
  }, [filter, isOpen, setValue])

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    dispatch(
      setTicketFilter({
        from_arrived_date: data.from_arrived_date ?? undefined,
        to_arrived_date: data.to_arrived_date ?? undefined,
      })
    )
    toggleSheet()
  }

  const onReset = () => {
    reset()
  }

  const handleApplyDateRange = (startDate: string, endDate: string) => {
    setValue('from_arrived_date', startDate)
    setValue('to_arrived_date', endDate)
  }

  return (
    <BottomSheet isOpen={isOpen} toggleSheet={toggleSheet} {...props}>
      <View className='flex-1 px-4'>
        <Text className={cn(AppStyles.textBold, 'text-lg mb-4 mt-5')}>
          {t('label.all_filter')}
        </Text>

        <DateRangePicker
          startDate={from_arrived_date}
          endDate={to_arrived_date}
          name='TicketArrivalDateFilter'
          onApply={handleApplyDateRange}
          label={t('label.start_end_date')}
          placeholder={t('label.start_end_date')}
          testID='daterangepicker-ticket-filter'
        />

        <View className='flex-row gap-x-2 mt-4'>
          <Button
            preset='outlined-primary'
            onPress={onReset}
            containerClassName='flex-1'
            {...getTestID('btn-reset-filter')}>
            {t('button.reset')}
          </Button>
          <Button
            preset='filled'
            onPress={handleSubmit(onSubmit)}
            containerClassName='flex-1'
            {...getTestID('btn-apply-filter')}>
            {t('button.apply')}
          </Button>
        </View>
      </View>
    </BottomSheet>
  )
})

export default TicketFilterBottomSheet
