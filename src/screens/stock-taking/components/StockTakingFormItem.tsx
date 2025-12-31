import React from 'react'
import { Text, View } from 'react-native'
import { Path, useFormContext } from 'react-hook-form'
import ActivityLabel from '@/components/ActivityLabel'
import { InputNumber } from '@/components/forms'
import { InfoRow } from '@/components/list/InfoRow'
import { useLanguage } from '@/i18n/useLanguage'
import AppStyles, { flexStyle } from '@/theme/AppStyles'
import { getTestID, numberFormat } from '@/utils/CommonUtils'
import { SHORT_DATE_FORMAT } from '@/utils/Constants'
import { convertString } from '@/utils/DateFormatUtils'
import { StockTakingForm } from '../schema/CreateStockTakingSchema'

interface Props {
  index: number
}

function StockTakinfFormItem({ index }: Readonly<Props>) {
  const { t } = useLanguage()
  const {
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<StockTakingForm>()
  const itemField: Path<StockTakingForm> = `items.${index}`
  const actualQtyField: Path<StockTakingForm> = `items.${index}.actual_qty`
  const {
    actual_qty,
    activity_name = '',
    in_transit_qty,
    batch_code = '',
    recorded_qty,
    expired_date,
  } = watch(itemField)

  const handleChangeActualQty = (value: string) => {
    setValue(actualQtyField, value ? Number(value) : null, {
      shouldValidate: true,
    })
  }

  return (
    <View className=' bg-white mx-4 p-3 mb-2 rounded-sm border border-quillGrey'>
      <View className='flex-row items-center gap-x-2'>
        <Text className={AppStyles.textRegular} style={flexStyle}>
          {batch_code}
        </Text>
        <ActivityLabel name={activity_name} />
      </View>
      <View className='gap-y-1 mt-2 pb-1 border-b border-quillGrey'>
        <InfoRow
          label={t('label.remaining_stock_smile')}
          value={numberFormat(recorded_qty)}
        />
        <InfoRow
          label={t('label.stock_in_transit')}
          value={numberFormat(in_transit_qty)}
        />
        {expired_date && (
          <InfoRow
            label={t('label.expired_date')}
            value={convertString(expired_date, SHORT_DATE_FORMAT)}
            valueClassName='uppercase'
          />
        )}
      </View>
      <InputNumber
        name={actualQtyField}
        control={control}
        label={t('label.real_stock_remaining')}
        placeholder={t('label.real_stock_remaining')}
        onChangeText={handleChangeActualQty}
        value={String(actual_qty ?? '')}
        errors={errors.items?.[index]?.actual_qty?.message}
        {...getTestID(`textfield-${index}-actual-qty`)}
      />
    </View>
  )
}

export default React.memo(StockTakinfFormItem)
