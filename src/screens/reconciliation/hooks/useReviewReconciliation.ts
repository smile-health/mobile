import { useMemo } from 'react'
import { useNavigation } from '@react-navigation/native'
import { useLanguage } from '@/i18n/useLanguage'
import { AppStackParamList } from '@/navigators'
import { useCreateReconciliationMutation } from '@/services/apis/reconciliation.api'
import { reconciliationState, useAppSelector } from '@/services/store'
import { formatErrorMessage, showError, showSuccess } from '@/utils/CommonUtils'
import { getDateRangeText } from '@/utils/DateFormatUtils'
import { createReconciliationPayload } from '../helpers/ReconciliationHelpers'

export default function useReviewReconciliation({
  data,
  createdAt,
}: AppStackParamList['ReviewReconciliation']) {
  const { t } = useLanguage()
  const { activity, material } = useAppSelector(reconciliationState)
  const navigation = useNavigation()

  const [createReconciliation, { isLoading }] =
    useCreateReconciliationMutation()

  const reviewItems = useMemo(
    () => [
      {
        materialName: material.name,
        period: getDateRangeText(data.start_date, data.end_date),
        createdAt,
        items: data.items,
      },
    ],
    [createdAt, data.end_date, data.items, data.start_date, material.name]
  )

  const handleSubmitReconciliation = async () => {
    try {
      if (isLoading) return
      const payload = createReconciliationPayload(data)

      await createReconciliation(payload).unwrap()
      showSuccess(t('reconciliation.success_create'))
      navigation.navigate('ReconciliationMaterial')
    } catch (error) {
      showError(formatErrorMessage(error))
    }
  }

  const handleDeleteAll = () => {
    navigation.navigate('ReconciliationMaterial')
  }

  return {
    t,
    activityName: activity.name,
    reviewItems,
    isLoading,
    handleSubmitReconciliation,
    handleDeleteAll,
  }
}
