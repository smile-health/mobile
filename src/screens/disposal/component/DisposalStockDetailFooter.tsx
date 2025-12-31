import React from 'react'
import { View, Text } from 'react-native'
import { useLanguage } from '@/i18n/useLanguage'
import { MaterialCardValue } from '@/screens/inventory/component/MaterialCard'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'

export interface DisposalStockDetailFooterProps {
  totalShipmentQty?: number
  totalSelfQty?: number
}

function DisposalStockDetailFooter(
  props: Readonly<DisposalStockDetailFooterProps>
) {
  const { totalSelfQty = 0, totalShipmentQty = 0 } = props

  return (
    <View className={STATIC_STYLES.container}>
      <DisposalHistoryInfo
        totalSelfQty={totalSelfQty}
        totalShipmentQty={totalShipmentQty}
      />
    </View>
  )
}

export default React.memo(DisposalStockDetailFooter)

const DisposalHistoryInfo = React.memo(function ParentMaterialInfo({
  totalSelfQty,
  totalShipmentQty,
}: Readonly<{
  totalShipmentQty: number
  totalSelfQty: number
}>) {
  const { t } = useLanguage()

  return (
    <View className={'mt-2 p-4 bg-white'}>
      <Text className={cn(AppStyles.labelBold, 'text-sm mb-2')}>
        {t('disposal.disposal_history')}
      </Text>
      <View className={STATIC_STYLES.cardRow}>
        <MaterialCardValue
          labelClassName={cn(STATIC_STYLES.textTinyGray, 'mb-1')}
          label={t('disposal.total_disposal_shipment')}
          value={totalShipmentQty}
        />
        <MaterialCardValue
          labelClassName={cn(STATIC_STYLES.textTinyGray, 'mb-1')}
          label={t('disposal.total_self_disposal')}
          value={totalSelfQty}
        />
      </View>
    </View>
  )
})

const STATIC_STYLES = {
  textTinyGray: 'text-[10px] text-mediumGray',
  container: 'bg-lightGrey',
  cardRow: 'flex-row gap-x-2',
} as const
