import React from 'react'
import { View } from 'react-native'
import { DisposalDetailMaterialItem } from '@/models/disposal/DisposalStock'
import DisposalStockDetailHeader from './DisposalStockDetailHeader'

export interface DisposalMaterialDetailHeaderProps {
  detail: DisposalDetailMaterialItem
  parentMaterialName?: string
  parentStockQty?: number
}

export default function DisposalMaterialDetailHeader({
  detail,
  parentMaterialName,
  parentStockQty,
}: Readonly<DisposalMaterialDetailHeaderProps>) {
  const materialName = detail?.material?.name
  const discardQty = detail?.disposal_discard_qty
  const receivedQty = detail?.disposal_received_qty
  const materialQty = discardQty + receivedQty

  return (
    <View>
      <DisposalStockDetailHeader
        parentMaterialName={parentMaterialName}
        parentQty={parentStockQty}
        updatedAt={detail.updated_at}
        materialName={materialName}
        materialQty={materialQty}
        discardQty={discardQty}
        receivedQty={receivedQty}
      />
    </View>
  )
}
