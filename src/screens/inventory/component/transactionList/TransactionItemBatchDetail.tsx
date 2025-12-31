import React, { useCallback } from 'react'
import { View, Text } from 'react-native'
import ActivityLabel from '@/components/ActivityLabel'
import { InfoRow } from '@/components/list/InfoRow'
import { useLanguage } from '@/i18n/useLanguage'
import { CommonObject } from '@/models/Common'
import {
  TransactionPatient,
  TransactionPurchase,
  TransactionStockBatch,
} from '@/models/transaction/Transaction'
import AppStyles from '@/theme/AppStyles'
import { numberFormat } from '@/utils/CommonUtils'
import { SHORT_DATE_FORMAT } from '@/utils/Constants'
import { convertString } from '@/utils/DateFormatUtils'
import { identityTypeNames } from '../../constant/transaction.constant'
import PatientItem from '../transaction/PatientInfo/PatientItem'

interface Props {
  batch: TransactionStockBatch | null
  activity: CommonObject
  changeQty: number
  purchase: TransactionPurchase
  patients: TransactionPatient[]
  isBatch?: boolean
}

function TransactionItemBatchDetail({
  batch,
  changeQty,
  activity,
  purchase,
  isBatch,
  patients,
}: Readonly<Props>) {
  const { t } = useLanguage()
  const { year, price, budget_source } = purchase
  const isPurchase = !!purchase?.id
  const hasPatient = patients.length > 0

  const renderPatientItem = useCallback(
    (item: TransactionPatient, index: number) => {
      const isSequence = item.vaccine_sequence?.id && item.vaccine_method?.id
      const vaccineSequence = isSequence
        ? `${item.vaccine_method.title} (${item.vaccine_sequence.title})`
        : undefined
      return (
        <View
          key={item.identity_number}
          className='pt-1 gap-y-1 border-t border-lightGreyMinimal'>
          <Text className={AppStyles.textRegularSmall}>
            {t('label.patient_num', { num: index + 1 })}
          </Text>
          <PatientItem
            identityType={t(identityTypeNames[item.identity_type])}
            patientID={item.identity_number}
            phoneNumber={item.phone_number}
            vaccineSequence={vaccineSequence}
            containerClassName='gap-y-1'
          />
        </View>
      )
    },
    [t]
  )

  return (
    <View className='px-3 py-2 rounded bg-catskillWhite gap-y-1 border border-lightGreyMinimal'>
      {isBatch ? (
        <React.Fragment>
          <View className='flex-row justify-between'>
            <Text className={AppStyles.textBold}>{batch?.code ?? ''}</Text>
            <ActivityLabel name={activity.name} />
          </View>
          <InfoRow
            label={t('label.expired_date')}
            value={convertString(batch?.expired_date, SHORT_DATE_FORMAT)}
            valueClassName='uppercase'
          />
          <InfoRow
            label={t('label.production_by')}
            value={batch?.manufacture?.name ?? ''}
          />
          <InfoRow
            label={t('label.production_date')}
            value={convertString(batch?.production_date, SHORT_DATE_FORMAT)}
            valueClassName='uppercase'
          />
        </React.Fragment>
      ) : (
        <InfoRow
          label={t('label.taken_from_activity_stock')}
          value={activity.name}
        />
      )}
      {hasPatient &&
        patients.map((item, index) => renderPatientItem(item, index))}
      {isPurchase && (
        <View className='border-t border-quillGrey pt-1 gap-y-1'>
          <InfoRow
            label={t('label.budget_source')}
            value={budget_source?.name ?? '-'}
          />
          <InfoRow label={t('label.budget_year')} value={year ?? '-'} />
          <InfoRow
            label={t('label.total_price')}
            value={numberFormat(Math.abs((price ?? 0) * changeQty))}
          />
          <InfoRow
            label={t('label.price')}
            value={numberFormat(Math.abs(price ?? 0))}
          />
        </View>
      )}
    </View>
  )
}

export default React.memo(TransactionItemBatchDetail)
