import { useState } from 'react'
import { ReconciliationFilter } from '@/models/reconciliation/ReconciliationList'
import { StockTakingFilter } from '@/models/stock-taking/StockTakingList'
import { useGetReconciliationListQuery } from '@/services/apis/reconciliation.api'
import {
  reconciliationState,
  workspaceState,
  useAppSelector,
} from '@/services/store'
import { PAGE_SIZE } from '@/utils/Constants'

export default function useReconciliationHistoryList() {
  const { selectedWorkspace } = useAppSelector(workspaceState)
  const { activity, material } = useAppSelector(reconciliationState)

  const [filter, setFilter] = useState<ReconciliationFilter>({})
  const [page, setPage] = useState(1)

  const { data, isLoading, isFetching } = useGetReconciliationListQuery(
    {
      ...filter,
      page,
      paginate: PAGE_SIZE,
      entity_id: selectedWorkspace?.entity_id,
      activity_id: activity.id,
      material_id: material.id,
    },
    { refetchOnMountOrArgChange: true }
  )

  const handleApplyFilter = (data: StockTakingFilter) => {
    setPage(1)
    setFilter(data)
  }

  const handleLoadMore = () => {
    if (!isFetching && data && data.page < data.total_page) {
      setPage((prev) => prev + 1)
    }
  }

  return {
    activityName: activity.name,
    materialName: material.name,
    reconciliationList: data?.data ?? [],
    filter,
    shouldShowLoading: (isLoading || isFetching) && page === 1,
    isLoadMore: isLoading || isFetching,
    handleLoadMore,
    handleApplyFilter,
  }
}
