import React from 'react'
import { Text, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import ActivityLabel from '@/components/ActivityLabel'
import { InfoRow } from '@/components/list/InfoRow'
import {
  DisposalDetailMaterialStockItem,
  DisposalStockItemResponse,
} from '@/models/disposal/DisposalStock'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import { DISPOSAL_QTY_TYPE, disposalQtyTypeLabel } from '../disposal-constant'

interface AddDisposalMaterialInfoProps {
  material: DisposalStockItemResponse
  batch: DisposalDetailMaterialStockItem
  activity: string
}

export default function AddDisposalMaterialInfo({
  material,
  batch,
  activity,
}: Readonly<AddDisposalMaterialInfoProps>) {
  const { t } = useTranslation()

  return (
    <View className='p-4 bg-white'>
      <Text className={AppStyles.textBold}>{material.material.name}</Text>
      <View className='rounded-sm p-2 border-quillGrey border mt-2'>
        <View className='flex-row items-center mb-1'>
          <Text className={cn(AppStyles.textRegular, 'flex-1')}>
            {batch.batch?.code}
          </Text>
          <ActivityLabel name={activity} />
        </View>

        <InfoRow
          label={t(disposalQtyTypeLabel[DISPOSAL_QTY_TYPE.DISCARD])}
          value={batch.disposal_discard_qty}
        />
        <InfoRow
          label={t(disposalQtyTypeLabel[DISPOSAL_QTY_TYPE.RECEIVED])}
          value={batch.disposal_received_qty}
        />
      </View>
    </View>
  )
}
