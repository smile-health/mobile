import { useCallback, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useLanguage } from '@/i18n/useLanguage'
import { StockItem } from '@/models/shared/Material'
import { useGetTransferStockMaterialQuery } from '@/services/apis/transfer-stock.api'
import { setMaterial } from '@/services/features/transaction.slice'
import {
  useAppDispatch,
  useAppSelector,
  workspaceState,
  homeState,
  trxState,
} from '@/services/store'
import { useDebounce } from '@/utils/hooks/useDebounce'
import { navigate } from '@/utils/NavigationUtils'

export function useTransferStockMaterial() {
  const { t } = useLanguage()
  const dispatch = useAppDispatch()
  const { activeMenu } = useAppSelector(homeState)
  const { selectedWorkspace } = useAppSelector(workspaceState)
  const { program, transactions } = useAppSelector(trxState)
  const [page, setPage] = useState(1)

  const { control, watch, setValue } = useForm({
    defaultValues: { name: '' },
  })
  const searchName = watch('name')
  const debouncedSearch = useDebounce(searchName, 500)

  const queryParams = useMemo(
    () => ({
      page,
      entity_id: selectedWorkspace?.entity_id,
      destination_program_id: program?.id,
      keyword: debouncedSearch || undefined,
      with_details: 1,
    }),
    [page, selectedWorkspace?.entity_id, program?.id, debouncedSearch]
  )

  const { data, isLoading, isFetching, isUninitialized, refetch } =
    useGetTransferStockMaterialQuery(queryParams, {
      refetchOnMountOrArgChange: true,
    })

  const handleRefreshList = useCallback(() => {
    setPage(1)
    if (!isUninitialized) {
      refetch()
    }
  }, [isUninitialized, refetch])

  const handleLoadMoreList = () => {
    if ((!isFetching || !isLoading) && data && data.page < data.total_page) {
      setPage((prev) => prev + 1)
    }
  }

  const handleSearch = useCallback(
    (value: string) => {
      setValue('name', value)
      setPage(1)
    },
    [setValue]
  )

  const handleSelectMaterial = useCallback(
    (item: StockItem) => {
      dispatch(setMaterial(item))
      navigate('CreateTransferStock', {
        materials: data?.data ?? [],
        material: item,
      })
    },
    [data?.data, dispatch]
  )

  const navigateToReviewTransferStock = () => {
    navigate('ReviewTransferStock')
  }

  return {
    t,
    page,
    program,
    transactions,
    title: t(activeMenu?.name ?? '', activeMenu?.key ?? ''),
    searchControl: control,
    materialList: data?.data ?? [],
    programId: selectedWorkspace?.id,
    isLoadingMaterial: isLoading || isFetching,
    dispatch,
    handleRefreshList,
    handleSelectMaterial,
    handleLoadMoreList,
    handleSearch,
    navigateToReviewTransferStock,
  }
}
