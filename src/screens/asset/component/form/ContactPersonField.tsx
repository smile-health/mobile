import React, { useState } from 'react'
import { View, Text, Pressable } from 'react-native'
import { Control } from 'react-hook-form'
import { Icons } from '@/assets/icons'
import { TextField } from '@/components/forms'
import PhoneInput from '@/components/phone-input/PhoneInput'
import { useLanguage } from '@/i18n/useLanguage'
import AppStyles from '@/theme/AppStyles'
import { AssetFormData } from '../../schema/AssetInventorySchema'

type ContactPersonFieldProps = {
  control: Control<AssetFormData, object>
  errors: Record<string, any>
  index: number
  isExpandable?: boolean
}

const ContactPersonField: React.FC<ContactPersonFieldProps> = ({
  control,
  errors,
  index,
  isExpandable = false,
}) => {
  const { t } = useLanguage()

  const [isExpanded, setIsExpanded] = useState(!isExpandable)
  const nameField = `contact_person_user_${index}_name`
  const numberField = `contact_person_user_${index}_number`

  const handleToggle = () => setIsExpanded((prev) => !prev)

  return (
    <View className={'mt-2 border border-quillGrey rounded p-2'}>
      <Pressable
        className='flex-row items-center justify-between'
        onPress={handleToggle}
        disabled={!isExpandable}>
        <Text className={AppStyles.labelBold}>
          {`${t('asset.contact_person')} ${index > 1 ? index : ''}`}
        </Text>

        {isExpandable && (
          <Icons.IcExpandMore
            height={20}
            width={20}
            style={{
              transform: [{ rotate: isExpanded ? '180deg' : '0deg' }],
            }}
          />
        )}
      </Pressable>

      {isExpanded && (
        <>
          <TextField
            name={nameField}
            control={control}
            label={t('asset.contact_person')}
            placeholder={`${t('asset.contact_person')} ${index}`}
            testID={`textfield-contact-person-name-${index}`}
            errors={errors[nameField]?.message}
            isMandatory={index === 1}
          />

          <PhoneInput
            name={numberField}
            control={control}
            placeholder={t('label.phone_number')}
            errors={errors[numberField]?.message}
          />
        </>
      )}
    </View>
  )
}

export default React.memo(ContactPersonField)
