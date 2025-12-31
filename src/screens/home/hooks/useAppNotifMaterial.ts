import { useEffect } from 'react'
import { useGetAppNotifMaterialQuery } from '@/services/apis/notification.api'
import { getAppNotifMaterial } from '@/services/features'
import { useAppSelector, workspaceState } from '@/services/store'
import useProgramId from '@/utils/hooks/useProgramId'
import { showNetworkError } from '@/utils/NetworkUtils'

export const CACHE_EXPIRY_NOTIF_MATERIAL = 3600 // in seconds

export default function useAppNotifMaterial() {
  const { selectedWorkspace } = useAppSelector(workspaceState)
  const programId = useProgramId()
  const notifMaterialData = useAppSelector(getAppNotifMaterial)

  const { isLoading, isFetching, error, refetch } = useGetAppNotifMaterialQuery(
    {
      entity_id: selectedWorkspace?.entity_id,
      programId,
    },
    { refetchOnMountOrArgChange: CACHE_EXPIRY_NOTIF_MATERIAL }
  )

  useEffect(() => {
    if (error) {
      showNetworkError(error)
    }
  }, [error])

  return {
    refetchAppNotifMaterial: refetch,
    notifMaterialData,
    isLoadingNotifMaterial: isLoading || isFetching,
  }
}
