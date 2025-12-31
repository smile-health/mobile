import React, { useCallback, useEffect, useMemo } from 'react'
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
import { TransactionListFilter } from '@/models/transaction/Transaction'
import AppStyles from '@/theme/AppStyles'
import colors from '@/theme/colors'
import { getOptionWithDefaultValue, getTestID } from '@/utils/CommonUtils'
import { initialTransactionFilter } from '../../hooks/transactionList/useTransactionList'

interface TransactionFilterBottomSheetProps extends BottomSheetProps {
  filter: TransactionListFilter | null
  isHierarchy: boolean
  activities: IOptions[]
  transactionTypes: IOptions[]
  materials: IOptions[]
  onApply: (data: TransactionListFilter) => void
}

const getMaterialLabel = (isHierarchy, t) => {
  return isHierarchy
    ? t('label.active_ingredient_material')
    : t('label.material_name')
}

function TransactionFilterBottomSheet(
  props: Readonly<TransactionFilterBottomSheetProps>
) {
  const {
    filter,
    activities,
    transactionTypes,
    materials,
    isHierarchy,
    onApply,
    toggleSheet,
    isOpen,
    ...rest
  } = props

  const { t } = useLanguage()

  const { handleSubmit, watch, reset, setValue } = useForm({
    defaultValues: {
      ...filter,
      transaction_type_id: filter?.transaction_type_id ?? 0,
      activity_id: filter?.activity_id ?? 0,
      material_id: filter?.material_id ?? 0,
    },
  })
  const form = watch()

  const trxTypeOptions = useMemo(
    () =>
      getOptionWithDefaultValue(
        transactionTypes,
        t,
        'label.all_transaction_type'
      ),
    [t, transactionTypes]
  )

  const materialOptions = useMemo(
    () => getOptionWithDefaultValue(materials, t, 'label.all_material'),
    [t, materials]
  )

  const activityOptions = useMemo(
    () => getOptionWithDefaultValue(activities, t, 'label.all_activity'),
    [t, activities]
  )

  const resetFilter = () => {
    reset({
      ...initialTransactionFilter,
      transaction_type_id: 0,
      material_id: 0,
      activity_id: 0,
    })
  }

  const handleApplyDateRange = useCallback(
    (start: string, end: string) => {
      reset((prev) => ({ ...prev, start_date: start, end_date: end }))
    },
    [reset]
  )

  const handleSelectMaterial = useCallback(
    (item: IOptions) => {
      setValue('material_id', item.value)
    },
    [setValue]
  )
  const handleSelectActivity = useCallback(
    (item: IOptions) => {
      setValue('activity_id', item.value)
    },
    [setValue]
  )
  const handleSelectTransactionType = useCallback(
    (item: IOptions) => {
      setValue('transaction_type_id', item.value)
    },
    [setValue]
  )

  const dismissBottomSheet = () => {
    reset({
      ...filter,
      transaction_type_id: filter?.transaction_type_id ?? 0,
      activity_id: filter?.activity_id ?? 0,
      material_id: filter?.material_id ?? 0,
    })
    toggleSheet()
  }

  const applyFilter = ({
    activity_id,
    material_id,
    transaction_type_id,
    ...data
  }) =>
    onApply({
      ...data,
      material_id: material_id || undefined,
      activity_id: activity_id || undefined,
      transaction_type_id: transaction_type_id || undefined,
    })

  useEffect(() => {
    if (isOpen) {
      reset({
        ...filter,
        transaction_type_id: filter?.transaction_type_id ?? 0,
        activity_id: filter?.activity_id ?? 0,
        material_id: filter?.material_id ?? 0,
      })
    }
  }, [filter, isOpen, reset])

  return (
    <BottomSheet isOpen={isOpen} toggleSheet={dismissBottomSheet} {...rest}>
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
            startDate={form.start_date}
            endDate={form.end_date}
            name='TransactionDateFilter'
            onApply={handleApplyDateRange}
            label={t('label.start_end_date')}
            placeholder={t('label.start_end_date')}
            testID='daterangepicker-transaction-filter'
          />
          <PickerSelect
            value={form.material_id}
            name='TransactionMaterialFilter'
            data={materialOptions}
            title={t('label.select_material')}
            label={getMaterialLabel(isHierarchy, t)}
            placeholder={getMaterialLabel(isHierarchy, t)}
            onSelect={handleSelectMaterial}
            radioButtonColor={colors.main()}
            searchPlaceholder={t('label.type_material_name')}
            search
            testID='pickerselect-material'
          />
          <PickerSelect
            value={form.activity_id}
            name='TransactionActivityFilter'
            data={activityOptions}
            title={t('label.select_activity')}
            label={t('label.activity')}
            placeholder={t('label.activity')}
            onSelect={handleSelectActivity}
            radioButtonColor={colors.main()}
            testID='pickerselect-activity'
          />
          <PickerSelect
            value={form.transaction_type_id}
            name='TransactionTransactionTypeFilter'
            data={trxTypeOptions}
            title={t('label.select_transaction_type')}
            label={t('label.transaction_type')}
            placeholder={t('label.transaction_type')}
            onSelect={handleSelectTransactionType}
            radioButtonColor={colors.main()}
            testID='pickerselect-transaction-type'
          />
        </View>
        <View className='flex-row justify-between border-t border-quillGrey items-center p-4 gap-x-2'>
          <Button
            preset='outlined-primary'
            containerClassName='flex-1'
            text={t('button.reset')}
            onPress={resetFilter}
            {...getTestID('btn-reset-transaction-filter')}
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

export default React.memo(TransactionFilterBottomSheet)
