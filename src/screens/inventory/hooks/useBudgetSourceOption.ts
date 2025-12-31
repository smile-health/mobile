import { useCallback, useEffect } from 'react'
import { TFunction } from 'i18next'
import { useGetBudgetSourceQuery } from '@/services/apis/budget-source.api'
import { showError } from '@/utils/CommonUtils'

export default function useBudgetSourceOption(t: TFunction) {
  const {
    data: budgetSourceOption = [],
    isFetching,
    isLoading,
    isUninitialized,
    error,
    refetch,
  } = useGetBudgetSourceQuery()

  const handleRefreshList = useCallback(() => {
    if (!isUninitialized) {
      refetch()
    }
  }, [isUninitialized, refetch])

  useEffect(() => {
    if (error) {
      showError(t('error.load_data'))
    }
  }, [error, t])

  return {
    budgetSourceOption,
    isLoading: isLoading || isFetching,
    handleRefreshList,
  }
}
