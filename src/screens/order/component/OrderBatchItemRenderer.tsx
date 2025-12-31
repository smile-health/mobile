import React, { memo } from 'react'
import { InfoRow } from '@/components/list/InfoRow'
import Separator from '@/components/separator/Separator'
import { useLanguage } from '@/i18n/useLanguage'
import { numberFormat } from '@/utils/CommonUtils'
import { SHORT_DATE_FORMAT } from '@/utils/Constants'
import { convertString } from '@/utils/DateFormatUtils'
import BaseOrderItemRenderer from './BaseOrderItemRenderer'
import { OrderBatchItemRendererProps } from '../types/order'

const OrderBatchItemRenderer = memo((props: OrderBatchItemRendererProps) => {
  const { t } = useLanguage()
  const defaultRenderAdditionalInfo = (stock) => (
    <>
      <InfoRow
        label={t('label.shipped_qty')}
        value={numberFormat(stock?.allocated_qty)}
      />
      <Separator className='my-2' />
      <InfoRow
        label={props.t('label.expired_date')}
        value={
          convertString(stock?.batch?.expired_date, SHORT_DATE_FORMAT) || '-'
        }
      />
      <InfoRow
        label={props.t('label.manufacturer')}
        value={stock?.batch?.manufacture_name || '-'}
      />
    </>
  )

  return (
    <BaseOrderItemRenderer
      {...props}
      renderAdditionalInfo={
        props.renderAdditionalInfo || defaultRenderAdditionalInfo
      }
      inputProps={props.inputProps}
      childIdx={props.childIdx}
      isHierarchy={props.isHierarchy}
    />
  )
})

OrderBatchItemRenderer.displayName = 'OrderBatchItemRenderer'

export default OrderBatchItemRenderer
