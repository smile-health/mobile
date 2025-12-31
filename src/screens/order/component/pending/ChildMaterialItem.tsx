import React from 'react'
import { View, Text } from 'react-native'
import { TFunction } from 'i18next'
import { Control, UseFormReturn } from 'react-hook-form'
import { InputNumber } from '@/components/forms'
import { InfoRow } from '@/components/list/InfoRow'
import Separator from '@/components/separator/Separator'
import AppStyles from '@/theme/AppStyles'
import { getTestID, numberFormat } from '@/utils/CommonUtils'
import { ORDER_EDIT_TYPE } from '@/utils/Constants'
import { ItemType } from '../../hooks/useOrderEditItem'
import { OrderEditType } from '../../types/order'
import StockRange from '../confirm/StockRange'

interface ChildMaterialItemProps {
  child: ItemType
  childIndex: number
  control: Control<any>
  t: TFunction
  watch: UseFormReturn<any>['watch']
  updateChildrenQty: (childIndex: number, value: string) => void
  updateChildQuantity: (
    parentIndex: number,
    childId: number,
    value: string
  ) => void
  parentIndex: number
  labelInput?: string
  type: OrderEditType
}

export const ChildMaterialItem = ({
  child,
  childIndex,
  control,
  t,
  watch,
  updateChildQuantity,
  parentIndex,
  labelInput = t('label.confirmed_qty'),
  updateChildrenQty,
  type,
}: ChildMaterialItemProps) => {
  const validateQty = (value: string) => {
    if (Number(value) > Number(child.stock_vendor?.total_available_qty)) {
      return t('transaction.validation.max_qty')
    }
    return ''
  }

  const availableQty =
    type === ORDER_EDIT_TYPE.VALIDATE
      ? numberFormat(child.stock_customer?.total_available_qty ?? null) || '-'
      : numberFormat(child.stock_vendor?.total_available_qty ?? null) || '-'
  const qty = watch(`children.${childIndex}.confirmed_qty`)
  const isEditType = type === 'edit'

  const onChangeText = (value: string) => {
    updateChildQuantity(parentIndex, child.id, value)

    // update qty form
    updateChildrenQty(childIndex, value)
  }

  const errorMessage = validateQty(String(qty))

  return (
    <View
      key={child.id}
      className='border border-lightGreyMinimal rounded-xs bg-catskillWhite p-2 mb-2'>
      <Text className={AppStyles.textMediumMedium}>{child.material?.name}</Text>
      {isEditType ? (
        <>
          <InfoRow
            label={t('label.available_stock')}
            value={availableQty}
            valueClassName='font-mainBold'
            className='my-1'
          />
          <StockRange
            min={numberFormat(child?.stock_vendor?.min ?? null)}
            max={numberFormat(child?.stock_vendor?.max ?? null)}
            containerClassName='my-1'
          />
          <Separator />
          <InputNumber
            name={`children.${childIndex}.confirmed_qty`}
            control={control}
            label={labelInput}
            placeholder={labelInput}
            isMandatory
            onChangeText={onChangeText}
            value={String(qty)}
            {...getTestID(`textfield-confirmed-qty-${child.id}`)}
          />
        </>
      ) : (
        <>
          <InfoRow
            label={t('label.ordered_qty')}
            value={numberFormat(child.ordered_qty) || '-'}
            valueClassName='font-mainBold'
            className='my-1'
          />
          <StockRange
            min={numberFormat(child?.stock_vendor?.min ?? null)}
            max={numberFormat(child?.stock_vendor?.max ?? null)}
            containerClassName='my-1'
          />
          <Separator className='my-2' />
          <InfoRow
            label={t('label.available_stock')}
            value={availableQty}
            valueClassName='font-mainBold'
          />
          <Separator className='my-2' />
          <InputNumber
            name={`children.${childIndex}.confirmed_qty`}
            control={control}
            label={labelInput}
            placeholder={labelInput}
            isMandatory
            onChangeText={onChangeText}
            value={String(qty)}
            errors={errorMessage}
            {...getTestID(`textfield-confirmed-qty-${child.id}`)}
          />
        </>
      )}
    </View>
  )
}
