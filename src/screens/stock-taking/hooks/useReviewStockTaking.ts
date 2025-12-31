import { useMemo } from 'react'
import { useNavigation } from '@react-navigation/native'
import { useLanguage } from '@/i18n/useLanguage'
import { useCreateStockTakingMutation } from '@/services/apis/stock-taking.api'
import { stockTakingState, useAppSelector } from '@/services/store'
import { formatErrorMessage, showError, showSuccess } from '@/utils/CommonUtils'
import { calculateTotalQty } from '@/utils/helpers/material/commonHelper'
import { createStockTakingPayload } from '../helpers/StockTakingHelpers'
import { StockTakingForm } from '../schema/CreateStockTakingSchema'

export default function useReviewStockTaking(
  data: StockTakingForm,
  createdAt: string
) {
  const { t } = useLanguage()
  const { period, parentMaterial, detail } = useAppSelector(stockTakingState)
  const navigation = useNavigation()

  const [createStockTaking, { isLoading }] = useCreateStockTakingMutation()

  const reviewItems = useMemo(
    () => [
      {
        parentMaterialName: parentMaterial?.material.name,
        materialName: detail.materialName,
        totalActualQty: calculateTotalQty(data.items, 'actual_qty'),
        createdAt,
        items: data.items,
      },
    ],
    [createdAt, data.items, detail.materialName, parentMaterial?.material.name]
  )

  const handleSubmitStockTaking = async () => {
    if (isLoading) return
    try {
      const payload = createStockTakingPayload(data)

      await createStockTaking(payload).unwrap()
      showSuccess(t('stock_taking.success_create'))
      navigation.navigate('StockTakingMaterial', { needRefresh: true })
    } catch (error) {
      showError(formatErrorMessage(error))
    }
  }

  return {
    t,
    periodName: period?.name,
    parentMaterial,
    detail,
    reviewItems,
    isLoading,
    handleSubmitStockTaking,
  }
}
