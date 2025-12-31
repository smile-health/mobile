import React, { useMemo } from 'react'
import { View } from 'react-native'
import { t } from 'i18next'
import { ActivityHeader } from '@/components/header/ActivityHeader'
import { useToolbar } from '@/components/toolbar/hooks/useToolbar'
import { AppStackScreenProps } from '@/navigators'
import { generateDisposalBatchSection } from '@/screens/disposal/helper/DisposalStockHelpers'
import { getSelectedDisposalStock } from '@/services/features'
import { stockState, useAppSelector } from '@/services/store'
import DisposalStockDetailBatchSection from '../component/DisposalStockDetailBatchSection'

interface Props
  extends AppStackScreenProps<'DisposalTrademarkMaterialDetail'> {}
export default function DisposalTrademarkMaterialDetailScreen({
  route,
}: Props) {
  const { detail } = route.params
  const { stockActivity } = useAppSelector(stockState)
  const selectedStock = useAppSelector(getSelectedDisposalStock)
  const activityName = stockActivity.name

  useToolbar({
    title: t('home.menu.view_disposal'),
  })

  const isBatch = !!detail.material.is_managed_in_batch

  const materialBatches = useMemo(() => {
    return generateDisposalBatchSection(detail.stocks)
  }, [detail.stocks])

  return (
    <View className='flex-1'>
      <ActivityHeader name={activityName} />
      <DisposalStockDetailBatchSection
        sections={materialBatches}
        isBatch={isBatch}
        detail={detail}
        parentMaterialName={selectedStock.name}
        parentStockQty={selectedStock.totalStock}
      />
    </View>
  )
}
