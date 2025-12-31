import { useEffect } from 'react'
import { TFunction } from 'i18next'
import { useGetActivitiesQuery } from '@/services/apis/transfer-stock.api'
import { showError } from '@/utils/CommonUtils'

export default function useTransferStockActivities(
  t: TFunction,
  programId?: number,
  materialId?: number
) {
  const {
    data = [],
    isLoading,
    isFetching,
    isUninitialized,
    error,
    refetch,
  } = useGetActivitiesQuery(
    { destination_program_id: programId, material_id: materialId },
    { refetchOnMountOrArgChange: true }
  )

  const handleRefreshActivities = () => {
    if (!isUninitialized) {
      refetch()
    }
  }

  useEffect(() => {
    if (error) {
      showError(t('error.load_data'))
    }
  }, [error, t])

  return {
    activities: data,
    isLoadingActivities: isLoading || isFetching,
    handleRefreshActivities,
  }
}
