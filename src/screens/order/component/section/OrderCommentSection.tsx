import React from 'react'
import { View, Text, TextInput } from 'react-native'
import { TFunction } from 'i18next'
import { Control, FieldValues } from 'react-hook-form'
import { TextField } from '@/components/forms'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import { getTestID } from '@/utils/CommonUtils'

type FormValues = {
  comment: string
  date: string
}

interface OrderCommentSectionProps<T extends FieldValues = FormValues> {
  readonly t: TFunction
  readonly control: Control<T>
  readonly inputRef?: React.RefObject<TextInput | null>
  readonly errors?: string
}

// Memoized component to prevent unnecessary re-renders
const OrderCommentSection = React.memo(
  <T extends FieldValues = FormValues>({
    t,
    control,
    inputRef,
    errors,
  }: OrderCommentSectionProps<T>) => {
    return (
      <View className='bg-white mb-2'>
        <View className='bg-lightBlueGray w-full h-2' />
        <View className='p-4'>
          <Text className={cn(AppStyles.textBold)}>{t('label.comment')}</Text>
          <TextField
            name='comment'
            control={control}
            label={t('label.enter_comment')}
            placeholder={t('label.enter_comment')}
            containerClassName='mb-0 pb-0'
            labelClassName='mt-2'
            ref={inputRef}
            returnKeyType='done'
            enablesReturnKeyAutomatically={true}
            multiline={true}
            numberOfLines={3}
            textAlignVertical='top'
            errors={errors}
            {...getTestID('textfield-comment')}
          />
        </View>
        <View className='bg-lightBlueGray w-full h-2' />
      </View>
    )
  }
)

OrderCommentSection.displayName = 'OrderCommentSection'

export default OrderCommentSection
