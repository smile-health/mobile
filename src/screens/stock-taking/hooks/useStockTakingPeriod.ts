import { useCallback } from 'react'
import { Period } from '@/models/stock-taking/StockTakingPeriod'
import { useGetPeriodQuery } from '@/services/apis/stock-taking.api'
import { setPeriod } from '@/services/features/stock-taking.slice'
import {
  stockTakingState,
  useAppDispatch,
  useAppSelector,
} from '@/services/store'

export function useStockTakingPeriod() {
  const {
    data = [],
    isLoading,
    isFetching,
    isUninitialized,
    refetch,
  } = useGetPeriodQuery({ status: 1 }, { refetchOnMountOrArgChange: true })

  const dispatch = useAppDispatch()
  const { period } = useAppSelector(stockTakingState)

  const handleSelectPeriod = (value: Period) => {
    dispatch(setPeriod(value))
  }

  const handleRefreshPeriod = useCallback(() => {
    if (!isUninitialized) {
      refetch()
    }
  }, [isUninitialized, refetch])

  return {
    dispatch,
    setPeriod,
    periodList: data,
    selectedPeriod: period,
    isLoadingPeriod: isLoading || isFetching,
    refreshPeriodList: handleRefreshPeriod,
    handleSelectPeriod,
  }
}
