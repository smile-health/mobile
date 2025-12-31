import React, { memo } from 'react'
import { View, Text } from 'react-native'
import { TFunction } from 'i18next'
import { Control } from 'react-hook-form'
import ActivityLabel from '@/components/ActivityLabel'
import Dropdown from '@/components/dropdown/Dropdown'
import { InputNumber } from '@/components/forms'
import { InfoRow } from '@/components/list/InfoRow'
import Separator from '@/components/separator/Separator'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import { numberFormat } from '@/utils/CommonUtils'
import { materialStatuses, SHORT_DATE_FORMAT } from '@/utils/Constants'
import { convertString } from '@/utils/DateFormatUtils'
import StockInfoSection from './StockInfoSection'
import { getValueFromDraftByStockId } from '../../helpers/OrderHelpers'
import { ItemStock } from '../../types/order'
interface AllocationMaterialNonHierarchyRendererProps {
  item: ItemStock
  index: number
  isBatch?: boolean
  control: Control<any>
  t: TFunction
  setValue
  draftData
}

function AllocationMaterialNonHierarchyRenderer({
  item,
  index,
  isBatch,
  control,
  t,
  setValue,
  draftData,
}: Readonly<AllocationMaterialNonHierarchyRendererProps>) {
  const isEmptyStocks = item.stocks?.length === 0
  const isTemperatureSensitive = item.material.is_temperature_sensitive === 1

  return (
    <View
      key={index}
      className='border border-lightGreyMinimal rounded-xs bg-catskillWhite p-2 mb-2 mx-4'>
      <Text className={cn(AppStyles.textRegularMedium, 'flex-1')}>
        {item?.material?.name}
      </Text>
      {isEmptyStocks ? (
        <View className='bg-white p-2 mt-4 justify-center items-center border border-lightGreyMinimal rounded-xs '>
          <Text className={cn(AppStyles.labelRegular, 'text-mediumGray')}>
            {t('label.empty_stock')}
          </Text>
        </View>
      ) : (
        <>
          <InfoRow
            label={t('label.confirmed_qty')}
            value={numberFormat(item.total_allocated_qty)}
            labelClassName='mt-1'
          />
          <Separator className='my-2' />
          {isBatch && (
            <Text className={cn(AppStyles.labelBold, 'mb-2')}>
              {t('section.material_batch')}
            </Text>
          )}
          {item?.stocks?.map((stock, stockIdx) => {
            const stockId = stock.id

            const stockIdName = `order_items.${index}.children.${index}.allocations.${stockIdx}.stock_id`
            const qtyName = `order_items.${index}.children.${index}.allocations.${stockIdx}.allocated_qty`
            const materialStatusSName = `order_items.${index}.children.${index}.allocations.${stockIdx}.order_stock_status_id`

            const draftAllocatedQty = getValueFromDraftByStockId(
              draftData,
              stockId,
              'draft_allocated_qty'
            )
            const draftOrderStockStatusId = getValueFromDraftByStockId(
              draftData,
              stockId,
              'draft_order_stock_status_id'
            )

            return (
              <View
                key={stockId}
                className='border-quillGrey border p-2 my-1 rounded-sm bg-white'>
                <View className='flex-row items-center gap-x-2 mb-3'>
                  <Text className={cn(AppStyles.textRegularMedium, 'flex-1')}>
                    {stock?.batch?.code}
                  </Text>
                  <ActivityLabel name={stock?.activity?.name} />
                </View>
                <StockInfoSection stock={stock} t={t} />
                <Separator className='mt-2' />
                {isBatch && (
                  <>
                    <InfoRow
                      label={t('label.expired_date')}
                      value={
                        convertString(
                          stock?.batch?.expired_date,
                          SHORT_DATE_FORMAT
                        ) || '-'
                      }
                    />
                    <InfoRow
                      label={t('label.manufacturer')}
                      value={stock?.batch?.manufacture?.name}
                      labelClassName='my-1'
                    />
                    <InfoRow
                      label={t('label.production_date')}
                      value={
                        convertString(
                          stock?.batch?.production_date,
                          SHORT_DATE_FORMAT
                        ) || '-'
                      }
                    />
                    <Separator className='mt-2' />
                  </>
                )}
                <InputNumber
                  isMandatory
                  name={qtyName}
                  control={control}
                  onChangeText={(val) => {
                    setValue(qtyName, String(val))
                    setValue(stockIdName, stockId)
                  }}
                  value={draftAllocatedQty}
                  label={t('label.allocated_qty')}
                  placeholder={t('label.allocated_qty')}
                />
                {isTemperatureSensitive && (
                  <Dropdown
                    data={materialStatuses}
                    preset='bottom-border'
                    name={materialStatusSName}
                    control={control}
                    value={draftOrderStockStatusId}
                    label={t('label.material_status')}
                    placeholder={t('label.material_status')}
                    isMandatory
                  />
                )}
              </View>
            )
          })}
        </>
      )}
    </View>
  )
}

export default memo(AllocationMaterialNonHierarchyRenderer)
