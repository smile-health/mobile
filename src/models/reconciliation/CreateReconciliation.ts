import { BaseUserDetail } from '../Common'
import { PaginateResponse } from '../Paginate'

export interface GenerateReconciliationParams {
  activity_id?: number
  end_date?: string
  entity_id?: number
  material_id?: number
  start_date?: string
}

export interface GenerateReconciliationResponse {
  data: ReconciliationData[]
}

export interface ReconciliationData {
  reconciliation_category: number
  reconciliation_category_label: string
  recorded_qty: number
}

export interface GetActionReasonResponse extends PaginateResponse {
  data: ActionReasonData[]
}

export interface ActionReasonData {
  id: number
  title: string
  created_at: string
  deleted_at: string | null
  updated_at: string
  deleted_by: BaseUserDetail | null
  updated_by: BaseUserDetail | null
}

export interface ReconciliationPayload {
  activity_id: number
  end_date: string
  entity_id: number
  items: ReconciliationPayloadItem[]
  material_id: number
  start_date: string
}

export interface ReconciliationPayloadItem {
  actions: ItemReasonAction[]
  actual_qty: number
  reasons: ItemReasonAction[]
  reconciliation_category: number
  recorded_qty: number
}

export interface ItemReasonAction {
  id: number
  title: string
}
