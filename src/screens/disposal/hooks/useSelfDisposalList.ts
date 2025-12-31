import { useCallback, useMemo, useState } from 'react'
import {
  SelfDisposalListFilter,
  SelfDisposalListRecord,
} from '@/models/disposal/SelfDisposalList'
import { useGetSelfDisposalListInfiniteQuery } from '@/services/apis'
import { getActivityOption, getMaterialOption } from '@/services/features'
import { useAppSelector, workspaceState } from '@/services/store'
import { LONG_DATE_FORMAT, MATERIAL_LEVEL_TYPE } from '@/utils/Constants'
import { convertString } from '@/utils/DateFormatUtils'

export default function useSelfDisposalList() {
  const [isOpenFilter, setIsOpenFilter] = useState(false)
  const [filter, setFilter] = useState<SelfDisposalListFilter>({})

  const { selectedWorkspace } = useAppSelector(workspaceState)
  const activityList = useAppSelector(getActivityOption)
  const materialList = useAppSelector((state) =>
    getMaterialOption(state, MATERIAL_LEVEL_TYPE.KFA_93)
  )

  // API query
  const {
    data,
    isLoading,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
    hasNextPage,
  } = useGetSelfDisposalListInfiniteQuery(
    {
      ...filter,
      entity_id: selectedWorkspace?.entity_id,
    },
    {
      refetchOnMountOrArgChange: true,
    }
  )

  // Loading states
  const shouldShowLoading = isLoading || isFetching
  const page = data?.pages?.length || 1

  const filterText = useMemo(() => {
    const material = materialList.find((m) => m.value === filter.material_id)
    const activity = activityList.find((ac) => ac.value === filter.activity_id)

    return {
      material: material?.label,
      activity: activity?.label,
    }
  }, [activityList, filter.activity_id, filter.material_id, materialList])

  // Grouped into sections by date
  const sections = useMemo(() => {
    if (!data?.pages) return []
    const allItems = data.pages.flatMap((page) => page.data)
    const grouped: Record<string, SelfDisposalListRecord[]> = {}

    for (const item of allItems) {
      // Use only the date part for grouping (ignore time)
      // Format: "15 December 2024"
      // As a fallback, no grouping if created_at missing
      const dayOnly = item.created_at
        ? convertString(item.created_at, LONG_DATE_FORMAT)
        : 'Unknown Date'
      if (!grouped[dayOnly]) grouped[dayOnly] = []
      grouped[dayOnly].push(item)
    }

    // Sort sections descending by date
    const sectionKeys = Object.keys(grouped).sort((a, b) => {
      // parse to timestamps for sorting, fallback original order if invalid
      return a < b ? 1 : -1
    })

    return sectionKeys.map((key) => ({
      title: key,
      data: grouped[key],
    }))
  }, [data])

  // Handler functions
  const handleRefreshList = useCallback(() => {
    refetch()
  }, [refetch])

  const handleToggleFilter = useCallback(() => {
    setIsOpenFilter((prev) => !prev)
  }, [])

  const handleResetFilter = useCallback(() => {
    setFilter({})
  }, [])

  const handleApplyFilter = useCallback((newFilter: SelfDisposalListFilter) => {
    setFilter(newFilter)
    setIsOpenFilter(false)
  }, [])

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  return {
    activityList,
    materialList,
    sections,
    page,
    filter,
    filterText,
    isOpenFilter,
    shouldShowLoading,
    handleRefreshList,
    handleToggleFilter,
    handleResetFilter,
    handleApplyFilter,
    handleLoadMore,
  }
}
