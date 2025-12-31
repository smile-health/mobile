import React, { useMemo } from 'react'
import { View } from 'react-native'
import { Icons } from '@/assets/icons'
import { Button } from '@/components/buttons'
import { ActivityHeader } from '@/components/header/ActivityHeader'
import { useLanguage } from '@/i18n/useLanguage'
import colors from '@/theme/colors'
import { getTestID } from '@/utils/CommonUtils'
import { generateBatchSection } from '@/utils/helpers/MaterialHelpers'
import StockDetailBatchSection from '../component/stock/StockDetailBatchSection'
import useStockDetail from '../hooks/stock/useStockDetail'

export default function StockDetailScreen() {
  const { stockDetail, handleNavigateBack } = useStockDetail()

  const { t } = useLanguage()

  const { activity, material, stocks = [] } = stockDetail || {}

  const isBatch = !!material?.is_managed_in_batch

  const materialBatches = useMemo(() => {
    return isBatch ? generateBatchSection(stocks, activity?.id) : []
  }, [isBatch, activity?.id, stocks])

  return (
    <View className='flex-1 bg-white'>
      <ActivityHeader name={activity?.name} />
      <StockDetailBatchSection
        sections={materialBatches}
        detail={stockDetail}
        isBatch={isBatch}
      />
      <View className='flex-row p-4 bg-white border-quillGrey border-t'>
        <Button
          preset='filled'
          containerClassName='flex-1 bg-main gap-x-1'
          text={t('button.back')}
          LeftIcon={Icons.IcBack}
          leftIconColor={colors.mainText()}
          leftIconSize={20}
          onPress={handleNavigateBack}
          {...getTestID('btn-back')}
        />
      </View>
    </View>
  )
}
