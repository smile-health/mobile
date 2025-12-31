import React from 'react'
import { Text, View } from 'react-native'
import { Control, useController } from 'react-hook-form'
import { InputNumber } from '@/components/forms'
import { useLanguage } from '@/i18n/useLanguage'
import { AddDisposalForm } from '@/models/disposal/CreateSelfDisposal'
import { DisposalSectionItem } from '@/models/disposal/DisposalMaterial'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import {
  disposalItemLabel,
  DisposalQtyType,
  disposalQtyTypeLabel,
  DisposalType,
} from '../disposal-constant'

interface DisposalInputItemProps {
  item: DisposalSectionItem
  name: string
  type: DisposalType
  qtyType: DisposalQtyType
  control?: Control<AddDisposalForm>
  errors?: string
}
type DisposalQtyFieldName = `${'received' | 'discard'}.${number}.disposal_qty`
function DisposalInputItem({
  item,
  name,
  type,
  qtyType,
  control,
  errors,
}: Readonly<DisposalInputItemProps>) {
  const { t } = useLanguage()
  const label = disposalItemLabel[type]

  const {
    field: { value, onChange },
  } = useController({
    control,
    name: name as DisposalQtyFieldName,
  })

  const handleChangeQty = (val: string) => {
    onChange(Number(val))
  }
  return (
    <View className='bg-white rounded-sm border-quillGrey border p-3 mx-4 mb-2'>
      <Text className={cn(AppStyles.textRegular)}>{item.title}</Text>
      <View className='flex-row justify-between my-2 border-b border-b-lightGreyMinimal pb-1'>
        <Text className={cn(AppStyles.labelRegular)}>
          {t(disposalQtyTypeLabel[qtyType])}
        </Text>
        <Text className={cn(AppStyles.textBoldSmall)}>{item.disposal_qty}</Text>
      </View>
      <View className=''>
        <InputNumber
          name={name}
          label={t(label.qty)}
          placeholder={t(label.qty)}
          control={control}
          value={String(value)}
          onChangeText={handleChangeQty}
          editable={!!item.disposal_qty}
          errors={errors}
        />
      </View>
    </View>
  )
}

export default React.memo(DisposalInputItem)
