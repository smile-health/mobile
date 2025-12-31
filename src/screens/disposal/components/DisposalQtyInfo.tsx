import React from 'react'
import { TFunction } from 'i18next'
import { InfoRow } from '@/components/list/InfoRow'
import { AddDisposalItem } from '@/models/disposal/CreateSelfDisposal'
import { numberFormat } from '@/utils/CommonUtils'

interface Props {
  item: AddDisposalItem
  t: TFunction
}

const DisposalQtyInfo: React.FC<Props> = ({ item, t }) => {
  return (
    <InfoRow
      label={t('disposal.reason_qty', {
        reason: item.transaction_reason_name,
        interpolation: { escapeValue: false },
      })}
      value={numberFormat(item.disposal_qty)}
      valueClassName='font-mainBold'
    />
  )
}

export default DisposalQtyInfo
