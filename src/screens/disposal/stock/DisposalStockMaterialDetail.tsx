import React, { useMemo } from 'react'
import { View } from 'react-native'
import { Icons } from '@/assets/icons'
import { Button } from '@/components/buttons'
import { ActivityHeader } from '@/components/header/ActivityHeader'
import { useLanguage } from '@/i18n/useLanguage'
import StockDetailBatchSection from '@/screens/inventory/component/stock/StockDetailBatchSection'
import useStockDetail from '@/screens/inventory/hooks/stock/useStockDetail'
import { getTestID } from '@/utils/CommonUtils'
import { generateBatchSection } from '@/utils/helpers/MaterialHelpers'

export default function DisposalStockMaterialDetailScreen() {
  const { stockDetail, handleNavigateBack } = useStockDetail()

  const { t } = useLanguage()

  const { activity, material, stocks = [] } = stockDetail || {}

  const isBatch = !!material?.is_managed_in_batch

  const materialBatches = useMemo(() => {
    return isBatch ? generateBatchSection(stocks, activity?.id) : []
  }, [isBatch, activity?.id, stocks])

  return (
    <View className='flex-1'>
      <ActivityHeader name={activity?.name} />
      <StockDetailBatchSection
        isBatch={isBatch}
        sections={materialBatches}
        detail={stockDetail}
      />
      <View className='flex-row p-4 border-quillGrey border-t'>
        <Button
          preset='filled'
          text={t('button.back')}
          containerClassName='flex-1 bg-main gap-x-1'
          leftIconSize={20}
          LeftIcon={Icons.IcBack}
          onPress={handleNavigateBack}
          {...getTestID('btn-back')}
        />
      </View>
    </View>
  )
}
