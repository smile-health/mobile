import React, { memo, useMemo } from 'react'
import { View, Text } from 'react-native'
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
import { IDisposalShipmentFilter } from '@/models/disposal/DisposalShipmentList'
import AppStyles from '@/theme/AppStyles'
import colors from '@/theme/colors'
import { getTestID } from '@/utils/CommonUtils'
import useDisposalShipmentFilterForm from '../../hooks/useDisposalShipmentFilterForm'

export interface Props extends BottomSheetProps {
  filter: IDisposalShipmentFilter
  isSender: boolean
  receivers: IOptions[]
  senders: IOptions[]
  activities: IOptions[]
  onApply: (filter: IDisposalShipmentFilter) => void
}

const DisposalShipmentFilterBottomSheet = ({
  filter,
  isSender,
  receivers,
  senders,
  activities,
  isOpen,
  onApply,
  toggleSheet,
  ...props
}: Readonly<Props>) => {
  const { t } = useLanguage()
  const {
    form,
    reset,
    handleSelect,
    handleApplyDateRange,
    handleResetFilter,
    handleSubmit,
  } = useDisposalShipmentFilterForm({ filter, isOpen })

  const entityConfig = useMemo(
    () => ({
      list: isSender ? receivers : senders,
      label: isSender ? t('disposal.receiver') : t('disposal.sender'),
      name: isSender ? 'customer_id' : 'vendor_id',
      value: isSender ? form.customer_id : form.vendor_id,
    }),
    [isSender, receivers, senders, t, form.vendor_id, form.customer_id]
  )

  const dismissBottomSheet = () => {
    reset(filter)
    toggleSheet()
  }

  const onApplyFilter = (data) => {
    const { from_date, to_date, vendor_id, customer_id, activity_id } = data
    onApply({ from_date, to_date, vendor_id, customer_id, activity_id })
    toggleSheet()
  }

  return (
    <BottomSheet isOpen={isOpen} toggleSheet={dismissBottomSheet} {...props}>
      <View className='p-4'>
        <View className='flex-row justify-between items-center'>
          <Text className={AppStyles.textBold}>{t('label.all_filter')}</Text>
          <ImageButton
            onPress={dismissBottomSheet}
            Icon={Icons.IcDelete}
            size={20}
            {...getTestID('btn-close-filter')}
          />
        </View>

        <View className='gap-y-2 mb-10'>
          <DateRangePicker
            startDate={form.from_date}
            endDate={form.to_date}
            name='DisposalShipmentDateFilter'
            onApply={handleApplyDateRange}
            label={t('label.start_end_date')}
            testID='daterangepicker-disposal-shipment-filter'
          />
          <PickerSelect
            value={entityConfig.value}
            name='DisposalShipmentEntityFilter'
            data={entityConfig.list}
            title={entityConfig.label}
            label={entityConfig.label}
            radioButtonColor={colors.main()}
            onSelect={handleSelect(
              entityConfig.name as keyof IDisposalShipmentFilter
            )}
            testID='pickerselect-entity'
          />
          <PickerSelect
            value={form.activity_id}
            name='DisposalShipmentActivityFilter'
            data={activities}
            title={t('label.select_activity')}
            label={t('label.activity')}
            onSelect={handleSelect('activity_id')}
            radioButtonColor={colors.main()}
            testID='pickerselect-activity'
          />
        </View>

        <View className='flex-row justify-between items-center gap-x-2'>
          <Button
            preset='outlined-primary'
            text={t('button.reset')}
            containerClassName='border flex-1'
            onPress={handleResetFilter}
            {...getTestID('btn-reset-disposal-shipment-filter')}
          />
          <Button
            preset='filled'
            text={t('button.apply')}
            containerClassName='flex-1'
            onPress={handleSubmit(onApplyFilter)}
            {...getTestID('btn-apply-disposal-shipment-filter')}
          />
        </View>
      </View>
    </BottomSheet>
  )
}

export default memo(DisposalShipmentFilterBottomSheet)
