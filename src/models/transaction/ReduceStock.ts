export interface TransactionReduceStockPayload {
  activity_id: number
  entity_activity_id: number
  entity_id: number
  materials: ReduceStockMaterial[]
}

export interface ReduceStockMaterial {
  material_id: number
  other_reason: string | null
  qty: number
  stock_id: number
  stock_quality_id: number | null
  transaction_reason_id: number
}
