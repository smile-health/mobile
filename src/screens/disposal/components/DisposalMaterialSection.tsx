import React from 'react'
import { Text, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { DisposalStockItemResponse } from '@/models/disposal/DisposalStock'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import { numberFormat } from '@/utils/CommonUtils'
import DisposalMaterialItem from './DisposalMaterialItem'
import { DISPOSAL_QTY_TYPE, disposalQtyTypeLabel } from '../disposal-constant'

interface MaterialSectionProps {
  material: DisposalStockItemResponse
}

export default function DisposalMaterialSection({
  material,
}: Readonly<MaterialSectionProps>) {
  const { t } = useTranslation()

  return (
    <View className='p-4 bg-paleGrey'>
      <Text className={cn(AppStyles.textBold, 'mb-2')}>
        {t('label.material')}
      </Text>
      <DisposalMaterialItem material={material} label={null} className='mx-0' />
      <View className='mt-1 flex-row justify-evenly gap-x-2'>
        <View className='bg-white border-gray-200 border rounded-sm p-2 flex-1'>
          <Text
            className={cn(AppStyles.labelRegular, 'text-warmGrey text-xxs')}>
            {t(disposalQtyTypeLabel[DISPOSAL_QTY_TYPE.DISCARD])}
          </Text>
          <Text className={cn(AppStyles.textBold)}>
            {numberFormat(material.total_disposal_discard_qty)}
          </Text>
        </View>
        <View className='bg-white border-gray-200 border rounded-sm p-2 flex-1'>
          <Text
            className={cn(AppStyles.labelRegular, 'text-warmGrey text-xxs')}>
            {t(disposalQtyTypeLabel[DISPOSAL_QTY_TYPE.RECEIVED])}
          </Text>
          <Text className={cn(AppStyles.textBold)}>
            {numberFormat(material.total_disposal_received_qty)}
          </Text>
        </View>
      </View>
    </View>
  )
}
