import React from 'react'
import { View, Text } from 'react-native'
import Dropdown from '@/components/dropdown/Dropdown'
import { TextField } from '@/components/forms'
import { InfoRow } from '@/components/list/InfoRow'
import Separator from '@/components/separator/Separator'
import { useLanguage } from '@/i18n/useLanguage'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import { getTestID, numberFormat } from '@/utils/CommonUtils'
import {
  MAX_INPUT_LENGTH,
  ORDER_EDIT_TYPE,
  OTHER_REASON_ID,
} from '@/utils/Constants'
import StockRange from './confirm/StockRange'
import { ChildMaterialItem } from './pending/ChildMaterialItem'
import { useOrderEditItem } from '../hooks/useOrderEditItem'
import { OrderEditItemProps } from '../types/order'

export const OrderEditItem = ({
  item,
  index,
  updateQuantity,
  updateReason,
  updateOtherReasonText,
  updateChildQuantity,
  showReasonDropdown = true,
  type,
  dataReason,
}: OrderEditItemProps) => {
  const { t } = useLanguage()

  const ORDER_REASONS = t('order.order_reasons', { returnObjects: true })

  const {
    control,
    qty,
    errors,
    qtyHelperMessage,
    shouldShowReasonDropdown,
    min,
    max,
    reason,
    otherReasonText,
    isMaterialHierarchy,
    watch,
    updateChildrenQty,
    isEdit,
    isValidate,
  } = useOrderEditItem(
    item,
    index,
    updateQuantity,
    updateReason,
    updateOtherReasonText,
    showReasonDropdown,
    type
  )

  const formatValue = (value: number | null) => {
    return value === null ? '-' : numberFormat(Number(value))
  }
  const isChildren = item?.children?.length > 0
  const shoudShowTrademarkMaterial = isMaterialHierarchy && isChildren

  const orderQty = qty === 0 ? '' : String(qty)
  const availableQty =
    type === ORDER_EDIT_TYPE.VALIDATE
      ? numberFormat(item.stock_customer?.total_available_qty ?? null) || '-'
      : numberFormat(item.stock_vendor?.total_available_qty ?? null) || '-'

  const getLabelInput = () => {
    if (isEdit) {
      return t('label.order_qty')
    }
    if (isValidate) {
      return t('label.validate_qty')
    }
    return t('label.confirmed_qty')
  }

  const labelInput = getLabelInput()

  const reasonId = Number(reason)
  const isOtherReason = reasonId === OTHER_REASON_ID

  const reasonValue = isOtherReason
    ? otherReasonText
    : item?.reason?.name || '-'

  const errorMessage = isEdit ? '' : errors.qty?.message

  const reasonRowStyles = {
    container: 'items-start',
    label: 'flex-none w-20',
    value: 'flex-1 font-mainBold text-right',
  }

  return (
    <View className='border border-whiteTwo rounded-xs bg-white p-2 mb-2 mx-4'>
      {isMaterialHierarchy && (
        <Text className={cn(AppStyles.textBoldSmall, 'text-mediumGray mb-1')}>
          {t('label.active_ingredient_material')}
        </Text>
      )}
      <Text className={cn(AppStyles.textBoldMedium, 'mb-2')}>
        {item.material?.name}
      </Text>
      <InfoRow
        label={t('label.ordered_qty')}
        value={numberFormat(item.ordered_qty) || '-'}
        valueClassName='font-mainBold'
        className='mb-2'
      />
      <StockRange min={formatValue(min)} max={formatValue(max)} />
      {shoudShowTrademarkMaterial ? (
        <View>
          {isEdit ? (
            <View className='bg-white mb-2'>
              <Dropdown
                isMandatory
                preset='bottom-border'
                name='reason'
                control={control}
                data={dataReason ?? ORDER_REASONS}
                label={t('label.reason')}
                placeholder={t('label.reason')}
                labelField='value'
                valueField='reason_id'
                value={reason}
                errors={errors.reason?.message}
                itemTestIDField='value'
                itemAccessibilityLabelField='id'
                {...getTestID('dropdown-reason')}
              />
              {isOtherReason && (
                <TextField
                  name='other_reason_text'
                  maxLength={MAX_INPUT_LENGTH}
                  control={control}
                  label={t('label.other_reason')}
                  placeholder={t('label.other_reason')}
                  isMandatory
                  errors={errors.other_reason_text?.message}
                  {...getTestID('textfield-other-reason')}
                />
              )}
            </View>
          ) : (
            <View>
              <Separator className='my-2' />
              <InfoRow
                label={t('label.reason')}
                value={reasonValue}
                className={reasonRowStyles.container}
                labelClassName={reasonRowStyles.label}
                valueClassName={reasonRowStyles.value}
              />
              <Separator className='my-2' />
            </View>
          )}
          <Text
            className={cn(
              AppStyles.textBoldSmall,
              'mb-1 flex-1 text-mediumGray'
            )}>
            {t('label.trademark_material')}
          </Text>
          {item.children.map((child, childIndex) => (
            <ChildMaterialItem
              key={child.id}
              type={type}
              labelInput={labelInput}
              child={child}
              childIndex={childIndex}
              parentIndex={index}
              control={control}
              t={t}
              watch={watch}
              updateChildrenQty={updateChildrenQty}
              updateChildQuantity={updateChildQuantity}
            />
          ))}
        </View>
      ) : (
        <View>
          <Separator className='my-2' />
          <InfoRow
            label={t('label.reason')}
            value={reasonValue}
            className={reasonRowStyles.container}
            labelClassName={reasonRowStyles.label}
            valueClassName={reasonRowStyles.value}
          />
          <Separator className='my-2' />
          <InfoRow
            label={t('label.available_stock')}
            value={availableQty}
            valueClassName='font-mainBold'
          />
          <Separator className='my-2' />
          <TextField
            isMandatory
            name='qty'
            label={labelInput}
            control={control}
            placeholder={labelInput}
            value={orderQty}
            keyboardType='numeric'
            containerClassName='mb-2 pb-0'
            errors={errorMessage}
            helper={qtyHelperMessage}
            labelClassName='mt-2'
            {...getTestID('textfield-order-qty')}
          />
          {shouldShowReasonDropdown && (
            <View className='bg-white mb-2'>
              <Dropdown
                isMandatory
                preset='bottom-border'
                name='reason'
                control={control}
                data={dataReason ?? ORDER_REASONS}
                value={reason}
                errors={errors.reason?.message}
                label={t('label.reason')}
                placeholder={t('label.reason')}
                labelField='value'
                valueField='reason_id'
                itemTestIDField='value'
                itemAccessibilityLabelField='id'
                {...getTestID('dropdown-reason')}
              />
              {isOtherReason && (
                <TextField
                  isMandatory
                  maxLength={MAX_INPUT_LENGTH}
                  name='other_reason_text'
                  label={t('label.other_reason')}
                  placeholder={t('label.other_reason')}
                  value={otherReasonText}
                  control={control}
                  errors={errors.other_reason_text?.message}
                  {...getTestID('textfield-other-reason')}
                />
              )}
            </View>
          )}
        </View>
      )}
    </View>
  )
}
