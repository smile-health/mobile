import React, { useCallback, useMemo } from 'react'
import { View, Text } from 'react-native'
import { useForm } from 'react-hook-form'
import { Icons } from '@/assets/icons'
import {
  BottomSheet,
  BottomSheetProps,
} from '@/components/bottomsheet/BottomSheet'
import { Button, ImageButton } from '@/components/buttons'
import DateRangePicker from '@/components/filter/DateRangePicker'
import PickerSelect from '@/components/filter/PickerSelect'
import { useLanguage } from '@/i18n/useLanguage'
import { IOptions } from '@/models/Common'
import { TransactionDiscardFilter } from '@/models/transaction/Transaction'
import { getTrxReasons } from '@/services/features'
import { useAppSelector } from '@/services/store'
import AppStyles from '@/theme/AppStyles'
import colors from '@/theme/colors'
import { getOptionWithDefaultValue, getTestID } from '@/utils/CommonUtils'
import { DATE_FILTER_FORMAT, TRANSACTION_TYPE } from '@/utils/Constants'
import { convertString, getDaysBefore } from '@/utils/DateFormatUtils'

interface Props extends Omit<BottomSheetProps, 'name'> {
  filter: TransactionDiscardFilter | null
  onApply: (data: TransactionDiscardFilter) => void
}

const initialDate = {
  start: getDaysBefore(7),
  end: convertString(Date.now(), DATE_FILTER_FORMAT),
}

function TransactionFilterBottomSheet(props: Readonly<Props>) {
  const { filter, onApply, toggleSheet, ...rest } = props
  const transactionReasons = useAppSelector((state) =>
    getTrxReasons(state, TRANSACTION_TYPE.DISCARDS)
  )

  const { t } = useLanguage()

  const { handleSubmit, watch, reset, setValue } = useForm({
    defaultValues: {
      transaction_reason_id: filter?.transaction_reason_id ?? 0,
      start_date: filter?.start_date ?? initialDate.start,
      end_date: filter?.end_date ?? initialDate.end,
    },
  })
  const form = watch()

  const trxReasonOptions = useMemo(
    () => getOptionWithDefaultValue(transactionReasons, t, 'label.all_reason'),
    [t, transactionReasons]
  )

  const resetFilter = () =>
    reset({
      start_date: initialDate.start,
      end_date: initialDate.end,
      transaction_reason_id: 0,
    })

  const handleApplyDateRange = useCallback(
    (start: string, end: string) => {
      reset((prev) => ({ ...prev, start_date: start, end_date: end }))
    },
    [reset]
  )

  const handleSelectReason = useCallback(
    (item: IOptions) => {
      setValue('transaction_reason_id', item.value)
    },
    [setValue]
  )

  const dismissBottomSheet = () => {
    reset({
      transaction_reason_id: filter?.transaction_reason_id ?? 0,
      start_date: filter?.start_date ?? initialDate.start,
      end_date: filter?.end_date ?? initialDate.end,
    })
    toggleSheet()
  }

  const applyFilter = (data) => {
    onApply({
      ...data,
      transaction_reason_id: data.transaction_reason_id || undefined,
    })
  }

  return (
    <BottomSheet
      name='CancelDiscardFilterBottomSheet'
      toggleSheet={dismissBottomSheet}
      {...rest}>
      <View className='pt-4'>
        <View className='flex-row justify-between items-center px-4'>
          <Text className={AppStyles.textBold}>{t('label.all_filter')}</Text>
          <ImageButton
            onPress={dismissBottomSheet}
            Icon={Icons.IcDelete}
            size={20}
            {...getTestID('btn-close-filter-bottomsheet')}
          />
        </View>
        <View className='px-4 pb-4 gap-y-2'>
          <DateRangePicker
            startDate={form.start_date}
            endDate={form.end_date}
            name='TransactionDiscardDateFilter'
            onApply={handleApplyDateRange}
            testID='daterangepicker-transaction-discard'
            label={t('label.start_end_date')}
            placeholder={t('label.start_end_date')}
          />
          <PickerSelect
            value={form.transaction_reason_id}
            name='TransactionDiscardReasonFilter'
            testID='pickerselect-transaction-reason'
            data={trxReasonOptions}
            title={t('label.select_reason')}
            label={t('label.transaction_reason')}
            placeholder={t('label.transaction_reason')}
            onSelect={handleSelectReason}
            radioButtonColor={colors.main()}
          />
        </View>
        <View className='flex-row justify-between border-t border-quillGrey items-center p-4 gap-x-2'>
          <Button
            preset='outlined-primary'
            text={t('button.reset')}
            containerClassName='flex-1'
            onPress={resetFilter}
            {...getTestID('btn-reset-transaction-discard-filter')}
          />
          <Button
            preset='filled'
            text={t('button.apply')}
            containerClassName='flex-1'
            onPress={handleSubmit(applyFilter)}
            {...getTestID('btn-apply-transaction-discard-filter')}
          />
        </View>
      </View>
    </BottomSheet>
  )
}

export default React.memo(TransactionFilterBottomSheet)
