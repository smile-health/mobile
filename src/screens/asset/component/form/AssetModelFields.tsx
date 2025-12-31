import React from 'react'
import { View } from 'react-native'
import { TFunction } from 'i18next'
import { Control, UseFormTrigger } from 'react-hook-form'
import { TextField } from '@/components/forms'
import { getTestID } from '@/utils/CommonUtils'
import { AssetFormData } from '../../schema/AssetInventorySchema'

type Props = {
  form: AssetFormData
  control: Control<AssetFormData>
  trigger: UseFormTrigger<AssetFormData>
  errors: Record<string, any>
  t: TFunction
}

const AssetModelFields = React.memo(
  ({ form, control, trigger, errors, t }: Props) => {
    const handleCapacityBlur = async () => {
      await trigger(['other_gross_capacity', 'other_net_capacity'])
    }

    return (
      <View className='mt-2 border border-quillGrey rounded p-2'>
        <TextField
          name='other_asset_model_name'
          control={control}
          label={t('asset.asset_model_other')}
          placeholder={t('asset.asset_model_other')}
          isMandatory
          errors={errors.other_asset_model_name?.message}
          {...getTestID('textfield-other-asset-model-name')}
        />
        <TextField
          name='other_gross_capacity'
          control={control}
          label={t('asset.gross_capacity')}
          placeholder={t('asset.gross_capacity')}
          defaultValue={String(form.other_gross_capacity)}
          isMandatory
          keyboardType='numeric'
          onBlur={handleCapacityBlur}
          errors={errors.other_gross_capacity?.message}
          {...getTestID('textfield-other-gross-capacity')}
        />
        <TextField
          name='other_net_capacity'
          control={control}
          label={t('asset.nett_capacity')}
          placeholder={t('asset.nett_capacity')}
          defaultValue={String(form.other_net_capacity)}
          isMandatory
          keyboardType='numeric'
          onBlur={handleCapacityBlur}
          errors={errors.other_net_capacity?.message}
          {...getTestID('textfield-other-net-capacity')}
        />
      </View>
    )
  }
)

AssetModelFields.displayName = 'AssetModelFields'

export default AssetModelFields
