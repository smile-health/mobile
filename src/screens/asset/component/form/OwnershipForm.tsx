import React from 'react'
import { View, Text } from 'react-native'
import { Control } from 'react-hook-form'
import { RadioButtonGroup } from '@/components/buttons'
import PickerSelect from '@/components/filter/PickerSelect'
import { TextField } from '@/components/forms'
import { useLanguage } from '@/i18n/useLanguage'
import { IOptions } from '@/models/Common'
import AppStyles from '@/theme/AppStyles'
import colors from '@/theme/colors'
import { cn } from '@/theme/theme-config'
import { getTestID } from '@/utils/CommonUtils'
import { AssetFormData } from '../../schema/AssetInventorySchema'

type OwnershipFormProps = {
  control: Control<AssetFormData>
  errors: Record<string, any>
  form: AssetFormData
  handleSelect: (fieldName: keyof AssetFormData) => (item: IOptions) => void
  borrowedFromOptions?: IOptions[]
}

const OwnershipForm: React.FC<OwnershipFormProps> = ({
  control,
  errors,
  form,
  handleSelect,
  borrowedFromOptions = [],
}) => {
  const { t } = useLanguage()

  const ownershipStatusOptions = [
    { label: t('asset.owned'), value: 1 },
    { label: t('asset.borrowed'), value: 2 },
  ]

  const labelAmount = t(
    form.ownership_status === 1 ? 'asset.owned_amount' : 'asset.borrowed_amount'
  )

  return (
    <View className='bg-white p-4'>
      <Text className={cn(AppStyles.textBold, 'text-midnightBlue mb-1')}>
        {t('asset.ownership')}
      </Text>

      <RadioButtonGroup
        name='ownership_status'
        control={control}
        label={t('asset.ownership_status')}
        items={ownershipStatusOptions}
        labelField='label'
        valueField='value'
        containerClassName='mt-2'
        horizontal
        labelClassName={cn(AppStyles.textRegularSmall, 'text-mediumGray')}
        errors={errors.ownership_status?.message}
        {...getTestID('radio-button-group-ownership-status')}
        isMandatory
      />

      {form.ownership_status === 2 && (
        <PickerSelect
          value={form.borrowed_from_entity_id}
          name='BorrowedFromSelect'
          data={borrowedFromOptions}
          title={t('asset.borrowed_from')}
          label={t('asset.borrowed_from')}
          placeholder={t('asset.borrowed_from')}
          onSelect={handleSelect('borrowed_from_entity_id')}
          radioButtonColor={colors.main()}
          search
          isMandatory
          testID='pickerselect-borrowed-from'
          errors={errors.borrowed_from_entity_id?.message}
        />
      )}

      {form.borrowed_from_entity_id === 0 && form.ownership_status === 2 && (
        <View className='mt-2 border border-quillGrey rounded p-2'>
          <TextField
            name='other_borrowed_from_entity_name'
            control={control}
            label={t('asset.borrowed_from_other')}
            placeholder={t('asset.borrowed_from_other')}
            isMandatory
            errors={errors.other_borrowed_from_entity_name?.message}
            {...getTestID('textfield-other-borrowed-from-entity-name')}
          />
        </View>
      )}

      <TextField
        name='ownership_qty'
        control={control}
        defaultValue={form.ownership_qty ? String(form.ownership_qty) : ''}
        label={labelAmount}
        placeholder={labelAmount}
        keyboardType='numeric'
        isMandatory
        errors={errors.ownership_qty?.message}
        {...getTestID('textfield-owned-amount')}
      />
    </View>
  )
}

export default OwnershipForm
