import React from 'react'
import { TFunction } from 'i18next'
import type { FieldErrors, UseFormReturn } from 'react-hook-form'
import Dropdown from '@/components/dropdown/Dropdown'
import OrderBatchItem from '@/screens/order/component/OrderBatchItem'
import type { StockData } from '@/screens/order/types/order'
import { getTestID } from '@/utils/CommonUtils'
import { materialStatuses } from '@/utils/Constants'
import OrderQtyInput from './OrderQtyInput'

interface BatchItemRendererProps {
  item: StockData
  methods: UseFormReturn<any>
  errors: FieldErrors
  watch: UseFormReturn<any>['watch']
  t: TFunction
  activeActivityName?: string
  selectedStockId?: number
  isTemperatureSensitive: boolean | number | null
  handleToggleBatch: (id: number) => void
}

const BatchItemRenderer = React.memo(
  ({
    item,
    methods,
    errors,
    t,
    activeActivityName,
    selectedStockId,
    isTemperatureSensitive,
    handleToggleBatch,
  }: BatchItemRendererProps) => {
    const stockId = item.stock_id
    const fieldName = `quantityByStock.${stockId}` as const

    return (
      <OrderBatchItem
        stock={item}
        activityName={activeActivityName ?? ''}
        testID={`distribution-batch-item-${stockId}`}
        isSelected={selectedStockId === stockId}
        onToggleDetail={() => handleToggleBatch(stockId)}>
        <OrderQtyInput
          stockId={stockId}
          maxQty={item.available}
          methods={methods}
          errors={errors}
          t={t}
        />

        {Boolean(isTemperatureSensitive) && (
          <Dropdown
            data={materialStatuses}
            preset='bottom-border'
            name={`${fieldName}.stock_quality_id`}
            control={methods.control}
            label={t('label.material_status')}
            placeholder={t('label.material_status')}
            isMandatory
            {...getTestID(`dropdown-order-count-${stockId}`)}
          />
        )}
      </OrderBatchItem>
    )
  }
)

export default BatchItemRenderer

BatchItemRenderer.displayName = 'BatchItemRenderer'
