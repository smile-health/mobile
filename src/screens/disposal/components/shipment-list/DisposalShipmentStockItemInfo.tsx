import React from 'react'
import { View, Text } from 'react-native'
import { TFunction } from 'i18next'
import { InfoRow } from '@/components/list/InfoRow'
import AppStyles from '@/theme/AppStyles'
import { numberFormat } from '@/utils/CommonUtils'
import { DISPOSAL_TYPE, disposalItemLabel } from '../../disposal-constant'

interface Props {
  discardQty: number | null
  receivedQty: number | null
  reason: string
  t: TFunction
}

const ShipmentStockSection = ({ title, reason, qty, t }) => {
  if (!qty) return null
  return (
    <View className='mt-2 pt-1 border-t border-t-lightGreyMinimal'>
      <Text className={AppStyles.labelBold}>{title}</Text>
      <InfoRow
        label={t('disposal.reason_qty', {
          reason,
          interpolation: { escapeValue: false },
        })}
        value={numberFormat(qty)}
        valueClassName='font-mainBold'
      />
    </View>
  )
}

export default function DisposalShipmentStockItemInfo(props: Readonly<Props>) {
  const { t, discardQty, receivedQty, reason } = props

  return (
    <>
      <ShipmentStockSection
        title={t(disposalItemLabel[DISPOSAL_TYPE.SHIPMENT].stockDiscard)}
        reason={reason}
        qty={discardQty}
        t={t}
      />
      <ShipmentStockSection
        title={t(disposalItemLabel[DISPOSAL_TYPE.SHIPMENT].stockReceived)}
        reason={reason}
        qty={receivedQty}
        t={t}
      />
    </>
  )
}
