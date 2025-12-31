import { useCallback, useMemo, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { useForm } from 'react-hook-form'
import { useLanguage } from '@/i18n/useLanguage'
import { StockItem } from '@/models/shared/Material'
import { Period } from '@/models/stock-taking/StockTakingPeriod'
import { useGetStocksQuery } from '@/services/apis/inventory.api'
import {
  setMaterialDetail,
  setParentMaterial,
} from '@/services/features/stock-taking.slice'
import {
  useAppDispatch,
  useAppSelector,
  workspaceState,
} from '@/services/store'
import { useDebounce } from '@/utils/hooks/useDebounce'
import {
  getAllStocks,
  getStockTakingFormItems,
} from '../helpers/StockTakingHelpers'

export function useStockTakingMaterial(period?: Period) {
  const { t } = useLanguage()
  const dispatch = useAppDispatch()
  const { selectedWorkspace } = useAppSelector(workspaceState)
  const [page, setPage] = useState(1)

  const { control, watch, setValue } = useForm({
    defaultValues: { name: '' },
  })
  const searchName = watch('name')
  const debouncedSearch = useDebounce(searchName, 500)

  const navigation = useNavigation()
  const isHierarchy = !!selectedWorkspace?.config.material.is_hierarchy_enabled

  const title = useMemo(() => {
    return isHierarchy
      ? t('label.active_ingredient_material_list')
      : t('label.trademark_material_list')
  }, [isHierarchy, t])

  const queryParams = useMemo(
    () => ({
      page,
      entity_id: selectedWorkspace?.entity_id,
      period_id: period?.id,
      keyword: debouncedSearch || undefined,
      material_level_id: isHierarchy ? 2 : 3,
      with_details: 1,
    }),
    [
      page,
      selectedWorkspace?.entity_id,
      period?.id,
      debouncedSearch,
      isHierarchy,
    ]
  )

  const { data, isLoading, isFetching, isUninitialized, refetch } =
    useGetStocksQuery(queryParams, {
      refetchOnMountOrArgChange: true,
    })

  const handleRefreshMaterial = useCallback(() => {
    setPage(1)
    if (!isUninitialized && !!period?.id) {
      refetch()
    }
  }, [isUninitialized, period?.id, refetch])

  const handleLoadMore = () => {
    if ((!isFetching || !isLoading) && data && data.page < data.total_page) {
      setPage((prev) => prev + 1)
    }
  }

  const handleSearchMaterial = useCallback(
    (value: string) => {
      setValue('name', value)
      setPage(1)
    },
    [setValue]
  )

  const handleSelectMaterial = useCallback(
    (item: StockItem) => {
      if (isHierarchy) {
        dispatch(setParentMaterial(item))
        navigation.navigate('StockTakingTrademarkMaterial')
        return
      }

      // Expensive computation - worth memoizing at component level if needed
      const allStocks = getAllStocks(item.details)
      const formItems = getStockTakingFormItems(allStocks)

      const materialData = {
        entityId: selectedWorkspace?.entity_id ?? 0,
        materialId: item.material.id,
        materialName: item.material.name,
        isBatch: !!item.material.is_managed_in_batch,
        isHierarchy,
        isMandatory: !!item.material.is_stock_opname_mandatory,
        lastStockOpname: item.last_opname_date ?? null,
        remainingQty: item.aggregate?.total_qty ?? 0,
        activities: item.material.activities ?? [],
        stocks: formItems,
      }

      dispatch(setMaterialDetail(materialData))
      navigation.navigate('CreateStockTaking')
    },
    [isHierarchy, dispatch, navigation, selectedWorkspace?.entity_id]
  )

  return {
    title,
    searchControl: control,
    page,
    materialList: period?.id ? (data?.data ?? []) : [],
    isLoadingMaterial: isLoading || isFetching,
    handleRefreshMaterial,
    handleSelectMaterial,
    handleSearchMaterial,
    handleLoadMore,
  }
}
