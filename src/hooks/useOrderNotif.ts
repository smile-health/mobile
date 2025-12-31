import { useEffect } from 'react'
import { setApiProgramId } from '@/services/api'
import { useGetOrderNotifQuery } from '@/services/apis/notification.api'
import { useAppSelector } from '@/services/store'

/**
 * Hook untuk mengambil data notifikasi order
 * @param entityId - ID entitas (opsional)
 * @returns Data notifikasi order dan status loading
 */
export const useOrderNotif = (entityId?: number) => {
  const { data, isLoading, refetch } = useGetOrderNotifQuery(entityId)
  const selectedProgramId = useAppSelector(
    (state) => state.workspace.selectedWorkspace?.id
  )

  // Refetch data ketika program ID berubah
  useEffect(() => {
    if (selectedProgramId) {
      // Set program ID untuk header API
      setApiProgramId(selectedProgramId)
      refetch()
    }
  }, [selectedProgramId, refetch])

  return {
    orderNotif: data,
    isLoading,
    refetch,
  }
}
