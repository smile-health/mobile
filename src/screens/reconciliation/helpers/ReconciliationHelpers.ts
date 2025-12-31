import {
  ReconciliationPayload,
  ReconciliationPayloadItem,
} from '@/models/reconciliation/CreateReconciliation'
import { ReconciliationForm } from '../schema/CreateReconciliationSchema'

export const createReconciliationPayload = ({
  activity_id,
  material_id,
  entity_id,
  start_date,
  end_date,
  items,
}: ReconciliationForm): ReconciliationPayload => {
  const payloadItems: ReconciliationPayloadItem[] = items.map((item) => {
    const {
      reconciliation_category,
      recorded_qty,
      actual_qty,
      action_reasons = [],
    } = item
    return {
      reconciliation_category,
      recorded_qty,
      actual_qty: actual_qty ?? 0,
      actions: action_reasons.map((ar) => ({
        id: ar.action_id ?? 0,
        title: ar.action_title ?? '',
      })),
      reasons: action_reasons.map((ar) => ({
        id: ar.reason_id ?? 0,
        title: ar.reason_title ?? '',
      })),
    }
  })

  return {
    activity_id,
    entity_id,
    material_id,
    start_date: start_date ?? '',
    end_date: end_date ?? '',
    items: payloadItems,
  }
}
