import React, { useCallback } from 'react'
import { FlatList, Text, View } from 'react-native'
import { InfoRow } from '@/components/list/InfoRow'
import { useLanguage } from '@/i18n/useLanguage'
import { IShipmentDetailMaterialItem } from '@/models/disposal/DisposalShipmentStatus'
import AppStyles from '@/theme/AppStyles'
import { numberFormat } from '@/utils/CommonUtils'
import ReceiveShipmentStockItem from './ReceiveShipmentStockItem'

interface Props {
  data: IShipmentDetailMaterialItem
  index: number
}

function ReceiveShipmentMaterialItem({
  data,
  index: parentIndex,
}: Readonly<Props>) {
  const { t } = useLanguage()
  const { id, stocks, is_batch, material_name, qty } = data

  const renderHeader = useCallback(() => {
    if (!is_batch) return null

    return (
      <View className='pt-2 border-t border-quillGrey'>
        <Text className={AppStyles.labelBold}>
          {t('section.material_batch')}
        </Text>
      </View>
    )
  }, [t, is_batch])

  const renderItem = useCallback(
    ({ item, index }) => {
      return (
        <ReceiveShipmentStockItem
          item={item}
          parentIndex={parentIndex}
          index={index}
          t={t}
        />
      )
    },
    [parentIndex, t]
  )

  return (
    <View className='p-2 border border-quillGrey rounded-sm mx-4 gap-y-2'>
      <Text className={AppStyles.labelBold}>
        {t('label.trademark_material')}
      </Text>
      <Text className={AppStyles.textBold}>{material_name}</Text>
      <InfoRow
        label={t('disposal.disposal_shipment_qty')}
        value={numberFormat(qty)}
        valueClassName='font-mainBold'
      />
      <FlatList
        data={stocks}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        contentContainerClassName='gap-y-2'
        keyExtractor={(item) => `${id}-${item.id}`}
      />
    </View>
  )
}

export default ReceiveShipmentMaterialItem
