import { useLanguage } from '@/i18n/useLanguage'
import { CreateDisposalShipmentPayload } from '@/models/disposal/CreateDisposalShipment'
import { useCreateDisposalShipmentMutation } from '@/services/apis/disposal.api'
import { clearDisposal } from '@/services/features'
import {
  disposalState,
  useAppDispatch,
  useAppSelector,
  workspaceState,
} from '@/services/store'
import { formatErrorMessage, showError, showSuccess } from '@/utils/CommonUtils'
import { navigateAndReset } from '@/utils/NavigationUtils'
import {
  DISPOSAL_SHIPMENT_METHOD,
  DISPOSAL_SHIPMENT_TYPE,
} from '../disposal-constant'
import { createDisposalShipmentOrderItems } from '../helper/DisposalShipmentHelpers'

export default function useReviewDisposalShipment() {
  const { t } = useLanguage()
  const dispatch = useAppDispatch()
  const { activity, receiver, disposal } = useAppSelector(disposalState)
  const { selectedWorkspace } = useAppSelector(workspaceState)
  const [createDisposalShipment, { isLoading }] =
    useCreateDisposalShipmentMutation()

  const disposalItems = Object.values(disposal)

  const submitData = async (report_number: string, comment: string) => {
    if (isLoading) return
    try {
      const payload: CreateDisposalShipmentPayload = {
        activity_id: activity.id,
        is_allocated: 1,
        customer_id: receiver?.id,
        vendor_id: selectedWorkspace?.entity_id,
        flow_id: DISPOSAL_SHIPMENT_METHOD,
        no_document: report_number,
        disposal_comments: comment || undefined,
        type: DISPOSAL_SHIPMENT_TYPE,
        disposal_items: createDisposalShipmentOrderItems(disposal),
      }

      const response = await createDisposalShipment(payload).unwrap()
      if (response) {
        dispatch(clearDisposal())
        showSuccess(t('disposal.success_create_disposal_shipment'))
        navigateAndReset(
          [
            { name: 'Workspace' },
            { name: 'Home' },
            { name: 'DisposalShipmentList' },
            {
              name: 'DisposalShipmentDetail',
              params: { id: response.id, isSender: true },
            },
          ],
          2
        )
      }
    } catch (error) {
      showError(formatErrorMessage(error))
    }
  }

  return {
    t,
    receiver,
    disposalItems,
    submitData,
    isLoading,
  }
}
