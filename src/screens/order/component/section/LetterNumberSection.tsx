import React from 'react'
import { View, Text, TextInput } from 'react-native'
import { TFunction } from 'i18next'
import { Control, FieldValues } from 'react-hook-form'
import { TextField } from '@/components/forms'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import { getTestID } from '@/utils/CommonUtils'

type FormValues = {
  letter_number: string
}

interface LetterNumberSectionProps<T extends FieldValues = FormValues> {
  readonly t: TFunction
  readonly control: Control<T>
  readonly inputRef?: React.RefObject<TextInput>
  readonly errors: any
}

export default function LetterNumberSection<
  T extends FieldValues = FormValues,
>({ t, control, inputRef, errors }: LetterNumberSectionProps<T>) {
  return (
    <View className='bg-white mb-2'>
      <View className='bg-lightBlueGray w-full h-2' />
      <View className='p-4'>
        <Text className={cn(AppStyles.textBold)}>
          {t('label.letter_number')}
        </Text>
        <TextField
          isMandatory
          name='letter_number'
          control={control}
          label={t('label.letter_number')}
          placeholder={t('label.letter_number')}
          containerClassName='mb-0 pb-0'
          labelClassName='mt-2'
          ref={inputRef}
          returnKeyType='done'
          enablesReturnKeyAutomatically={true}
          multiline={false}
          numberOfLines={1}
          errors={errors?.letter_number?.message}
          {...getTestID('textfield-letter-number')}
        />
      </View>
    </View>
  )
}
