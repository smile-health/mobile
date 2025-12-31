import React, { useMemo } from 'react'
import { Text, View } from 'react-native'
import { Icons } from '@/assets/icons'
import { ImageButton } from '@/components/buttons'
import DateRangePickerChip from '@/components/filter/DateRangePickerChip'
import { ActivityHeader } from '@/components/header/ActivityHeader'
import MaterialItem from '@/components/list/MaterialItem'
import { useLanguage } from '@/i18n/useLanguage'
import { StockItem } from '@/models/shared/Material'
import { TransactionDiscardFilter } from '@/models/transaction/Transaction'
import { getTrxReasons } from '@/services/features'
import { useAppSelector } from '@/services/store'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import { getTestID } from '@/utils/CommonUtils'
import { TRANSACTION_TYPE } from '@/utils/Constants'

interface Props {
  filter: TransactionDiscardFilter | null
  stock: StockItem
  onOpenFilter: () => void
  onApply: (data: TransactionDiscardFilter) => void
}
function CancelDiscardFilter({
  filter,
  stock,
  onApply,
  onOpenFilter,
}: Readonly<Props>) {
  const { material, details, total_qty, updated_at, max, min } = stock
  const { t } = useLanguage()

  const trxReasons = useAppSelector((state) =>
    getTrxReasons(state, TRANSACTION_TYPE.DISCARDS)
  )

  const stockDetail = details[0]
  const activityName = stockDetail?.activity?.name ?? ''
  const stockQty = stockDetail?.total_qty ?? total_qty
  const stockMax = stockDetail?.max ?? max
  const stockMin = stockDetail?.min ?? min

  const reasonText = useMemo(() => {
    const reason = trxReasons.find(
      (tr) => tr.value === filter?.transaction_reason_id
    )
    return reason?.label
  }, [filter?.transaction_reason_id, trxReasons])

  const FilterIcon = reasonText ? Icons.IcFilterFilled : Icons.IcFilterOutlined

  const handleApplyDateRangeFilter = (startDate: string, endDate: string) => {
    onApply({
      ...filter,
      start_date: startDate,
      end_date: endDate,
    })
  }

  const handleDeleteReason = () => {
    onApply({
      ...filter,
      transaction_reason_id: undefined,
    })
  }

  return (
    <React.Fragment>
      <ActivityHeader name={activityName} />
      <View className='flex-row items-center bg-white border-b border-whiteTwo px-4 py-3 gap-x-3'>
        <View className='flex-1 items-start'>
          <DateRangePickerChip
            name='TransactionDiscardDateFilter'
            startDate={filter?.start_date}
            endDate={filter?.end_date}
            onApply={handleApplyDateRangeFilter}
            testID='daterangepicker-transaction-discard'
          />
        </View>
        <ImageButton
          Icon={FilterIcon}
          size={24}
          onPress={onOpenFilter}
          {...getTestID('btn-open-filter')}
        />
      </View>
      {reasonText && (
        <View className='flex-row bg-polynesianBlue px-4 py-1 gap-y-1'>
          <Text className={cn(AppStyles.textBoldSmall, 'flex-1')}>
            {t('label.transaction_reason')}:{' '}
            <Text className={AppStyles.textRegularSmall}>{reasonText}</Text>
          </Text>
          <ImageButton
            onPress={handleDeleteReason}
            Icon={Icons.IcDelete}
            size={16}
            {...getTestID('btn-reset-filters')}
          />
        </View>
      )}
      <View className='bg-white p-4 border-b border-quillGrey'>
        <MaterialItem
          name={material.name}
          updatedAt={updated_at}
          qty={stockQty}
          max={stockMax}
          min={stockMin}
          showQuantity={false}
        />
      </View>
    </React.Fragment>
  )
}

export default React.memo(CancelDiscardFilter)
