import React from 'react'
import { View } from 'react-native'
import { InfoRow } from '@/components/list/InfoRow'
import { useLanguage } from '@/i18n/useLanguage'
import { numberFormat } from '@/utils/CommonUtils'
import { DATE_TIME_FORMAT, SHORT_DATE_FORMAT } from '@/utils/Constants'
import { convertString } from '@/utils/DateFormatUtils'

interface Props {
  createdAt: string
  consumptionQty: number
  maxReturn: number
  batch: any
}

function TransactionReturnHFInfo({
  createdAt,
  consumptionQty,
  maxReturn,
  batch,
}: Readonly<Props>) {
  const { t } = useLanguage()
  return (
    <React.Fragment>
      <InfoRow
        label={t('label.consumption')}
        labelClassName='text-main'
        value={convertString(createdAt, DATE_TIME_FORMAT)}
      />
      <InfoRow
        label={t('label.consumption_qty')}
        value={numberFormat(Math.abs(consumptionQty))}
        valueClassName='font-mainBold'
      />
      <InfoRow
        label={t('label.max_return')}
        value={numberFormat(maxReturn)}
        valueClassName='font-mainBold'
      />
      {batch && (
        <View className='border-t border-quillGrey pt-1 mt-1'>
          <InfoRow
            label={t('label.expired_date')}
            value={convertString(batch.expired_date, SHORT_DATE_FORMAT)}
            valueClassName='uppercase'
          />
          <InfoRow
            label={t('label.manufacturer')}
            value={batch.manufacture?.name}
            valueClassName='font-mainBold'
          />
          <InfoRow
            label={t('label.production_date')}
            value={convertString(batch.production_date, SHORT_DATE_FORMAT)}
            valueClassName='uppercase'
          />
        </View>
      )}
    </React.Fragment>
  )
}

export default React.memo(TransactionReturnHFInfo)
