import { useCallback, useMemo } from 'react'
import { TicketMaterial, TicketBatch } from '@/models/order/Ticket'
import { TicketMaterialRequest } from '@/models/order/TicketMaterial'
import { useSendTicketMaterialMutation } from '@/services/apis/ticket-material.api'
import {
  clearTicketFormData,
  clearTicketMaterials,
  TicketFormData,
  setIgnoreConfirm,
} from '@/services/features/ticketReason.slice'
import {
  useAppSelector,
  useAppDispatch,
  workspaceState,
} from '@/services/store'
import { DATE_FILTER_FORMAT } from '@/utils/Constants'
import { convertString } from '@/utils/DateFormatUtils'
import { showFormattedError } from '@/utils/helpers/ErrorHelpers'
import { isNewMaterial } from '@/utils/helpers/MaterialHelpers'

const createBaseMaterialData = (material: TicketMaterial) => {
  const isNewMaterialItem = isNewMaterial(material.id)

  return {
    material_id: isNewMaterialItem ? null : material.id,
    custom_material: isNewMaterialItem ? material.name : null,
    production_date: null,
  }
}

const createBatchItem = (
  baseMaterialData: ReturnType<typeof createBaseMaterialData>,
  batch: TicketBatch
) => ({
  ...baseMaterialData,
  batch_code: batch.batch_code ?? null,
  expired_date: batch.expired_date
    ? convertString(batch.expired_date, DATE_FILTER_FORMAT)
    : null,
  qty: Number(batch.qty) || 0,
  reason_id: batch.reason ? Number(batch.reason) : null,
  child_reason_id: batch.detail_reason ? Number(batch.detail_reason) : null,
})

const exp = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)

const createNonBatchItem = (
  baseMaterialData: ReturnType<typeof createBaseMaterialData>,
  material: TicketMaterial
) => ({
  ...baseMaterialData,
  batch_code: null,
  expired_date: convertString(exp, DATE_FILTER_FORMAT),
  qty: Number(material.qty) || 0,
  reason_id: material.reason ? Number(material.reason) : null,
  child_reason_id: material.detail_reason
    ? Number(material.detail_reason)
    : null,
})

export function useTicketSubmission({
  ticketMaterials,
  ticketFormData,
  comment,
  requestCancel,
}: {
  ticketMaterials: TicketMaterial[]
  ticketFormData: TicketFormData | undefined
  comment?: string | null
  requestCancel?: boolean | null
}) {
  const [sendTicketMaterial, { isLoading }] = useSendTicketMaterialMutation()
  const { selectedWorkspace } = useAppSelector(workspaceState)
  const dispatch = useAppDispatch()

  const transformedItems = useMemo(() => {
    return ticketMaterials
      .filter((material) => {
        const hasValidId = typeof material.id === 'number' && material.id > 0
        const hasValidName = material.name && material.name.trim() !== ''
        return hasValidId ?? hasValidName
      })
      .flatMap((material) => {
        const baseMaterialData = createBaseMaterialData(material)

        return material.is_managed_in_batch && material.batches?.length
          ? material.batches
              .filter((batch) => {
                return (
                  batch.batch_code &&
                  batch.batch_code.trim() !== '' &&
                  batch.expired_date &&
                  batch.expired_date.trim() !== '' &&
                  batch.qty > 0
                )
              })
              .map((batch) => createBatchItem(baseMaterialData, batch))
          : [createNonBatchItem(baseMaterialData, material)]
      })
  }, [ticketMaterials])

  const handleSend = useCallback(
    async (onSuccess?: (responseId: number) => void, onError?: () => void) => {
      if (isLoading) return

      try {
        const payload: TicketMaterialRequest = {
          entity_id: selectedWorkspace?.entity_id,
          has_order: ticketFormData?.isSubmitted ?? 0,
          order_id:
            ticketFormData?.isSubmitted === 1
              ? Number(ticketFormData.doNumber)
              : null,
          do_number:
            ticketFormData?.isSubmitted === 0 ? ticketFormData.doNumber : null,
          arrived_date: ticketFormData?.arrivalDate ?? '',
          items: transformedItems,
          comment: comment ?? ticketFormData?.comment ?? null,
          request_cancel:
            ticketFormData?.isSubmitted === 1 && requestCancel ? 1 : 0,
        }

        const response = await sendTicketMaterial(payload).unwrap()
        if (response.id) {
          dispatch(clearTicketFormData())
          dispatch(clearTicketMaterials())

          dispatch(setIgnoreConfirm(true))

          if (onSuccess) {
            onSuccess(response.id)
          }
        }
      } catch (error) {
        showFormattedError(error)
        if (onError) {
          onError()
        }
      }
    },
    [
      selectedWorkspace?.entity_id,
      ticketFormData?.isSubmitted,
      ticketFormData?.doNumber,
      ticketFormData?.arrivalDate,
      ticketFormData?.comment,
      comment,
      requestCancel,
      transformedItems,
      sendTicketMaterial,
      dispatch,
    ]
  )

  return { handleSend, isLoading }
}
