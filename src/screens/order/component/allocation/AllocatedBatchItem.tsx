import React, { memo } from 'react'
import { TFunction } from 'i18next'
import { InfoRow } from '@/components/list/InfoRow'
import Separator from '@/components/separator/Separator'
import { OrderData } from '@/models/order/AddOrderItem'
import { Stock } from '@/models/shared/Material'
import { SHORT_DATE_FORMAT } from '@/utils/Constants'
import { convertString } from '@/utils/DateFormatUtils'
import StockInfoSection from './StockInfoSection'
import BaseBatchItem from '../BaseBatchItem'

interface AllocatedItem extends Stock {
  draft_allocated_qty?: number
  draft_material_status?: number
}

interface AllocatedBatchItemProps {
  item: AllocatedItem
  index: number
  control: any
  t: TFunction
  isBatch: boolean
  isMaterialSensitive: boolean
  onChangeQty: (
    stockId: number,
    value: string,
    data: OrderData,
    item: any
  ) => void
  onChangeMaterialStatus: (
    stockId: number,
    value: string,
    data: OrderData
  ) => void
  data: OrderData
  errors?: {
    message: string
  }
  onFocusQty: () => void
}

const AllocatedBatchItem: React.FC<AllocatedBatchItemProps> = ({
  item,
  index,
  control,
  t,
  isBatch,
  isMaterialSensitive,
  onChangeQty,
  onChangeMaterialStatus,
  errors,
  data,
  onFocusQty,
}) => {
  const stockId = item.id
  const fieldName = `order_items.${item.id}.allocations.${index}.allocated_qty`
  const materialStatusSName = `order_items.${item.id}.allocations.${index}.material_status`

  return (
    <BaseBatchItem
      stock={item}
      index={index}
      control={control}
      isMaterialSensitive={isMaterialSensitive}
      t={t}
      containerClassName='mx-4'
      inputProps={{
        nameQty: fieldName,
        valueQty: String(item?.draft_allocated_qty || 0),
        nameMaterialStatus: materialStatusSName,
        valueMaterialStatus: item?.draft_material_status,
        onChangeQty: (val) => val && onChangeQty(stockId, val, data, item),
        onChangeMaterialStatus: (val) =>
          val && onChangeMaterialStatus(stockId, String(val), data),
        onFocusQty: onFocusQty,
        errors: errors?.message,
      }}>
      <StockInfoSection stock={item} t={t} />
      {isBatch && (
        <>
          <Separator className='mt-2' />
          <InfoRow
            label={t('label.expired_date')}
            value={
              convertString(item?.batch?.expired_date, SHORT_DATE_FORMAT) || '-'
            }
          />
          <InfoRow
            label={t('label.manufacturer')}
            value={item?.batch?.manufacture.name || '-'}
            labelClassName='my-1'
          />
          <InfoRow
            label={t('label.production_date')}
            value={
              convertString(item?.batch?.production_date, SHORT_DATE_FORMAT) ||
              '-'
            }
          />
        </>
      )}
    </BaseBatchItem>
  )
}

export default memo(AllocatedBatchItem)
