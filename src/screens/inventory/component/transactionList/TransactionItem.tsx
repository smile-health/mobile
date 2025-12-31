import React, { ComponentType, useMemo } from 'react'
import { Text, View } from 'react-native'
import { ParseKeys } from 'i18next'
import { SvgProps } from 'react-native-svg'
import { Icons } from '@/assets/icons'
import ActivityLabel from '@/components/ActivityLabel'
import { FieldValue } from '@/components/list/FieldValue'
import { InfoRow } from '@/components/list/InfoRow'
import { useLanguage } from '@/i18n/useLanguage'
import { Transaction } from '@/models/transaction/Transaction'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import { numberFormat } from '@/utils/CommonUtils'
import {
  SHORT_DATE_FORMAT,
  SHORT_DATE_TIME_FORMAT,
  TRANSACTION_TYPE,
} from '@/utils/Constants'
import { convertString } from '@/utils/DateFormatUtils'
import TransactionItemBatchDetail from './TransactionItemBatchDetail'
import TransferStockInfo from './TransferStockInfo'

interface TransactionItemProps {
  item: Transaction
  isHierarchy: boolean
  programName: string
}

const className = {
  container: cn(AppStyles.card, 'gap-y-2 mx-4 mb-2 bg-white'),
  transactionType: cn(AppStyles.textRegular, 'text-deepBlue flex-1'),
  createdAt: cn(AppStyles.textRegularSmall, 'uppercase'),
}

function TransactionItem({
  item,
  isHierarchy,
  programName,
}: Readonly<TransactionItemProps>) {
  const {
    transaction_type,
    transaction_reason,
    transaction_purchase,
    other_reason,
    created_at,
    activity,
    material,
    customer,
    change_qty,
    actual_transaction_date,
    stock,
    opening_qty,
    closing_qty,
    patients,
    parent_material,
    companion_activity,
    companion_program,
    user_created_by: { firstname, lastname },
  } = item

  const { t } = useLanguage()

  const isTransferStock = transaction_type.id == TRANSACTION_TYPE.TRANSFER_STOCK

  const label = useMemo(() => {
    const labelMap: Record<number, Record<string, ParseKeys>> = {
      [TRANSACTION_TYPE.CONSUMPTION]: {
        date: 'label.actual_date_consumption',
        customer: 'label.for',
      },
      [TRANSACTION_TYPE.RETURN]: {
        date: 'label.actual_date_return',
        customer: 'label.from',
      },
    }
    return labelMap[transaction_type.id] ?? null
  }, [transaction_type.id])

  return (
    <View className={className.container}>
      <View className='flex-row items-center'>
        <Text className={className.transactionType}>
          {transaction_type.title}
        </Text>
        <Text className={className.createdAt}>
          {convertString(created_at, SHORT_DATE_TIME_FORMAT)}
        </Text>
      </View>
      {isTransferStock && (
        <TransferStockInfo
          programName={programName}
          activityName={activity?.name}
          companionProgramName={companion_program?.name}
          companionActivityName={companion_activity?.name}
          changeQty={change_qty}
          t={t}
        />
      )}
      <View className='gap-y-1'>
        <View className='flex-row items-center gap-x-1'>
          <Text className={cn(AppStyles.textBold, 'flex-1')}>
            {(isHierarchy ? parent_material?.name : material?.name) ?? ''}
          </Text>
          {!isTransferStock && (
            <ActivityLabel className='self-start' name={activity?.name} />
          )}
        </View>
        {isHierarchy && (
          <Text className={AppStyles.labelRegular}>{material?.name ?? ''}</Text>
        )}
        <InfoRow
          label={t('label.qty')}
          value={numberFormat(Math.abs(change_qty))}
          valueClassName='font-mainBold'
        />
      </View>
      <View className={AppStyles.borderBottom} />
      <View>
        <InfoRow
          label={t('label.created_by')}
          value={`${firstname} ${lastname ?? ''}`.trim()}
        />
        {label?.customer && (
          <InfoRow label={t(label?.customer)} value={customer?.name ?? ''} />
        )}
        {!!transaction_reason?.id && (
          <InfoRow
            label={t('label.reason')}
            value={
              transaction_reason.is_other
                ? other_reason
                : transaction_reason.title
            }
          />
        )}
        {label?.date && (
          <InfoRow
            label={t(label.date)}
            value={convertString(actual_transaction_date, SHORT_DATE_FORMAT)}
            valueClassName='uppercase'
          />
        )}
      </View>
      <TransactionItemBatchDetail
        batch={stock.batch}
        changeQty={change_qty}
        activity={stock.activity}
        purchase={transaction_purchase}
        isBatch={!!material.managed_in_batch}
        patients={patients}
      />
      <View className='flex-row gap-x-2'>
        <StockChangeInfo
          label={t('label.opening_stock')}
          value={opening_qty}
          Icon={Icons.IcOpeningStock}
        />
        <StockChangeInfo
          label={t('label.closing_stock')}
          value={closing_qty}
          Icon={Icons.IcClosingStock}
        />
      </View>
    </View>
  )
}

interface StockChangeInfoProps {
  Icon: ComponentType<SvgProps>
  label: string
  value: number
}

function StockChangeInfo({
  Icon,
  label,
  value,
}: Readonly<StockChangeInfoProps>) {
  return (
    <View className={cn(AppStyles.border, 'p-2 bg-white flex-row flex-1')}>
      <FieldValue
        label={label}
        value={numberFormat(value)}
        defaultValue={0}
        containerClassName='flex-1'
        labelClassName='text-xxs'
        valueClassName='font-mainBold'
      />
      <Icon />
    </View>
  )
}

export default React.memo(TransactionItem)
