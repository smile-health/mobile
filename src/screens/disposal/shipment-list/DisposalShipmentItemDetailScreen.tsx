import React, { useCallback, useMemo } from 'react'
import { SectionList, Text, View } from 'react-native'
import { ActivityHeader } from '@/components/header/ActivityHeader'
import { useLanguage } from '@/i18n/useLanguage'
import { AppStackScreenProps } from '@/navigators'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import DisposalShipmentStockItem from '../components/shipment-list/DisposalShipmentStockItem'
import ShipmentItemDetailHeader from '../components/shipment-list/ShipmentItemDetailHeader'

interface Props extends AppStackScreenProps<'DisposalShipmentItemDetail'> {}

export default function DisposalShipmentItemDetailScreen({ route }: Props) {
  const { t } = useLanguage()
  const { item, activityName, status } = route.params
  const {
    master_material,
    confirmed_qty,
    shipped_qty,
    disposal_shipment_stocks: stocks,
  } = item

  const sections = useMemo(() => [{ key: 'stocks', data: stocks }], [stocks])

  const renderHeader = useCallback(() => {
    return (
      <ShipmentItemDetailHeader
        materialName={master_material.name}
        status={status}
        receivedQty={confirmed_qty}
        shippedQty={shipped_qty}
      />
    )
  }, [confirmed_qty, master_material.name, shipped_qty, status])

  const renderSectionHeader = useCallback(() => {
    if (!master_material.managed_in_batch) return null
    return (
      <Text className={cn(AppStyles.labelBold, 'text-sm mb-2')}>
        {t('section.material_batch')}
      </Text>
    )
  }, [master_material.managed_in_batch, t])

  const renderItem = useCallback(
    ({ item }) => {
      return <DisposalShipmentStockItem item={item} status={status} />
    },
    [status]
  )

  return (
    <View className='flex-1 bg-white'>
      <ActivityHeader name={activityName} />
      <SectionList
        sections={sections}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        ListHeaderComponent={renderHeader}
        keyExtractor={(item) => String(item.id)}
        contentContainerClassName='bg-white p-4'
        stickySectionHeadersEnabled={false}
      />
    </View>
  )
}
