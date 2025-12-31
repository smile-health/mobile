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

type MaintenanceFormProps = {
  errors: Record<string, any>
  form: AssetFormData
  trigger: UseFormTrigger<AssetFormData>
  handleSelect: (fieldName: keyof AssetFormData) => (item: IOptions) => void
  handleDateChange: (fieldName: keyof AssetFormData) => (date: Date) => void
  scheduleOptions: IOptions[]
  vendorOptions: IOptions[]
}

const MaintenanceForm: React.FC<MaintenanceFormProps> = ({
  errors,
  form,
  trigger,
  handleSelect,
  handleDateChange,
  scheduleOptions,
  vendorOptions,
}) => {
  const { t } = useLanguage()

  // Manual trigger validation for maintenance fields
  const handleMaintenanceFieldChange = () => {
    trigger([
      'maintenance_last_date',
      'maintenance_schedule_id',
      'maintenance_asset_vendor_id',
    ])
  }

  const handleMaintenanceDateChange =
    (fieldName: keyof AssetFormData) => (date: Date) => {
      handleDateChange(fieldName)(date)
      handleMaintenanceFieldChange()
    }

  const handleMaintenanceSelectChange =
    (fieldName: keyof AssetFormData) => (item: IOptions) => {
      handleSelect(fieldName)(item)
      handleMaintenanceFieldChange()
    }

  return (
    <View className='bg-white p-4'>
      <Text className={cn(AppStyles.textBold, 'text-midnightBlue mb-1')}>
        {t('asset.maintenance')}
      </Text>

      <InputDate
        date={form.maintenance_last_date}
        label={t('asset.last_maintenance_date')}
        placeholder={t('asset.last_maintenance_date')}
        onDateChange={handleMaintenanceDateChange('maintenance_last_date')}
        testID='inputdate-last-maintenance-date'
        errors={errors.maintenance_last_date?.message}
      />

      <PickerSelect
        value={form.maintenance_schedule_id}
        name='MaintenanceScheduleSelect'
        data={scheduleOptions}
        title={t('asset.maintenance_schedule')}
        label={t('asset.maintenance_schedule')}
        placeholder={t('asset.maintenance_schedule')}
        onSelect={handleMaintenanceSelectChange('maintenance_schedule_id')}
        radioButtonColor={colors.main()}
        testID='pickerselect-maintenance-schedule'
        errors={errors.maintenance_schedule_id?.message}
      />

      <PickerSelect
        value={form.maintenance_asset_vendor_id}
        name='MaintenanceVendorSelect'
        data={vendorOptions}
        title={t('asset.vendor')}
        label={t('asset.vendor')}
        placeholder={t('asset.vendor')}
        onSelect={handleMaintenanceSelectChange('maintenance_asset_vendor_id')}
        radioButtonColor={colors.main()}
        search
        testID='pickerselect-maintenance-vendor'
        errors={errors.maintenance_asset_vendor_id?.message}
      />
    </View>
  )
}

export default MaintenanceForm
