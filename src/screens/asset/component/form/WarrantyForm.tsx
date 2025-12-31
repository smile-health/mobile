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

type WarrantyFormProps = {
  errors: Record<string, any>
  form: AssetFormData
  trigger: UseFormTrigger<AssetFormData>
  handleSelect: (fieldName: keyof AssetFormData) => (item: IOptions) => void
  handleDateChange: (fieldName: keyof AssetFormData) => (date: Date) => void
  vendorOptions: IOptions[]
}

const WarrantyForm: React.FC<WarrantyFormProps> = ({
  errors,
  form,
  trigger,
  handleSelect,
  handleDateChange,
  vendorOptions,
}) => {
  const { t } = useLanguage()

  // Manual trigger for warranty fields validation
  const handleWarrantyFieldChange = async () => {
    await trigger([
      'warranty_start_date',
      'warranty_end_date',
      'warranty_asset_vendor_id',
    ])
  }

  const handleWarrantyDateChange =
    (fieldName: keyof AssetFormData) => (date: Date) => {
      handleDateChange(fieldName)(date)
      handleWarrantyFieldChange()
    }

  const handleWarrantySelectChange =
    (fieldName: keyof AssetFormData) => (item: IOptions) => {
      handleSelect(fieldName)(item)
      handleWarrantyFieldChange()
    }

  return (
    <View className='bg-white p-4'>
      <Text className={cn(AppStyles.textBold, 'text-midnightBlue mb-1')}>
        {t('asset.warranty')}
      </Text>

      <InputDate
        date={form.warranty_start_date}
        label={t('asset.warranty_start_date')}
        placeholder={t('asset.warranty_start_date')}
        maximumDate={form.warranty_end_date || undefined}
        onDateChange={handleWarrantyDateChange('warranty_start_date')}
        testID='input-warranty-start-date'
        errors={errors.warranty_start_date?.message}
      />

      <InputDate
        date={form.warranty_end_date}
        label={t('asset.warranty_end_date')}
        placeholder={t('asset.warranty_end_date')}
        minimumDate={form.warranty_start_date || undefined}
        onDateChange={handleWarrantyDateChange('warranty_end_date')}
        testID='input-warranty-end-date'
        errors={errors.warranty_end_date?.message}
      />

      <PickerSelect
        value={form.warranty_asset_vendor_id}
        name='WarrantyVendorSelect'
        data={vendorOptions}
        title={t('asset.vendor')}
        label={t('asset.vendor')}
        placeholder={t('asset.vendor')}
        onSelect={handleWarrantySelectChange('warranty_asset_vendor_id')}
        radioButtonColor={colors.main()}
        search
        testID='pickerselect-warranty-vendor'
        errors={errors.warranty_asset_vendor_id?.message}
      />
    </View>
  )
}

export default WarrantyForm
