import { useCallback, useEffect, useMemo, useState } from 'react'
import { NotificationData } from '@/models/notif/NotificationList'
import {
  useGetNotificationsInfiniteQuery,
  useReadAllNotificationMutation,
  useReadSingleNotificationMutation,
} from '@/services/apis/notification.api'
import { useAppSelector, workspaceState } from '@/services/store'
import { formatErrorMessage, showError } from '@/utils/CommonUtils'
import { showNetworkError } from '@/utils/NetworkUtils'

export default function useNotificationList() {
  const { workspaces } = useAppSelector(workspaceState)
  const [filter, setFilter] = useState<number[]>([])

  const programOptions = useMemo(() => {
    return workspaces.map((w) => ({ value: w.id, label: w.name }))
  }, [workspaces])

  const {
    data,
    isLoading,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    error,
    refetch,
    fetchNextPage,
  } = useGetNotificationsInfiniteQuery(
    { program_ids: filter.length > 0 ? filter.join(',') : undefined },
    { refetchOnMountOrArgChange: true }
  )
  const [readNotification] = useReadSingleNotificationMutation()
  const [readAllNotification, { isLoading: isReadAllNotif }] =
    useReadAllNotificationMutation()

  const notificationList = useMemo(() => {
    if (!data?.pages) return []
    return data.pages.flatMap((data) => data.data)
  }, [data?.pages])

  const shouldShowLoading = useMemo(() => {
    if (isFetchingNextPage) return false
    return isLoading || isFetching || isReadAllNotif
  }, [isFetching, isFetchingNextPage, isLoading, isReadAllNotif])

  const handleApplyFilter = (programIds: number[]) => {
    setFilter(programIds)
  }

  const handleResetFilter = () => {
    setFilter([])
  }

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }

  const handleReadNotification = useCallback(
    async (item: NotificationData) => {
      if (item.read_at) return
      try {
        await readNotification(item.id)
      } catch (error) {
        showError(formatErrorMessage(error))
      }
    },
    [readNotification]
  )

  const handleReadAllNotification = async () => {
    try {
      await readAllNotification()
    } catch (error) {
      showError(formatErrorMessage(error))
    }
  }

  useEffect(() => {
    if (error) {
      showNetworkError(error)
    }
  }, [error])

  return {
    notificationList,
    filter,
    programOptions,
    isLoadMore: isFetchingNextPage,
    shouldShowLoading,
    refetch,
    handleApplyFilter,
    handleResetFilter,
    handleLoadMore,
    handleReadNotification,
    handleReadAllNotification,
  }
}
