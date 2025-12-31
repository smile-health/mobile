import React from 'react'
import { Text, View } from 'react-native'
import ActivityLabel from '@/components/ActivityLabel'
import { InfoRow } from '@/components/list/InfoRow'
import { useLanguage } from '@/i18n/useLanguage'
import AppStyles from '@/theme/AppStyles'
import { getTestID, numberFormat } from '@/utils/CommonUtils'
import { SHORT_DATE_FORMAT } from '@/utils/Constants'
import { convertString } from '@/utils/DateFormatUtils'

interface BatchDetailProps {
  code: string | null
  activityName: string | null
  qty: number | null
  expiredDate: string | null
  productionBy: string | null
  productionDate?: string
  status?: string
  consumptionQty?: number
  maxReturn?: number
}

function BatchDetail(props: Readonly<BatchDetailProps>) {
  const {
    code,
    expiredDate,
    productionBy,
    productionDate,
    activityName,
    qty,
    status,
    consumptionQty,
    maxReturn,
  } = props
  const { t } = useLanguage()
  return (
    <View
      className='px-3 py-2 rounded bg-catskillWhite gap-y-1 border border-lightGreyMinimal'
      {...getTestID(`BatchDetail-${code}`)}>
      <View className='flex-row items-center justify-between'>
        <Text className={AppStyles.textRegular}>{code}</Text>
        <ActivityLabel name={activityName} />
      </View>
      {consumptionQty ? (
        <InfoRow
          label={t('label.consumption_qty')}
          value={numberFormat(consumptionQty)}
          valueClassName='font-mainBold'
        />
      ) : (
        <InfoRow
          label={t('label.qty')}
          value={numberFormat(qty)}
          valueClassName='font-mainBold'
        />
      )}
      {!!maxReturn && (
        <InfoRow
          label={t('label.max_return')}
          value={numberFormat(maxReturn)}
          valueClassName='font-mainBold'
        />
      )}
      <InfoRow
        label={t('label.expired_date')}
        value={convertString(expiredDate, SHORT_DATE_FORMAT)}
        valueClassName='uppercase'
      />
      <InfoRow label={t('label.production_by')} value={productionBy} />
      {productionDate && (
        <InfoRow
          label={t('label.production_date')}
          value={convertString(productionDate, SHORT_DATE_FORMAT)}
          valueClassName='uppercase'
        />
      )}
      {status && <InfoRow label={t('label.status')} value={status} />}
    </View>
  )
}

export default React.memo(BatchDetail)
