export interface TransactionDiscardPayload {
  activity_id: number
  entity_activity_id: number
  entity_id: number
  materials: DiscardMaterial[]
}

export interface DiscardMaterial {
  material_id: number
  other_reason: string | null
  qty?: number
  open_vial?: number | null
  close_vial?: number | null
  stock_id: number
  stock_quality_id: number | null
  transaction_reason_id: number
  transaction_type_id: number
}
