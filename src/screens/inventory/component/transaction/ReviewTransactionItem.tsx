import React, { useCallback, useMemo } from 'react'
import { View, FlatList, Text, ListRenderItem } from 'react-native'
import { TFunction } from 'i18next'
import { useForm } from 'react-hook-form'
import { Icons } from '@/assets/icons'
import ActivityLabel from '@/components/ActivityLabel'
import { Button } from '@/components/buttons'
import Dropdown from '@/components/dropdown/Dropdown'
import { InfoRow } from '@/components/list/InfoRow'
import { useLanguage } from '@/i18n/useLanguage'
import {
  ReviewTransaction,
  ReviewTransactionStock,
  TrxReasonOption,
} from '@/models/transaction/TransactionCreate'
import { getTrxReasons } from '@/services/features'
import { setTransactionReason } from '@/services/features/transaction.slice'
import { authState, useAppDispatch, useAppSelector } from '@/services/store'
import AppStyles, { flexStyle } from '@/theme/AppStyles'
import colors from '@/theme/colors'
import { cn } from '@/theme/theme-config'
import { getTestID, numberFormat } from '@/utils/CommonUtils'
import { TIME_FORMAT, TRANSACTION_TYPE } from '@/utils/Constants'
import { convertString } from '@/utils/DateFormatUtils'
import { TransactionPatientDetail } from './PatientInfo/PatientDetailBottomSheet'
import BatchDetail from '../BatchDetail'

interface ReviewTransactionItemProps {
  item: ReviewTransaction
  testID: string
  onDelete: (item: ReviewTransactionStock) => void
  onPressDetailPatient: (data: TransactionPatientDetail) => void
}

function ReviewTransactionItem({
  item,
  testID,
  onDelete,
  onPressDetailPatient,
}: Readonly<ReviewTransactionItemProps>) {
  const { materialName, transactionName, activityName, stocks } = item
  const { user } = useAppSelector(authState)
  const transactionReasons = useAppSelector((state) =>
    getTrxReasons(state, TRANSACTION_TYPE.CANCEL_DISCARDS)
  )

  const renderItem: ListRenderItem<ReviewTransactionStock> = ({
    item,
    index,
  }) => (
    <ReviewTransactionStockItem
      index={index}
      item={item}
      transactionReasons={transactionReasons}
      entityName={user?.entity.name}
      onDelete={() => onDelete(item)}
      onPressDetailPatient={() =>
        onPressDetailPatient({
          data: item,
          materialName,
          activityName,
        })
      }
    />
  )

  return (
    <View
      className={cn(AppStyles.card, 'bg-white mb-2')}
      {...getTestID(testID)}>
      <View className='flex-row items-center mb-2 gap-x-2'>
        <Icons.IcFlag height={16} width={16} />
        <Text className={cn(AppStyles.labelRegular, 'text-scienceBlue flex-1')}>
          {transactionName}
        </Text>
        <Text className={AppStyles.labelRegular}>
          {convertString(stocks[0].created_at, TIME_FORMAT)}
        </Text>
      </View>
      <View className='flex-row items-center'>
        <Text className={cn(AppStyles.textBold, 'flex-1')}>{materialName}</Text>
        <ActivityLabel name={activityName} />
      </View>
      <FlatList
        data={stocks}
        renderItem={renderItem}
        contentContainerClassName='gap-y-2'
      />
    </View>
  )
}

export default React.memo(ReviewTransactionItem)

interface ReviewTransactionStockItemProps {
  index: number
  item: ReviewTransactionStock
  transactionReasons: TrxReasonOption[]
  entityName?: string
  onDelete?: () => void
  onPressDetailPatient?: () => void
}

const getVialQtyString = (
  t: TFunction,
  openVial?: number,
  closeVial?: number
) => {
  return t('label.vial_qty', {
    openVial: numberFormat(openVial ?? 0),
    closeVial: numberFormat(closeVial ?? 0),
  })
}

