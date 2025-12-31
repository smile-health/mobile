import React, { memo } from 'react'
import { InfoRow } from '@/components/list/InfoRow'
import Separator from '@/components/separator/Separator'
import { useLanguage } from '@/i18n/useLanguage'
import { numberFormat } from '@/utils/CommonUtils'
import BaseOrderItemRenderer from './BaseOrderItemRenderer'
import { OrderBatchItemRendererProps } from '../types/order'

const OrderNonBatchItemRenderer = memo((props: OrderBatchItemRendererProps) => {
  const { t } = useLanguage()
  const defaultRenderAdditionalInfo = (stock) => (
    <>
      <InfoRow
        label={t('label.shipped_qty')}
        value={numberFormat(stock?.allocated_qty)}
      />
      <Separator className='my-2' />
    </>
  )
  return (
    <BaseOrderItemRenderer
      {...props}
      renderAdditionalInfo={defaultRenderAdditionalInfo}
      childIdx={props.childIdx}
      isHierarchy={props.isHierarchy}
    />
  )
})

OrderNonBatchItemRenderer.displayName = 'OrderNonBatchItemRenderer'

export default OrderNonBatchItemRenderer
