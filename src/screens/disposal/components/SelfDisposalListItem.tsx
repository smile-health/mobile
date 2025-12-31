import React from 'react'
import { View, Text } from 'react-native'
import { Icons } from '@/assets/icons'
import ActivityLabel from '@/components/ActivityLabel'
import { FieldValue } from '@/components/list/FieldValue'
import { InfoRow } from '@/components/list/InfoRow'
import { useLanguage } from '@/i18n/useLanguage'
import { SelfDisposalListRecord } from '@/models/disposal/SelfDisposalList'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import { numberFormat } from '@/utils/CommonUtils'
import { SHORT_DATE_TIME_FORMAT, SHORT_DATE_FORMAT } from '@/utils/Constants'
import { convertString } from '@/utils/DateFormatUtils'
import { DISPOSAL_TYPE, disposalItemLabel } from '../disposal-constant'

interface SelfDisposalListItemProps {
  item: SelfDisposalListRecord
}

export function getUserNameString(firstName, lastName) {
  return [firstName, lastName].join(' ').trim()
}

function StockChangeInfo({ Icon, label, value }) {
  return (
    <View className={cn(AppStyles.border, 'p-2 bg-white flex-row flex-1')}>
      <FieldValue
        label={label}
        value={numberFormat(Math.abs(value))}
        defaultValue={0}
        containerClassName='flex-1'
        labelClassName='text-xxs'
        valueClassName='font-mainBold'
      />
      <Icon />
    </View>
  )
}

function SelfDisposalListItem({ item }: Readonly<SelfDisposalListItemProps>) {
  const { t } = useLanguage()
  const batch = item.disposal_stock.batch
  const { firstname, lastname } = item.user_created
  const itemLabel = disposalItemLabel[DISPOSAL_TYPE.SELF]

  const transactionReason = () => {
    return (
      item.transaction_reason.title ||
      item.disposal_stock.transaction_reason.title
    )
  }

  return (
    <View className='bg-white gap-2 p-4 rounded border border-gray-200'>
      {/* Header */}
      <View className='flex-row items-center justify-between'>
        <Text className={cn(AppStyles.textRegular, 'text-main')}>
          {t('disposal.self_disposal')}
        </Text>
        <Text className={cn(AppStyles.textRegularSmall, 'uppercase')}>
          {convertString(item.created_at, SHORT_DATE_TIME_FORMAT)}
        </Text>
      </View>

      {/* Material Info */}
      <View className='flex-row items-start'>
        <Text className={cn(AppStyles.textBold, 'flex-1')}>
          {item.material.name}
        </Text>
        <ActivityLabel name={item.activity.name} />
      </View>

      {/* Main Info */}
      <View className='gap-1'>
        <InfoRow
          label={t(itemLabel.qty)}
          value={numberFormat(Math.abs(item.change_qty))}
          valueClassName={AppStyles.textBoldSmall}
        />
        <View className='border border-quillGrey p-2 rounded gap-y-1'>
          <InfoRow
            label={t(itemLabel.stockDiscard)}
            value={numberFormat(Math.abs(item.disposal_discard_qty ?? 0))}
            valueClassName={AppStyles.textBoldSmall}
          />
          <InfoRow
            label={t(itemLabel.stockReceived)}
            value={numberFormat(Math.abs(item.disposal_received_qty ?? 0))}
            valueClassName={AppStyles.textBoldSmall}
          />
        </View>
        <InfoRow
          label={t('label.reason')}
          value={transactionReason()}
          valueClassName={AppStyles.textBoldSmall}
        />
      </View>

      {/* Disposal Details */}
      <View className='gap-1 pt-2 border-t border-gray-200'>
        <InfoRow
          label={t('disposal.disposal_report_number')}
          value={item.report_number ?? '-'}
        />
        <InfoRow
          label={t('disposal.method')}
          value={item.disposal_method.title}
        />
        <InfoRow
          label={t('disposal.disposal_number')}
          value={`PMM-${item.id}`}
        />
      </View>

      {/* Comment */}
      {item.comment !== '' && (
        <View className='gap-1 pt-2 border-t border-gray-200'>
          <InfoRow label={t('label.comment')} value={item.comment ?? '-'} />
          <InfoRow
            label={t('label.created_by')}
            value={getUserNameString(firstname, lastname)}
          />
        </View>
      )}

      {/* Batch Details - if available */}
      {batch != null && (
        <View className='gap-y-1 px-3 py-2 bg-catskillWhite rounded border border-lightGreyMinimal'>
          <View className='flex-row justify-between items-center'>
            <Text className={AppStyles.textRegular}>{batch.code}</Text>
            <ActivityLabel name={item.disposal_stock.activity?.name} />
          </View>

          <InfoRow
            label={t('label.expired_date')}
            value={convertString(batch.expired_date, SHORT_DATE_FORMAT)}
            valueClassName='uppercase'
          />
          <InfoRow
            label={t('label.manufacturer')}
            value={batch.manufacture.name}
          />

          <InfoRow
            label={t('label.production_date')}
            value={convertString(batch.production_date, SHORT_DATE_FORMAT)}
            valueClassName='uppercase'
          />
        </View>
      )}

      {!batch && (
        <View className='px-3 py-2 bg-catskillWhite rounded border border-lightGreyMinimal'>
          <InfoRow
            label={t('label.taken_from_activity_stock')}
            value={item.disposal_stock.activity.name}
          />
        </View>
      )}

      <View className='flex-row gap-x-2'>
        <StockChangeInfo
          label={t('label.opening_stock')}
          value={item.opening_qty}
          Icon={Icons.IcOpeningStock}
        />
        <StockChangeInfo
          label={t('label.closing_stock')}
          value={item.closing_qty}
          Icon={Icons.IcClosingStock}
        />
      </View>
    </View>
  )
}

export default React.memo(SelfDisposalListItem)