const getQtyString = (
  t: TFunction,
  isOpenVial: boolean,
  changeQty?: number,
  openVial?: number,
  closeVial?: number
) => {
  if (isOpenVial) return getVialQtyString(t, openVial, closeVial)
  return numberFormat(changeQty)
}

const calculateQty = (isOpenVial, qty, open, close) => {
  return isOpenVial ? (open ?? 0) + (close ?? 0) : (qty ?? 0)
}

const DiscardInfo = ({
  isAnyDiscard,
  discardedQtyString,
  transactionReason,
}) => {
  const { t } = useLanguage()
  if (!isAnyDiscard) return null
  return (
    <React.Fragment>
      <InfoRow
        label={t('transaction.field.discard')}
        value={discardedQtyString}
      />
      <InfoRow
        label={t('label.discard_reason')}
        value={transactionReason?.label ?? ''}
      />
    </React.Fragment>
  )
}

const AccumulatedInfo = ({ accumulatedQty, transactionTypeId }) => {
  if (!accumulatedQty) return null
  return (
    <View className='p-2 rounded-sm border border-orangeRust bg-softIvory'>
      <Text className={cn(AppStyles.textBoldSmall, 'text-orangeRust')}>
        {accumulatedQty[transactionTypeId] ?? ''}
      </Text>
    </View>
  )
}

const BudgetSourceInfo = ({ budgetSource, year, price, changeQty }) => {
  const { t } = useLanguage()
  if (!budgetSource && !year && !price) return null
  return (
    <View className=' border-b border-quillGrey pb-1'>
      <InfoRow label={t('label.budget_source')} value={budgetSource.label} />
      <InfoRow label={t('label.budget_year')} value={year ?? '-'} />
      <InfoRow
        label={t('label.price')}
        value={t('label.price_per_unit', {
          price: numberFormat(price / changeQty),
        })}
        valueClassName='font-mainMedium'
      />
    </View>
  )
}

