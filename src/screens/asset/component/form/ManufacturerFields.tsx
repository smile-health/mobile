import React from 'react'
import { View } from 'react-native'
import { TFunction } from 'i18next'
import { Control } from 'react-hook-form'
import { TextField } from '@/components/forms'
import { getTestID } from '@/utils/CommonUtils'
import { AssetFormData } from '../../schema/AssetInventorySchema'

type Props = {
  control: Control<AssetFormData>
  errors: Record<string, any>
  t: TFunction
}

const ManufacturerFields = React.memo(({ control, errors, t }: Props) => {
  return (
    <View className='mt-2 border border-quillGrey rounded p-2'>
      <TextField
        name='other_manufacture_name'
        control={control}
        label={t('asset.manufacturer_name')}
        placeholder={t('asset.manufacturer_name')}
        isMandatory
        errors={errors.other_manufacture_name?.message}
        {...getTestID('textfield-other-manufacture-name')}
      />
    </View>
  )
})

ManufacturerFields.displayName = 'ManufacturerFields'

export default ManufacturerFields
