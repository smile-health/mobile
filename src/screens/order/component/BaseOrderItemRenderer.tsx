import React from 'react'
import { View, Text } from 'react-native'
import ActivityLabel from '@/components/ActivityLabel'
import Dropdown from '@/components/dropdown/Dropdown'
import { InputNumber } from '@/components/forms'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import { getTestID } from '@/utils/CommonUtils'
import { materialStatuses } from '@/utils/Constants'
import { validateReceivedQty } from '../helpers/OrderHelpers'
import { OrderBatchItemRendererProps } from '../types/order'

interface BaseOrderItemRendererProps extends OrderBatchItemRendererProps {
  renderAdditionalInfo?: (stock: any) => React.ReactNode
  inputProps?: {
    getValue?: (stock: any, index: number, stockIdx: number) => string | number
    getFieldName?: (index: number, stockIdx: number) => string
    onValueChange?: (value: string, index: number, stockIdx: number) => void
    getErrors?: (value: any, stock: any) => string[]
  }
  childIdx?: number
  isHierarchy?: boolean
}

const BaseOrderItemRenderer: React.FC<BaseOrderItemRendererProps> = ({
  stocks,
  index,
  childIdx,
  control,
  form,
  setValue,
  t,
  renderAdditionalInfo,
  isMaterialSensitive,
  containerClassName,
  inputProps,
  isHierarchy = false,
}) => (
  <View>
    {stocks.map((stock, stockIdx) => {
      const receivedQty =
        inputProps?.getValue?.(stock, index, stockIdx) ??
        (isHierarchy
          ? Number(
              form.order_items?.[index]?.children?.[childIdx!]?.receives?.[
                stockIdx
              ]?.received_qty
            )
          : Number(
              form.order_items?.[index]?.receives?.[stockIdx]?.received_qty
            ))
      const fieldName =
        inputProps?.getFieldName?.(index, stockIdx) ??
        (isHierarchy
          ? `order_items.${index}.children.${childIdx}.receives.${stockIdx}.received_qty`
          : `order_items.${index}.receives.${stockIdx}.received_qty`)
      const stockActivityName =
        stock?.activity_name || stock?.activity?.name || null

      return (
        <View
          key={stock.id}
          className={cn(
            'border-quillGrey border p-2 my-1 rounded-sm',
            containerClassName
          )}>
          <View className='flex-row justify-between items-center gap-x-2 mb-3'>
            <Text className={AppStyles.textRegularMedium}>
              {stock?.batch?.code}
            </Text>
            <ActivityLabel name={stockActivityName} />
          </View>
          {renderAdditionalInfo?.(stock)}
          <InputNumber
            isMandatory
            name={fieldName}
            control={control}
            value={String(receivedQty)}
            onChangeText={(val) => {
              if (inputProps?.onValueChange) {
                inputProps.onValueChange(val, index, stockIdx)
              } else {
                setValue(fieldName, Number(val))
              }
            }}
            label={t('label.received_qty')}
            placeholder={t('label.received_qty')}
            errors={validateReceivedQty(
              Number(receivedQty),
              stock.allocated_qty
            )}
            {...getTestID(`textfield-receive-qty-${stockIdx})`)}
          />
          {isMaterialSensitive && (
            <Dropdown
              data={materialStatuses}
              preset='bottom-border'
              name={`order_items.${index}.receives.${stockIdx}.material_status`}
              control={control}
              label={t('label.material_status')}
              placeholder={t('label.material_status')}
              isMandatory
              {...getTestID(`dropdown-material-status-${stockIdx}`)}
            />
          )}
        </View>
      )
    })}
  </View>
)

export default BaseOrderItemRenderer
