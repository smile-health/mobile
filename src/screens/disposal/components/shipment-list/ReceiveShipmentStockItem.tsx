import React, { useCallback } from 'react'
import { View, Text } from 'react-native'
import { TFunction } from 'i18next'
import { useFormContext } from 'react-hook-form'
import ActivityLabel from '@/components/ActivityLabel'
import { InputNumber } from '@/components/forms'
import { InfoRow } from '@/components/list/InfoRow'
import { IShipmentDetailStockItem } from '@/models/disposal/DisposalShipmentStatus'
import AppStyles, { flexStyle } from '@/theme/AppStyles'
import { getTestID, numberFormat } from '@/utils/CommonUtils'
import { SHORT_DATE_FORMAT } from '@/utils/Constants'
import { convertString } from '@/utils/DateFormatUtils'
import { DISPOSAL_TYPE, disposalItemLabel } from '../../disposal-constant'
import { ReceiveShipmentForm } from '../../schema/ReceiveDisposalShipmentSchema'

interface Props {
  item: IShipmentDetailStockItem
  parentIndex: number
  index: number
  t: TFunction
}

type ReceivedQtyName = `items.${number}.stocks.${number}.received_qty`

const ShipmentStockSection = ({ items, title, t }) => {
  if (items.length === 0) return null
  return (
    <View className='mt-2 pt-1 border-t border-t-lightGreyMinimal'>
      <Text className={AppStyles.labelBold}>{title}</Text>
      {items.map((item) => (
        <InfoRow
          key={item.reason_id}
          label={t('disposal.reason_qty', {
            reason: item.reason_title,
            interpolation: { escapeValue: false },
          })}
          value={numberFormat(item.qty)}
          valueClassName='font-mainBold'
        />
      ))}
    </View>
  )
}

export default function ReceiveShipmentStockItem({
  item,
  parentIndex,
  index,
  t,
}: Readonly<Props>) {
  const {
    id,
    activity_name,
    qty,
    batch_code = '',
    expired_date,
    manufacture,
    discard,
    received,
  } = item

  const receivedQtyFieldName: ReceivedQtyName = `items.${parentIndex}.stocks.${index}.received_qty`
  const {
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<ReceiveShipmentForm>()

  const receivedQty = watch(receivedQtyFieldName)
  const itemLabel = disposalItemLabel[DISPOSAL_TYPE.SELF]

  const handleChangeReceivedQty = useCallback(
    (value: string) => {
      setValue(receivedQtyFieldName, value ? Number(value) : null, {
        shouldValidate: true,
      })
    },
    [receivedQtyFieldName, setValue]
  )

  return (
    <View className='mt-2 p-2 border border-lightGreyMinimal'>
      <View className='flex-row justify-between items-center mb-1'>
        <Text className={AppStyles.textRegular} style={flexStyle}>
          {batch_code}
        </Text>
        <ActivityLabel name={activity_name} />
      </View>
      <InfoRow
        label={t('disposal.disposal_shipment_qty')}
        value={numberFormat(qty)}
        valueClassName='font-mainBold'
      />
      {!!batch_code && (
        <View className='mt-2 pt-1 border-t border-t-lightGreyMinimal'>
          <InfoRow
            label={t('label.expired_date')}
            value={convertString(expired_date, SHORT_DATE_FORMAT)}
          />
          <InfoRow label={t('label.manufacturer')} value={manufacture ?? '-'} />
        </View>
      )}
      <ShipmentStockSection
        items={discard}
        title={t(itemLabel.stockDiscard)}
        t={t}
      />
      <ShipmentStockSection
        items={received}
        title={t(itemLabel.stockReceived)}
        t={t}
      />
      <InputNumber
        name={receivedQtyFieldName}
        control={control}
        label={t('disposal.received_qty')}
        placeholder={t('disposal.received_qty')}
        onChangeText={handleChangeReceivedQty}
        value={String(receivedQty ?? '')}
        errors={
          errors.items?.[parentIndex]?.stocks?.[index]?.received_qty?.message
        }
        isMandatory
        {...getTestID(`textfield-${id}-received-qty`)}
      />
    </View>
  )
}
