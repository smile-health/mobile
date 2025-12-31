import React, { useMemo } from 'react'
import { Text, View } from 'react-native'
import ActivityLabel from '@/components/ActivityLabel'
import { InfoRow } from '@/components/list/InfoRow'
import { useLanguage } from '@/i18n/useLanguage'
import { Stock } from '@/models/shared/Material'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import { getTestID, numberFormat } from '@/utils/CommonUtils'
import { EXPIRATION_STATUS, SHORT_DATE_FORMAT } from '@/utils/Constants'
import { checkExpiration, convertString } from '@/utils/DateFormatUtils'

interface Props {
  item: Stock
  testID: string
  children: React.ReactNode
}

const formatAbsNumber = (value: number) => {
  return numberFormat(Math.abs(value))
}

const expiryStatusColor = {
  [EXPIRATION_STATUS.EXPIRED]: {
    alert: 'bg-lavaRed',
    text: 'text-lavaRed',
    background: 'bg-softPink',
  },
  [EXPIRATION_STATUS.NEAR_ED]: {
    alert: 'bg-vividOrange',
    text: 'text-vividOrange',
    background: 'bg-softIvory',
  },
}

function ExpiredDateStatus({ expiredDate, status, t }) {
  if (status === EXPIRATION_STATUS.VALID) {
    return (
      <InfoRow
        label={t('label.expired_date')}
        value={convertString(expiredDate, SHORT_DATE_FORMAT)}
        valueClassName='uppercase'
      />
    )
  }
  const color = expiryStatusColor[status]
  return (
    <View
      className={cn(
        'p-1 flex-row items-center gap-x-1 rounded-sm',
        color.background
      )}>
      <View className={cn('h-2 w-2 rounded-full', color.alert)} />
      <Text className={cn(AppStyles.labelRegular, color.text, 'flex-1')}>
        {t('label.expired_date')}
      </Text>
      <Text className={cn(AppStyles.textMediumSmall, 'uppercase')}>
        {convertString(expiredDate, SHORT_DATE_FORMAT)}
      </Text>
    </View>
  )
}

function BaseStockBatchItem({ item, testID, children }: Readonly<Props>) {
  const { batch, activity, available_qty, allocated_qty, in_transit_qty, qty } =
    item
  const { t } = useLanguage()

  const expiryStatus = useMemo(
    () => checkExpiration(batch?.expired_date),
    [batch?.expired_date]
  )

  return (
    <View
      className={cn(AppStyles.card, 'p-3 mx-4 mb-1 gap-y-2')}
      {...getTestID(testID)}>
      <View className='flex-row items-center gap-x-1'>
        <Text className={cn(AppStyles.textBold, 'flex-1')}>{batch?.code}</Text>
        <ActivityLabel name={activity.name} />
      </View>
      <View className='gap-y-1'>
        <InfoRow
          label={t('label.available_stock')}
          value={formatAbsNumber(available_qty)}
          valueClassName='font-mainBold'
        />
        <InfoRow
          label={t('label.stock_on_hand')}
          value={formatAbsNumber(qty)}
          valueClassName='font-mainBold'
        />
        <InfoRow
          label={t('label.allocated_stock')}
          value={formatAbsNumber(allocated_qty)}
          valueClassName='font-mainBold'
        />
        <InfoRow
          label={t('label.stock_in_transit')}
          value={formatAbsNumber(in_transit_qty)}
          valueClassName='font-mainBold'
        />
        <View className={AppStyles.borderBottom} />
        <ExpiredDateStatus
          expiredDate={batch?.expired_date}
          status={expiryStatus}
          t={t}
        />
        <InfoRow
          label={t('label.manufacturer')}
          value={batch?.manufacture.name ?? ''}
        />
      </View>
      {children}
    </View>
  )
}

export default React.memo(BaseStockBatchItem)
