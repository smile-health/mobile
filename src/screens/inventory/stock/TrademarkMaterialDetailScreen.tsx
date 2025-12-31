import React, { useMemo } from 'react'
import { View } from 'react-native'
import { Icons } from '@/assets/icons'
import { Button } from '@/components/buttons'
import { ActivityHeader } from '@/components/header/ActivityHeader'
import { useLanguage } from '@/i18n/useLanguage'
import { AppStackScreenProps } from '@/navigators'
import { stockState, useAppSelector } from '@/services/store'
import colors from '@/theme/colors'
import { getTestID } from '@/utils/CommonUtils'
import { calculateTotalQty } from '@/utils/helpers/material/commonHelper'
import { generateBatchSection } from '@/utils/helpers/MaterialHelpers'
import StockDetailBatchSection from '../component/stock/StockDetailBatchSection'

interface Props extends AppStackScreenProps<'TrademarkMaterialDetail'> {}
export default function TrademarkMaterialDetailScreen({
  route,
  navigation,
}: Props) {
  const { detail } = route.params

  const { stockActivity, stockMaterial } = useAppSelector(stockState)

  const { t } = useLanguage()

  const parentStockQty = useMemo(() => {
    return calculateTotalQty(stockMaterial.details, 'total_qty')
  }, [stockMaterial.details])

  const isBatch = !!detail.material?.is_managed_in_batch
  const materialBatches = useMemo(() => {
    return isBatch ? generateBatchSection(detail.stocks, stockActivity.id) : []
  }, [detail.stocks, isBatch, stockActivity.id])

  const handleViewActiveMaterial = () => {
    navigation.pop(2)
  }

  return (
    <View className='flex-1'>
      <ActivityHeader name={stockActivity?.name} />
      <StockDetailBatchSection
        sections={materialBatches}
        isBatch={isBatch}
        detail={detail}
        parentMaterialName={stockMaterial.material.name}
        parentStockQty={parentStockQty}
      />
      <View className='flex-row p-4 bg-white border-quillGrey border-t gap-x-2'>
        <Button
          preset='outlined-primary'
          containerClassName='flex-1'
          text={t('button.view_active_ingredient')}
          onPress={handleViewActiveMaterial}
          {...getTestID('btn-view-active-ingredient')}
        />
        <Button
          preset='filled'
          containerClassName='flex-1 gap-x-1'
          text={t('button.back')}
          leftIconColor={colors.mainText()}
          LeftIcon={Icons.IcBack}
          leftIconSize={20}
          onPress={navigation.goBack}
          {...getTestID('btn-back')}
        />
      </View>
    </View>
  )
}
