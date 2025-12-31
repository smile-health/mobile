import React, { useCallback } from 'react'
import { View, Text, Pressable } from 'react-native'
import { Path, useFormContext } from 'react-hook-form'
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated'
import { Icons } from '@/assets/icons'
import ActivityLabel from '@/components/ActivityLabel'
import CollapsableContainer from '@/components/CollapsableContainer'
import { InputNumber } from '@/components/forms'
import { InfoRow } from '@/components/list/InfoRow'
import { useLanguage } from '@/i18n/useLanguage'
import { BatchType } from '@/models/transaction/TransactionCreate'
import AppStyles, { flexStyle } from '@/theme/AppStyles'
import { getTestID, numberFormat } from '@/utils/CommonUtils'
import { SHORT_DATE_FORMAT } from '@/utils/Constants'
import { convertString } from '@/utils/DateFormatUtils'
import { TransferStockForm } from '../schema/CreateTransferStockSchema'

interface Props {
  index: number
  batchType: BatchType
  isSelected: boolean
  disableCollapse?: boolean
  onToggleDetail?: () => void
}

function TransferStockFormItem({
  index,
  batchType,
  isSelected,
  disableCollapse,
  onToggleDetail,
}: Readonly<Props>) {
  const { t } = useLanguage()

  const {
    control,
    watch,
    clearErrors,
    setValue,
    trigger,
    formState: { errors },
  } = useFormContext<TransferStockForm>()
  const itemFieldName: Path<TransferStockForm> = `items.${batchType}.${index}`
  const qtyFieldName: Path<TransferStockForm> = `items.${batchType}.${index}.change_qty`

  const {
    activity,
    available_qty,
    batch,
    budget_source,
    change_qty,
    price,
    stock_id,
    total_price,
  } = watch(itemFieldName)

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: withTiming(isSelected ? '180deg' : '0deg') }],
  }))

  const handleChangeStock = useCallback(
    (value: string) => {
      setValue(qtyFieldName, value ? Number(value) : null, {
        shouldValidate: value !== '',
      })
      if (value === '') {
        clearErrors(qtyFieldName)
      }
      trigger('items')
    },
    [setValue, qtyFieldName, trigger, clearErrors]
  )

  return (
    <View className='mx-4 bg-white border-quillGrey border p-3 mb-2 rounded-sm'>
      <Pressable
        className='gap-y-1'
        onPress={onToggleDetail}
        {...getTestID(`stock-${stock_id}`)}>
        <View className='flex-row items-center gap-x-2'>
          <Text className={AppStyles.textRegular} style={flexStyle}>
            {batch?.code ?? ''}
          </Text>
          <ActivityLabel name={activity?.name ?? ''} />
          {!disableCollapse && (
            <Animated.View style={iconStyle}>
              <Icons.IcExpandMore height={20} width={20} />
            </Animated.View>
          )}
        </View>
        <InfoRow
          label={t('label.available_stock')}
          value={numberFormat(available_qty)}
        />
        {batch?.id && (
          <React.Fragment>
            <View className='border-t border-quillGrey' />
            <InfoRow
              label={t('label.expired_date')}
              value={convertString(batch?.expired_date, SHORT_DATE_FORMAT)}
              valueClassName='uppercase'
            />
            <InfoRow
              label={t('label.manufacturer')}
              value={batch?.manufacture.name ?? ''}
            />
          </React.Fragment>
        )}
      </Pressable>
      <CollapsableContainer
        className='gap-y-1'
        expanded={disableCollapse ? true : isSelected}>
        <InfoRow
          label={t('label.production_date')}
          value={convertString(batch?.production_date, SHORT_DATE_FORMAT)}
          valueClassName='uppercase'
        />
        <View className='border-t border-quillGrey' />
        <InfoRow
          label={t('label.budget_source')}
          value={budget_source?.label ?? '-'}
        />
        <InfoRow label={t('label.price')} value={numberFormat(price) ?? '-'} />
        <InfoRow
          label={t('label.total_price')}
          value={numberFormat(total_price) ?? '-'}
        />
        <View className='border-t border-quillGrey' />
        <InputNumber
          name={qtyFieldName}
          control={control}
          label={t('transfer_stock.transfer_stock_qty')}
          placeholder={t('transfer_stock.transfer_stock_qty')}
          onChangeText={handleChangeStock}
          value={String(change_qty ?? '')}
          errors={errors.items?.[batchType]?.[index]?.change_qty?.message}
          {...getTestID(`textfield-transfer-stock-qty-${stock_id}`)}
        />
      </CollapsableContainer>
    </View>
  )
}

export default React.memo(TransferStockFormItem)
