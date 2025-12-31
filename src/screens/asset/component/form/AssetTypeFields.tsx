import React from 'react'
import { View } from 'react-native'
import { TFunction } from 'i18next'
import { Control, UseFormTrigger } from 'react-hook-form'
import { TextField } from '@/components/forms'
import { getTestID } from '@/utils/CommonUtils'
import { AssetFormData } from '../../schema/AssetInventorySchema'

interface Props {
  form: AssetFormData
  control: Control<AssetFormData>
  trigger: UseFormTrigger<AssetFormData>
  errors: Record<string, any>
  t: TFunction
}

const AssetTypeFields = React.memo(
  ({ form, control, trigger, errors, t }: Props) => {
    const handleTemperatureBlur = async () => {
      await trigger(['other_min_temperature', 'other_max_temperature'])
    }

    return (
      <View className='mt-2 border border-quillGrey rounded p-2'>
        <TextField
          name='other_asset_type_name'
          control={control}
          label={t('asset.asset_type_name')}
          placeholder={t('asset.asset_type_name')}
          isMandatory
          errors={errors.other_asset_type_name?.message}
          {...getTestID('textfield-other-asset-type-name')}
        />
        <TextField
          name='other_min_temperature'
          control={control}
          label={t('asset.asset_min_temperature')}
          placeholder={t('asset.asset_min_temperature')}
          defaultValue={String(form.other_min_temperature)}
          isMandatory
          keyboardType='numeric'
          onBlur={handleTemperatureBlur}
          errors={errors.other_min_temperature?.message}
          {...getTestID('textfield-temperature-min')}
        />
        <TextField
          name='other_max_temperature'
          control={control}
          label={t('asset.asset_max_temperature')}
          placeholder={t('asset.asset_max_temperature')}
          defaultValue={String(form.other_max_temperature)}
          isMandatory
          keyboardType='numeric'
          onBlur={handleTemperatureBlur}
          errors={errors.other_max_temperature?.message}
          {...getTestID('textfield-temperature-max')}
        />
      </View>
    )
  }
)

AssetTypeFields.displayName = 'AssetTypeFields'

export default AssetTypeFields