const ReviewTransactionStockItem = React.memo(
  ({
    index,
    item,
    transactionReasons,
    entityName,
    onDelete,
    onPressDetailPatient,
  }: ReviewTransactionStockItemProps) => {
    const {
      stock_id,
      change_qty,
      open_vial_qty,
      close_vial_qty,
      broken_open_vial,
      broken_close_vial,
      broken_qty,
      transaction_reason,
      transaction_reason_id,
      is_open_vial,
      is_any_discard,
      batch,
      activity,
      stock_quality,
      customer,
      budget_source,
      other_reason,
      year,
      price,
      transactionTypeId,
      vaccineTypeName,
      vaccineMethodName,
      consumption_qty,
      max_return,
    } = item

    const dispatch = useAppDispatch()
    const { t } = useLanguage()

    const isNonBatchMaterialStatus = !batch?.code && !!stock_quality?.label

    const isCancelDiscard =
      transactionTypeId === TRANSACTION_TYPE.CANCEL_DISCARDS
    const shouldShowEntityName = [
      TRANSACTION_TYPE.CANCEL_DISCARDS,
      TRANSACTION_TYPE.RETURN,
    ].includes(transactionTypeId)

    const { control } = useForm({
      defaultValues: { transaction_reason_id },
    })

    const handleSelectReason = useCallback(
      (reason: TrxReasonOption) => {
        dispatch(setTransactionReason({ trx: item, trxReason: reason }))
      },
      [dispatch, item]
    )

    const { trxQtyString, trxQty } = useMemo(() => {
      return {
        trxQty: calculateQty(
          is_open_vial,
          change_qty,
          open_vial_qty,
          close_vial_qty
        ),
        trxQtyString: getQtyString(
          t,
          is_open_vial,
          change_qty,
          open_vial_qty,
          close_vial_qty
        ),
      }
    }, [change_qty, close_vial_qty, is_open_vial, open_vial_qty, t])

    const { discardedQtyString, discardedQty } = useMemo(() => {
      return {
        discardedQty: calculateQty(
          is_open_vial,
          broken_qty,
          broken_open_vial,
          broken_close_vial
        ),
        discardedQtyString: getQtyString(
          t,
          is_open_vial,
          broken_qty,
          broken_open_vial,
          broken_close_vial
        ),
      }
    }, [broken_close_vial, broken_open_vial, broken_qty, is_open_vial, t])

    const accumulatedQty = useMemo(() => {
      if (!shouldShowEntityName) return
      return {
        [TRANSACTION_TYPE.RETURN]: `${t('transaction.helpers.number_of_return')} ${trxQty - discardedQty}`,
        [TRANSACTION_TYPE.CANCEL_DISCARDS]: t(
          'label.accumulated_discard_cancellation',
          {
            qty: numberFormat(change_qty),
          }
        ),
      }
    }, [change_qty, discardedQty, shouldShowEntityName, t, trxQty])

    return (
      <View
        className='gap-y-2 py-2'
        {...getTestID(`ReviewTransactionStockItem-${stock_id}`)}>
        <InfoRow
          label={t('label.qty')}
          value={trxQtyString}
          valueClassName='font-mainBold'
        />
        <View className='border-b border-lightGreyMinimal' />
        {shouldShowEntityName && (
          <InfoRow label={t('label.from')} value={entityName ?? ''} />
        )}
        {transaction_reason && (
          <InfoRow
            label={t('label.reason')}
            value={
              transaction_reason.is_other
                ? other_reason
                : transaction_reason.label
            }
            valueClassName='font-mainMedium'
          />
        )}
        {customer && (
          <InfoRow
            label={t('label.to')}
            value={customer.name}
            valueClassName='font-mainMedium'
          />
        )}
        {batch && (
          <BatchDetail
            code={batch.code}
            activityName={activity?.name ?? ''}
            qty={change_qty}
            expiredDate={batch.expired_date}
            productionBy={batch.manufacture?.name ?? ''}
            status={stock_quality?.label}
            consumptionQty={consumption_qty}
            maxReturn={max_return}
          />
        )}
        {isNonBatchMaterialStatus && (
          <InfoRow
            label={t('label.status')}
            value={stock_quality?.label ?? ''}
          />
        )}
        {vaccineTypeName && (
          <View className='p-2 border border-quillGrey gap-y-2'>
            <View className='flex-row gap-x-2'>
              <Text className={AppStyles.textBold} style={flexStyle}>
                {vaccineTypeName}
              </Text>
              <Button
                text={t('label.details')}
                textClassName='text-main'
                onPress={onPressDetailPatient}
                RightIcon={Icons.IcChevronRightActive}
                rightIconColor={colors.main()}
                rightIconSize={20}
                {...getTestID(`btn-detail-patient-${index}`)}
              />
            </View>
            <InfoRow
              label={t('label.method')}
              value={vaccineMethodName ?? ''}
            />
          </View>
        )}
        <DiscardInfo
          isAnyDiscard={is_any_discard}
          discardedQtyString={discardedQtyString}
          transactionReason={transaction_reason}
        />
        <AccumulatedInfo
          accumulatedQty={accumulatedQty}
          transactionTypeId={transactionTypeId}
        />
        {isCancelDiscard && (
          <Dropdown
            mode='modal'
            preset='bottom-border'
            data={transactionReasons}
            control={control}
            label={t('label.reason_cancellation_of_discards')}
            placeholder={t('label.reason_cancellation_of_discards')}
            name='transaction_reason_id'
            containerClassName='mt-0'
            onChangeValue={handleSelectReason}
            isMandatory
            {...getTestID('dropdown-cancel-discard-reason')}
          />
        )}
        <BudgetSourceInfo
          budgetSource={budget_source}
          year={year}
          price={price}
          changeQty={change_qty}
        />
        <Button
          text={t('button.delete')}
          onPress={onDelete}
          containerClassName='self-end'
          textClassName='text-lavaRed'
          {...getTestID(`btn-delete-transaction-item-${index}`)}
        />
      </View>
    )
  }
)

ReviewTransactionStockItem.displayName = 'ReviewTransactionStockItem'
