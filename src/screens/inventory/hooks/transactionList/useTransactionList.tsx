import { useMemo, useState } from 'react'
import { TransactionListFilter } from '@/models/transaction/Transaction'
import { useGetTransactionListQuery } from '@/services/apis/transaction.api'
import {
  getActivityOption,
  getMaterialOption,
  getTrxTypeOption,
} from '@/services/features'
import { useAppSelector, workspaceState } from '@/services/store'
import {
  DATE_FILTER_FORMAT,
  MATERIAL_LEVEL_TYPE,
  PAGE_SIZE,
} from '@/utils/Constants'
import { convertString } from '@/utils/DateFormatUtils'
import { getTrxListSection } from '../../helpers/TransactionHelpers'

export const initialTransactionFilter: TransactionListFilter = {
  start_date: convertString(Date.now(), DATE_FILTER_FORMAT),
  end_date: convertString(Date.now(), DATE_FILTER_FORMAT),
}

export default function useTransactionList() {
  const [filter, setFilter] = useState<TransactionListFilter>(
    initialTransactionFilter
  )
  const [page, setPage] = useState(1)
  const [isOpenFilter, setIsOpenFilter] = useState(false)

  const { selectedWorkspace } = useAppSelector(workspaceState)
  const isHierarchy = !!selectedWorkspace?.config.material.is_hierarchy_enabled
  const trxTypeList = useAppSelector(getTrxTypeOption)
  const activityList = useAppSelector(getActivityOption)
  const materialList = useAppSelector((state) =>
    getMaterialOption(
      state,
      isHierarchy ? MATERIAL_LEVEL_TYPE.KFA_92 : MATERIAL_LEVEL_TYPE.KFA_93
    )
  )

  const {
    data,
    refetch: refreshList,
    isLoading,
    isFetching,
  } = useGetTransactionListQuery({
    ...filter,
    material_id: isHierarchy ? undefined : filter.material_id,
    parent_material_id: isHierarchy ? filter.material_id : undefined,
    entity_id: selectedWorkspace?.entity_id,
    page,
    paginate: PAGE_SIZE,
  })

  const sections = useMemo(() => {
    return data?.data ? getTrxListSection(data.data) : []
  }, [data?.data])

  const filterText = useMemo(() => {
    const material = materialList.find((m) => m.value === filter.material_id)
    const activity = activityList.find((ac) => ac.value === filter.activity_id)
    const trxType = trxTypeList.find(
      (tt) => tt.value === filter.transaction_type_id
    )
    return {
      material: material?.label,
      activity: activity?.label,
      trxType: trxType?.label,
    }
  }, [
    activityList,
    filter.activity_id,
    filter.material_id,
    filter.transaction_type_id,
    materialList,
    trxTypeList,
  ])

  function handleRefreshList() {
    refreshList()
  }

  const handleResetFilter = () => {
    setPage(1)
    setFilter(({ start_date, end_date }) => ({ start_date, end_date }))
  }

  const handleApplyFilter = (data: TransactionListFilter) => {
    setPage(1)
    setFilter(data)
    setIsOpenFilter(false)
  }

  const handleToggleFilter = () => {
    setIsOpenFilter((prev) => !prev)
  }

  const handleLoadMore = () => {
    if (!isFetching && data && data.page < data.total_page) {
      setPage((prev) => prev + 1)
    }
  }

  return {
    sections,
    filter,
    isOpenFilter,
    activityList,
    trxTypeList,
    materialList,
    filterText,
    page,
    isHierarchy,
    currentProgramName: selectedWorkspace?.name ?? '',
    shouldShowLoading: isLoading || isFetching,
    handleRefreshList,
    handleResetFilter,
    handleApplyFilter,
    handleToggleFilter,
    handleLoadMore,
  }
}
