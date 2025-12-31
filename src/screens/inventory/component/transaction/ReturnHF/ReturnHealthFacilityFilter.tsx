import React from 'react'
import { View } from 'react-native'
import DateRangePickerChip from '@/components/filter/DateRangePickerChip'
import EntityActivityHeader from '@/components/header/EntityActivityHeader'
import MaterialItem from '@/components/list/MaterialItem'
import { TransactionConsumptionFilter } from '@/models/transaction/Transaction'
import { useAppSelector, trxState } from '@/services/store'

interface Props {
  filter: TransactionConsumptionFilter
  onApply: (filter: TransactionConsumptionFilter) => void
}
function ReturnHealthFacilityFilter({ filter, onApply }: Readonly<Props>) {
  const { customer, activity, trxMaterial } = useAppSelector(trxState)
  const { material, details, updated_at } = trxMaterial

  const stockDetail = details[0]
  const stockQty = stockDetail?.total_qty ?? 0
  const stockMin = stockDetail?.min ?? 0
  const stockMax = stockDetail?.max ?? 0

  const handleApplyDateRangeFilter = (startDate: string, endDate: string) => {
    onApply({
      start_date: startDate,
      end_date: endDate,
    })
  }

  return (
    <React.Fragment>
      <EntityActivityHeader
        activityName={activity.name}
        entityName={customer?.name}
      />
      <View className='px-4 py-3 items-start bg-white'>
        <DateRangePickerChip
          name='TransactionConsumptionDateFilter'
          startDate={filter.start_date}
          endDate={filter.end_date}
          onApply={handleApplyDateRangeFilter}
          testID='daterangepicker-transaction-consumption'
        />
      </View>
      <View className='bg-white p-4 border-y border-quillGrey'>
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

export default React.memo(ReturnHealthFacilityFilter)
