import React from 'react'
import { View, Text } from 'react-native'
import PickerSelect from '@/components/filter/PickerSelect'
import { useLanguage } from '@/i18n/useLanguage'
import { IOptions } from '@/models/Common'
import AppStyles from '@/theme/AppStyles'
import colors from '@/theme/colors'
import { cn } from '@/theme/theme-config'
import { AssetFormData } from '../../schema/AssetInventorySchema'

type ElectricityFormProps = {
  errors: Record<string, any>
  form: AssetFormData
  handleSelect: (fieldName: keyof AssetFormData) => (item: IOptions) => void
  electricityAvailabilityOptions: IOptions[]
}

const ElectricityForm: React.FC<ElectricityFormProps> = ({
  errors,
  form,
  handleSelect,
  electricityAvailabilityOptions,
}) => {
  const { t } = useLanguage()

  return (
    <View className='bg-white p-4'>
      <Text className={cn(AppStyles.textBold, 'text-midnightBlue mb-1')}>
        {t('asset.electricity')}
      </Text>

      <PickerSelect
        value={form.asset_electricity_id}
        name='ElectricityAvailabilitySelect'
        data={electricityAvailabilityOptions}
        title={t('asset.electricity_availability_time')}
        label={t('asset.electricity_availability_time')}
        placeholder={t('asset.electricity_availability_time')}
        onSelect={handleSelect('asset_electricity_id')}
        radioButtonColor={colors.main()}
        testID='pickerselect-electricity-availability'
        errors={errors.asset_electricity_id?.message}
      />
    </View>
  )
}

export default ElectricityForm
