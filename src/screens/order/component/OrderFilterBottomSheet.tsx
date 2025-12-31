import React, { memo } from 'react'
import { View, Text } from 'react-native'
import { Icons } from '@/assets/icons'
import {
  BottomSheet,
  BottomSheetProps,
} from '@/components/bottomsheet/BottomSheet'
import { BaseButton, Button } from '@/components/buttons'
import DateRangePicker from '@/components/filter/DateRangePicker'
import PickerSelect from '@/components/filter/PickerSelect'
import { useLanguage } from '@/i18n/useLanguage'
import { BaseEntity } from '@/models'
import { IOptions } from '@/models/Common'
import AppStyles from '@/theme/AppStyles'
import colors from '@/theme/colors'
import { getTestID } from '@/utils/CommonUtils'
import { useRelocationFilter } from '../hooks/relocation/useRelocationFilter'

export interface OrderFilterBottomSheetProps extends BottomSheetProps {
  vendor: BaseEntity[]
  customer: BaseEntity[]
  activities?: IOptions[]
}

const OrderFilterBottomSheet = ({
  vendor = [],
  customer = [],
  activities = [],
  toggleSheet,
  ...props
}: Readonly<OrderFilterBottomSheetProps>) => {
  const { t } = useLanguage()

  const {
    form,
    actions: {
      handleSubmit,
      handleResetFilter,
      handleApplyDateRange,
      handleSelectActivity,
      handleSelectEntity,
      handleSelectOrderType,
      handleSelectOrderIntegration,
      onPressApply,
      dismissBottomSheet,
    },
    data: { ORDER_TYPE_LIST, ORDER_INTEGRATION_LIST },
    flags: { isRelocationDisabled },
    entityConfig,
  } = useRelocationFilter({ vendor, customer, toggleSheet })

  return (
    <BottomSheet toggleSheet={dismissBottomSheet} {...props}>
      <View className='p-4'>
        <View className='flex-row justify-between items-center mb-2.5'>
          <Text className={AppStyles.textBold}>{t('label.all_filter')}</Text>
          <BaseButton
            onPress={dismissBottomSheet}
            textClassName='text-deepBlue font-mainBold'>
            <Icons.IcClose height={16} width={16} />
          </BaseButton>
        </View>

        <View className='gap-y-2 mb-10'>
          <PickerSelect
            value={Number(form.type)}
            name='RelocationOrderTypeFilter'
            data={ORDER_TYPE_LIST}
            title={t('label.order_type')}
            label={t('label.order_type')}
            placeholder={t('label.order_type')}
            onSelect={handleSelectOrderType}
            radioButtonColor={colors.main()}
            testID='pickerselect-order-type'
          />
          <PickerSelect
            value={form.integration}
            name='RelocationOrderIntegrationFilter'
            data={ORDER_INTEGRATION_LIST}
            title={t('filter.integration_type')}
            label={t('filter.integration_type')}
            placeholder={t('filter.integration_type')}
            onSelect={handleSelectOrderIntegration}
            radioButtonColor={colors.main()}
            testID='pickerselect-order-integration'
          />
          <PickerSelect
            disabled={isRelocationDisabled}
            value={Number(entityConfig.value)}
            name='RelocationActivityFilter'
            data={entityConfig.list}
            title={entityConfig.label}
            label={entityConfig.label}
            placeholder={entityConfig.label}
            onSelect={handleSelectEntity}
            radioButtonColor={colors.main()}
            testID='pickerselect-entity'
          />
          <PickerSelect
            value={form.activity_id}
            name='RelocationActivityFilter'
            data={activities}
            title={t('label.select_activity')}
            label={t('label.activity')}
            placeholder={t('label.activity')}
            onSelect={handleSelectActivity}
            radioButtonColor={colors.main()}
            testID='pickerselect-activity'
          />
          <DateRangePicker
            startDate={form.from_date || undefined}
            endDate={form.to_date || undefined}
            name='RelocationDateFilter'
            onApply={handleApplyDateRange}
            label={t('label.start_end_date')}
            placeholder={t('label.start_end_date')}
            testID='daterangepicker-relocation-filter'
          />
        </View>

        <View className='flex-row justify-between items-center gap-x-2'>
          <Button
            preset='outlined-primary'
            text={t('button.reset')}
            containerClassName='border flex-1'
            onPress={handleResetFilter}
            {...getTestID('btn-reset-order-filter')}
          />
          <Button
            preset='filled'
            text={t('button.apply')}
            containerClassName='flex-1'
            onPress={handleSubmit(onPressApply)}
            {...getTestID('btn-apply-order-filter')}
          />
        </View>
      </View>
    </BottomSheet>
  )
}

export default memo(OrderFilterBottomSheet)
