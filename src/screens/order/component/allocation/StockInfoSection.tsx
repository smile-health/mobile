import React, { memo } from 'react'
import { TFunction } from 'i18next'
import { InfoRow } from '@/components/list/InfoRow'
import { numberFormat } from '@/utils/CommonUtils'

interface StockInfoProps {
  stock: {
    available_qty?: number
    allocated_qty?: number
    qty?: number
  }
  t: TFunction
  className?: string
}

const StockInfoSection: React.FC<StockInfoProps> = ({
  stock,
  t,
  className,
}) => (
  <>
    <InfoRow
      label={t('label.available_stock')}
      value={numberFormat(stock?.available_qty) || '-'}
    />
    <InfoRow
      label={t('label.allocated_stock')}
      value={numberFormat(stock?.allocated_qty) || '-'}
      labelClassName={className || 'my-1'}
    />
    <InfoRow
      label={t('label.stock_on_hand')}
      value={numberFormat(stock?.qty) || '-'}
    />
  </>
)

export default memo(StockInfoSection)
