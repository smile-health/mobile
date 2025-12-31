import React from 'react'
import { View, Text } from 'react-native'
import { Control } from 'react-hook-form'
import { TextField } from '@/components/forms'
import { useLanguage } from '@/i18n/useLanguage'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import ContactPersonField from './ContactPersonField'
import { AssetFormData } from '../../schema/AssetInventorySchema'

type EntityFormProps = {
  control: Control<AssetFormData>
  errors: Record<string, any>
  form: AssetFormData
}

const EntityForm: React.FC<EntityFormProps> = ({ control, errors, form }) => {
  const { t } = useLanguage()

  return (
    <View className='bg-white p-4'>
      <Text className={cn(AppStyles.textBold, 'text-midnightBlue mb-1')}>
        {t('asset.entity')}
      </Text>

      <TextField
        name='entity_name'
        control={control}
        label={t('asset.entity')}
        value={form.entity_name ?? ''}
        editable={false}
        errors={errors.entity_name?.message}
      />

      <ContactPersonField control={control} errors={errors} index={1} />
      <ContactPersonField
        control={control}
        errors={errors}
        index={2}
        isExpandable
      />
      <ContactPersonField
        control={control}
        errors={errors}
        index={3}
        isExpandable
      />
    </View>
  )
}

export default EntityForm
