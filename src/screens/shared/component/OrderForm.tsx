import React from 'react'
import { View, Text } from 'react-native'
import { useFormContext } from 'react-hook-form'
import Dropdown from '@/components/dropdown/Dropdown'
import { InputNumber, TextField } from '@/components/forms'
import { useLanguage } from '@/i18n/useLanguage'
import { ReasonOption } from '@/models/Common'
import AppStyles from '@/theme/AppStyles'
import { getTestID } from '@/utils/CommonUtils'
import { OTHER_REASON_ID } from '@/utils/Constants'

interface OrderFormProps {
  quantity: string
  reason: string
  shouldShowDropdownReason: boolean
  getOrderRecommendation: string
  editable?: boolean
  dataReason?: ReasonOption[]
}

export const OrderForm: React.FC<OrderFormProps> = (props) => {
  const { t } = useLanguage()
  const {
    quantity,
    shouldShowDropdownReason,
    getOrderRecommendation,
    editable,
    dataReason = [],
  } = props

  const {
    control,
    setValue,
    clearErrors,
    trigger,
    watch,
    formState: { errors },
  } = useFormContext<{
    quantity?: string
    reason?: number
    other_reason?: string
  }>()

  const reasonId = watch('reason')

  const handleChangeQty = (value: string) => {
    setValue('quantity', value, { shouldValidate: value !== '' })
    if (value === '') {
      clearErrors('quantity')
    }
    trigger('reason')
  }

  return (
    <View className='p-4 bg-white'>
      <Text className={AppStyles.textBold}>{t('label.order_quantity')}</Text>
      <InputNumber
        isMandatory
        name='quantity'
        control={control}
        value={quantity}
        label={t('label.order_qty')}
        placeholder={t('label.order_qty')}
        errors={errors?.quantity?.message}
        helper={getOrderRecommendation}
        onChangeText={handleChangeQty}
        editable={editable}
        {...getTestID('textfield-order-quantity')}
      />
      {shouldShowDropdownReason && (
        <>
          <Dropdown
            isMandatory
            preset='bottom-border'
            name='reason'
            control={control}
            data={dataReason}
            label={t('label.reason')}
            placeholder={t('label.select_reason')}
            labelField='value'
            valueField='reason_id'
            errors={errors?.reason?.message}
            itemTestIDField='value'
            itemAccessibilityLabelField='id'
            containerClassName='mt-4'
            {...getTestID('dropdown-reason')}
          />
          {reasonId === OTHER_REASON_ID && (
            <TextField
              isMandatory
              preset='default'
              name='other_reason'
              control={control}
              label={t('label.other_reason')}
              placeholder={t('label.other_reason')}
              errors={errors?.other_reason?.message}
              containerClassName='mt-4'
              {...getTestID('textfield-other-reason')}
            />
          )}
        </>
      )}
    </View>
  )
}
