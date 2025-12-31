import React from 'react'
import { View, Text } from 'react-native'
import PickerSelect from '@/components/filter/PickerSelect'
import { useLanguage } from '@/i18n/useLanguage'
import { IOptions } from '@/models/Common'
import AppStyles from '@/theme/AppStyles'
import colors from '@/theme/colors'
import { cn } from '@/theme/theme-config'
import { AssetFormData } from '../../schema/AssetInventorySchema'

type WorkingStatusFormProps = {
  errors: Record<string, any>
  form: AssetFormData
  handleSelect: (fieldName: keyof AssetFormData) => (item: IOptions) => void
  workingStatusOptions: IOptions[]
}

const WorkingStatusForm: React.FC<WorkingStatusFormProps> = ({
  errors,
  form,
  handleSelect,
  workingStatusOptions,
}) => {
  const { t } = useLanguage()

  return (
    <View className='bg-white p-4'>
      <Text className={cn(AppStyles.textBold, 'text-midnightBlue mb-1')}>
        {t('asset.working_status')}
      </Text>

      <PickerSelect
        value={form.asset_working_status_id}
        name='WorkingStatusSelect'
        data={workingStatusOptions}
        title={t('asset.working_status')}
        label={t('asset.working_status')}
        placeholder={t('asset.working_status')}
        onSelect={handleSelect('asset_working_status_id')}
        radioButtonColor={colors.main()}
        testID='pickerselect-working-status'
        errors={errors.asset_working_status_id?.message}
        isMandatory
      />
    </View>
  )
}

export default WorkingStatusForm
