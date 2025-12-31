import { useMemo } from 'react'
import { useGetEventReportStatusCountQuery } from '@/services/apis/event-report-count.api'

export function useEventReportCount() {
  const { data, isLoading, refetch } = useGetEventReportStatusCountQuery(
    {},
    {
      refetchOnMountOrArgChange: false,
    }
  )

  const statusItems = useMemo(() => {
    if (!data) return []

    const nullStatusItem = data.find((item) => item.status_id === null)
    const nonNullStatusItems = data.filter((item) => item.status_id !== null)

    const result = nullStatusItem
      ? [nullStatusItem, ...nonNullStatusItems]
      : nonNullStatusItems

    return result
  }, [data])

  return {
    statusItems,
    isLoading,
    refetch,
  }
}
