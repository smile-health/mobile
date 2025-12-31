import { useMemo, useState } from 'react'
import { StockTakingFilter } from '@/models/stock-taking/StockTakingList'
import { useGetStockTakingListQuery } from '@/services/apis/stock-taking.api'
import { stockTakingState, useAppSelector } from '@/services/store'
import { PAGE_SIZE } from '@/utils/Constants'
import { getGroupedStockTakingList } from '../helpers/StockTakingHelpers'

export default function useStockTakingHistoryList() {
  const { detail, period } = useAppSelector(stockTakingState)

  const [filter, setFilter] = useState<StockTakingFilter>({ only_have_qty: 1 })
  const [page, setPage] = useState(1)

  const { data, isLoading, isFetching } = useGetStockTakingListQuery(
    {
      ...filter,
      page,
      paginate: PAGE_SIZE,
      entity_id: detail.entityId,
      period_id: period?.id,
      material_id: detail.materialId,
    },
    { refetchOnMountOrArgChange: true }
  )

  const sections = useMemo(() => {
    return data?.data ? getGroupedStockTakingList(data.data) : []
  }, [data?.data])

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
    periodName: period?.name ?? '',
    detail,
    sections,
    filter,
    shouldShowLoading: (isLoading || isFetching) && page === 1,
    isLoadMore: isLoading || isFetching,
    handleLoadMore,
    handleApplyFilter,
  }
}
