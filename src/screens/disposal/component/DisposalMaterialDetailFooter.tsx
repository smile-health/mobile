import React from 'react'
import { View } from 'react-native'
import { DisposalDetailMaterialItem } from '@/models/disposal/DisposalStock'
import DisposalStockDetailFooter from './DisposalStockDetailFooter'

export interface DisposalMaterialDetailFooterProps {
  detail: DisposalDetailMaterialItem
}
export default function DisposalMaterialDetailFooter({
  detail,
}: Readonly<DisposalMaterialDetailFooterProps>) {
  return (
    <View className='bg-lightGrey'>
      <DisposalStockDetailFooter
        totalSelfQty={detail.disposal_qty}
        totalShipmentQty={detail.disposal_shipped_qty}
      />
    </View>
  )
}
