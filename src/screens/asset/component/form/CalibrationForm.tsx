import React from 'react'
import { View, Text } from 'react-native'
import { UseFormTrigger } from 'react-hook-form'
import PickerSelect from '@/components/filter/PickerSelect'
import InputDate from '@/components/forms/InputDate'
import { useLanguage } from '@/i18n/useLanguage'
import { IOptions } from '@/models/Common'
import AppStyles from '@/theme/AppStyles'
import colors from '@/theme/colors'
import { cn } from '@/theme/theme-config'
import { AssetFormData } from '../../schema/AssetInventorySchema'

type CalibrationFormProps = {
  errors: Record<string, any>
  form: AssetFormData
  trigger: UseFormTrigger<AssetFormData>
  handleSelect: (fieldName: keyof AssetFormData) => (item: IOptions) => void
  handleDateChange: (fieldName: keyof AssetFormData) => (date: Date) => void
  scheduleOptions: IOptions[]
  vendorOptions: IOptions[]
}

const CalibrationForm: React.FC<CalibrationFormProps> = ({
  errors,
  form,
  trigger,
  handleSelect,
  handleDateChange,
  scheduleOptions,
  vendorOptions,
}) => {
  const { t } = useLanguage()

  // Manual trigger validation for calibration fields
  const handleCalibrationFieldChange = () => {
    trigger([
      'calibration_last_date',
      'calibration_schedule_id',
      'calibration_asset_vendor_id',
    ])
  }

  const handleCalibrationDateChange =
    (fieldName: keyof AssetFormData) => (date: Date) => {
      handleDateChange(fieldName)(date)
      handleCalibrationFieldChange()
    }

  const handleCalibrationSelectChange =
    (fieldName: keyof AssetFormData) => (item: IOptions) => {
      handleSelect(fieldName)(item)
      handleCalibrationFieldChange()
    }

  return (
    <View className='bg-white p-4'>
      <Text className={cn(AppStyles.textBold, 'text-midnightBlue mb-1')}>
        {t('asset.calibration')}
      </Text>

      <InputDate
        date={form.calibration_last_date}
        label={t('asset.last_calibration_date')}
        placeholder={t('asset.last_calibration_date')}
        onDateChange={handleCalibrationDateChange('calibration_last_date')}
        testID='input-last-calibration-date'
        errors={errors.calibration_last_date?.message}
      />

      <PickerSelect
        value={form.calibration_schedule_id}
        name='CalibrationScheduleSelect'
        data={scheduleOptions}
        title={t('asset.calibration_schedule')}
        label={t('asset.calibration_schedule')}
        placeholder={t('asset.calibration_schedule')}
        onSelect={handleCalibrationSelectChange('calibration_schedule_id')}
        radioButtonColor={colors.main()}
        testID='pickerselect-calibration-schedule'
        errors={errors.calibration_schedule_id?.message}
      />

      <PickerSelect
        value={form.calibration_asset_vendor_id}
        name='CalibrationVendorSelect'
        data={vendorOptions}
        title={t('asset.vendor')}
        label={t('asset.vendor')}
        placeholder={t('asset.vendor')}
        onSelect={handleCalibrationSelectChange('calibration_asset_vendor_id')}
        radioButtonColor={colors.main()}
        search
        testID='pickerselect-calibration-vendor'
        errors={errors.calibration_asset_vendor_id?.message}
      />
    </View>
  )
}

export default CalibrationForm
