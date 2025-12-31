import { useEffect, useCallback, useMemo } from 'react'
import { useLanguage } from '@/i18n/useLanguage'
import { useLazyGetCVAQuery, useLazyGetMaterialsQuery } from '@/services/apis'
import { useLazyGetTransactionTypesQuery } from '@/services/apis/transaction-types.api'
import { setCVA, setMaterials, setTransactionTypes } from '@/services/features'
import { useAppDispatch } from '@/services/store'
import { loadLocalData } from '@/storage'
import { NonArrayStorageKey } from '@/storage/types'
import { showError } from '@/utils/CommonUtils'
import { isTimePassed } from '@/utils/DateFormatUtils'
import useProgramId from '@/utils/hooks/useProgramId'
import { useOrderReasonsManagement } from './useOrderReasonsManagement'

const CACHE_EXPIRY_MATERIALS = 3600 // 1 hour in seconds
const CACHE_EXPIRY_OTHERS = 14_400 // 4 hours in seconds

export const useAppDataManagement = () => {
  const dispatch = useAppDispatch()
  const programId = useProgramId()
  const { i18n } = useLanguage()
  const [getMaterial, { isLoading: isLoadingMaterial }] =
    useLazyGetMaterialsQuery()
  const [getCVA, { isLoading: isLoadingCVA }] = useLazyGetCVAQuery()
  const [getTrxType, { isLoading: isLoadingTrxType }] =
    useLazyGetTransactionTypesQuery()
  const { isLoadingOrderReasons, refetchAllOrderReasons } =
    useOrderReasonsManagement()

  // Memoize expensive array operation - checking multiple boolean values
  const isLoadingAppData = useMemo(
    () =>
      [
        isLoadingMaterial,
        isLoadingCVA,
        isLoadingTrxType,
        isLoadingOrderReasons,
      ].some(Boolean),
    [isLoadingMaterial, isLoadingCVA, isLoadingTrxType, isLoadingOrderReasons]
  )

  // Memoize functions with complex logic and stable dependencies
  const loadDataWithCache = useCallback(
    async (
      cacheKey: NonArrayStorageKey,
      fetchFn: (id: number) => Promise<any>,
      dispatchFn: (data: any) => any,
      expirySeconds: number = CACHE_EXPIRY_OTHERS
    ) => {
      try {
        const cachedData: any = await loadLocalData(cacheKey)
        const needUpdate =
          !cachedData?.lastUpdated ||
          isTimePassed(cachedData.lastUpdated, 'second', expirySeconds)

        if (needUpdate) {
          await fetchFn(programId)
        } else {
          dispatch(dispatchFn(cachedData))
        }
      } catch (error) {
        showError(error)
      }
    },
    [dispatch, programId]
  )

  // Memoize specific loader functions to prevent recreation on every render
  const loadTrxTypeData = useCallback(() => {
    return loadDataWithCache(
      `transactionType-${programId}`,
      getTrxType,
      setTransactionTypes,
      CACHE_EXPIRY_OTHERS
    )
  }, [loadDataWithCache, programId, getTrxType])

  const loadCvaData = useCallback(() => {
    return loadDataWithCache(
      `cva-${programId}`,
      getCVA,
      setCVA,
      CACHE_EXPIRY_OTHERS
    )
  }, [loadDataWithCache, programId, getCVA])

  const loadMaterialData = useCallback(() => {
    return loadDataWithCache(
      `material-${programId}`,
      getMaterial,
      setMaterials,
      CACHE_EXPIRY_MATERIALS
    )
  }, [loadDataWithCache, programId, getMaterial])

  const handleRefreshAppData = () => {
    getCVA(programId)
    getTrxType(programId)
    getMaterial(programId)
    refetchAllOrderReasons()
  }

  // Transaction types effect - language checked on mount only
  useEffect(() => {
    loadTrxTypeData()
  }, [loadTrxTypeData, i18n.language])

  // CVA effect - no language dependency needed
  useEffect(() => {
    loadCvaData()
  }, [loadCvaData])

  // Materials effect - no language dependency needed
  useEffect(() => {
    loadMaterialData()
  }, [loadMaterialData])

  // Order reasons effect - no language dependency needed
  useEffect(() => {
    refetchAllOrderReasons()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { isLoadingAppData, handleRefreshAppData }
}
