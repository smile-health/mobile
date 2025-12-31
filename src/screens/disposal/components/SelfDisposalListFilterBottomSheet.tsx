import React, { useCallback } from 'react'
import { View, Text } from 'react-native'
import { useForm } from 'react-hook-form'
import { Icons } from '@/assets/icons'
import { BottomSheet } from '@/components/bottomsheet/BottomSheet'
import { Button, ImageButton } from '@/components/buttons'
import DateRangePicker from '@/components/filter/DateRangePicker'
import PickerSelect from '@/components/filter/PickerSelect'
import { useLanguage } from '@/i18n/useLanguage'
import { IOptions } from '@/models/Common'
import { SelfDisposalListFilter } from '@/models/disposal/SelfDisposalList'
import AppStyles from '@/theme/AppStyles'
import colors from '@/theme/colors'

interface SelfDisposalListFilterBottomSheetProps {
  isOpen: boolean
  filter: SelfDisposalListFilter
  toggleSheet: () => void
  onApply: (filter: SelfDisposalListFilter) => void
  activities?: IOptions[]
  materials?: IOptions[]
}

export default function SelfDisposalListFilterBottomSheet({
  isOpen,
  filter,
  toggleSheet,
  onApply,
  activities = [],
  materials = [],
}: Readonly<SelfDisposalListFilterBottomSheetProps>) {
  const { t } = useLanguage()

  const { handleSubmit, reset, watch, setValue } =
    useForm<SelfDisposalListFilter>({
      defaultValues: filter,
    })
  const form = watch()

  const handleApply = (data: SelfDisposalListFilter) => {
    onApply(data)
  }

  const handleReset = useCallback(() => {
    reset({})
  }, [reset])

  const handleApplyDateRange = useCallback(
    (start: string, end: string) => {
      reset((prev) => ({ ...prev, start_date: start, end_date: end }))
    },
    [reset]
  )

  const handleSelectActivity = useCallback(
    (item: IOptions) => {
      setValue('activity_id', item.value)
    },
    [setValue]
  )

  const handleSelectMaterial = useCallback(
    (item: IOptions) => {
      setValue('material_id', item.value)
    },
    [setValue]
  )

  return (
    <BottomSheet
      isOpen={isOpen}
      toggleSheet={toggleSheet}
      name='self-disposal-filter'>
      <View className='flex-1'>
        <View className='flex-row justify-between items-center p-4'>
          <Text className={AppStyles.textBold}>{t('label.all_filter')}</Text>
          <ImageButton onPress={toggleSheet} Icon={Icons.IcDelete} size={20} />
        </View>

        <View className='gap-y-2 px-4 mb-4'>
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
            value={form.activity_id}
            name='TransactionActivityFilter'
            data={activities}
            title={t('label.select_activity')}
            label={t('label.activity')}
            placeholder={t('label.activity')}
            onSelect={handleSelectActivity}
            radioButtonColor={colors.main()}
            testID='pickerselect-activity'
          />
          <PickerSelect
            value={form.material_id}
            name='TransactionMaterialFilter'
            data={materials}
            title={t('label.select_material')}
            label={t('label.material_name')}
            placeholder={t('label.material_name')}
            onSelect={handleSelectMaterial}
            radioButtonColor={colors.main()}
            searchPlaceholder={t('label.type_material_name')}
            search
            testID='pickerselect-material'
          />
        </View>

        {/* Buttons */}
        <View className='flex-row gap-3 p-4 border-t border-t-lightGreyMinimal'>
          <Button
            preset='outlined-primary'
            text={t('button.reset')}
            onPress={handleReset}
            containerClassName='flex-1'
          />
          <Button
            preset='filled'
            text={t('button.apply')}
            onPress={handleSubmit(handleApply)}
            containerClassName='flex-1 bg-main'
          />
        </View>
      </View>
    </BottomSheet>
  )
}
