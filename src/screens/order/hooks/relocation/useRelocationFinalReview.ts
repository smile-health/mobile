import { useMemo, useState } from 'react'
import { RouteProp, useRoute } from '@react-navigation/native'
import { useLanguage } from '@/i18n/useLanguage'
import { RelocationOrderItem } from '@/models'
import { AppStackParamList } from '@/navigators'
import { useCreateRelocationMutation } from '@/services/apis'
import { clearRelocations } from '@/services/features/relocation.slice'
import {
  relocationState,
  useAppDispatch,
  useAppSelector,
  workspaceState,
} from '@/services/store'
import { showError } from '@/utils/CommonUtils'
import { ORDER_TYPE } from '@/utils/Constants'
import { getErrorMessage } from '@/utils/helpers/ErrorHelpers'
import {
  getMissingCompanionMaterials,
  showSuccessAndNavigateToDetail,
} from '../../helpers/OrderHelpers'

function useRelocationFinalReview() {
  const { t } = useLanguage()

  const route =
    useRoute<RouteProp<AppStackParamList, 'RelocationFinalReview'>>()
  const { date, comment } = route.params

  const [createRelocation, { isLoading }] = useCreateRelocationMutation()

  const dispatch = useAppDispatch()
  const { activity, vendor, relocations } = useAppSelector(relocationState)
  const { selectedWorkspace } = useAppSelector(workspaceState)
  const programId = Number(selectedWorkspace?.id)

  const [dialogOpen, setDialogOpen] = useState(false)

  const { uniqueMissingCompanions, message } = useMemo(() => {
    return getMissingCompanionMaterials(relocations, t)
  }, [relocations, t])

  const getOrderItems = () => {
    return relocations.map((relocation) => {
      const orderItem: RelocationOrderItem = {
        ordered_qty: Number(relocation.ordered_qty),
        recommended_stock: relocation.recommended_stock || 0,
        material_id: relocation.material_id,
        order_reason_id: relocation.reason_id || 0,
        other_reason: relocation.other_reason || null,
      }

      if (
        relocation.material_hierarchy &&
        relocation.material_hierarchy.length > 0
      ) {
        orderItem.children = relocation.material_hierarchy.map((item) => ({
          material_id: item.material_id,
          ordered_qty: Number(item.ordered_qty),
        }))
      }

      return orderItem
    })
  }

  const handleCreateRelocation = async (isAgree = false) => {
    if (uniqueMissingCompanions.length > 0 && isAgree) {
      setDialogOpen(true)
      return
    }

    if (isLoading) return

    const payload = {
      customer_id: selectedWorkspace?.entity_id ?? 0,
      vendor_id: Number(vendor?.id),
      activity_id: activity?.id ?? 0,
      ...(date && date !== '' && { required_date: date }),
      order_comment: comment,
      order_items: getOrderItems(),
    }

    try {
      const response = await createRelocation(payload).unwrap()
      if (response) {
        const id = response.createdOrderId

        dispatch(clearRelocations({ programId }))

        showSuccessAndNavigateToDetail(
          t('order.success_create_relocation_order'),
          'snackbar-success-create-reclotaion-order',
          id,
          ORDER_TYPE.RELOCATION
        )
      }
    } catch (error) {
      showError(getErrorMessage(error, t))
    }
  }

  const toggleCancelDialog = () => setDialogOpen((prev) => !prev)

  return {
    t,
    date,
    comment,
    activity,
    vendor,
    relocations,
    message,
    dialogOpen,
    toggleCancelDialog,
    handleCreateRelocation,
    isLoading,
  }
}

export default useRelocationFinalReview
