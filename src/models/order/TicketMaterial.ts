export interface TicketMaterialBatchItem {
  material_id: number | null
  custom_material: string | null
  batch_code: string | null
  expired_date: string | null
  production_date: string | null
  qty: number
  reason_id: number | null
  child_reason_id: number | null
}

export interface TicketMaterialRequest {
  entity_id: number | undefined
  has_order: number | undefined
  order_id: number | null
  do_number: string | null
  arrived_date: string
  items: TicketMaterialBatchItem[]
  comment: string | null
  request_cancel?: number
}

export interface TicketMaterialResponse {
  success: boolean
  message: string
  id: number
}
