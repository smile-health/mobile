import { useLanguage } from '@/i18n/useLanguage'
import {
  CreateSelfDisposalItem,
  CreateSelfDisposalRequest,
} from '@/models/disposal/CreateSelfDisposal'
import { useCreateSelfDisposalMutation } from '@/services/apis/disposal.api'
import { clearDisposal } from '@/services/features'
import {
  disposalState,
  useAppDispatch,
  useAppSelector,
  workspaceState,
} from '@/services/store'
import { formatErrorMessage, showError, showSuccess } from '@/utils/CommonUtils'
import { navigateAndReset } from '@/utils/NavigationUtils'

export default function useReviewSelfDisposal() {
  const { t } = useLanguage()
  const dispatch = useAppDispatch()
  const { activity, method, disposal } = useAppSelector(disposalState)
  const { selectedWorkspace } = useAppSelector(workspaceState)
  const [createSelfDisposal, { isLoading }] = useCreateSelfDisposalMutation()

  const disposalItems = Object.values(disposal)

  const populateDisposalData = () => {
    // Aggregation map: key is 'disposal_stock_id_transaction_reason_id'
    const groupedMap: Record<string, CreateSelfDisposalItem> = {}

    const aggregateItems = (
      items: {
        disposal_stock_id: number
        transaction_reason_id: number
        disposal_qty: number
      }[],
      type: 'discard' | 'received'
    ) => {
      for (const item of items) {
        const key = `${item.disposal_stock_id}_${item.transaction_reason_id}`
        if (!groupedMap[key]) {
          groupedMap[key] = {
            disposal_stock_id: item.disposal_stock_id,
            transaction_reason_id: item.transaction_reason_id,
            disposal_discard_qty: 0,
            disposal_received_qty: 0,
          }
        }

        if (type === 'discard') {
          groupedMap[key].disposal_discard_qty += item.disposal_qty
        } else {
          groupedMap[key].disposal_received_qty += item.disposal_qty
        }
      }
    }

    // Efficient one-pass aggregation
    for (const selfDisposal of Object.values(disposal)) {
      if (!Array.isArray(selfDisposal.disposal)) continue

      for (const stock of selfDisposal.disposal) {
        aggregateItems(stock.discard, 'discard')
        aggregateItems(stock.received, 'received')
      }
    }

    return Object.values(groupedMap)
  }

  const submitData = async (report_number: string, comment: string) => {
    if (isLoading) return
    try {
      const payload: CreateSelfDisposalRequest = {
        disposal_method_id: method.id,
        activity_id: activity.id,
        entity_id: selectedWorkspace?.entity_id,
        report_number,
        comment: comment || undefined,
        disposal_items: populateDisposalData(),
      }

      await createSelfDisposal(payload).unwrap()
      dispatch(clearDisposal())
      showSuccess(t('disposal.success_create_disposal_shipment'))
      navigateAndReset(
        [
          { name: 'Workspace' },
          { name: 'Home' },
          { name: 'ViewSelfDisposalList' },
        ],
        2
      )
    } catch (error) {
      showError(formatErrorMessage(error))
    }
  }

  return {
    t,
    activity,
    disposalItems,
    submitData,
    isLoading,
  }
}
