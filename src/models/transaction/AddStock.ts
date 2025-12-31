export interface TransactionAddStockPayload {
  activity_id: number
  entity_activity_id: number
  entity_id: number
  materials: AddStockMaterial[]
}

export interface AddStockMaterial {
  batch: AddStockBatch | null
  budget_source_id: number | null
  material_id: number
  other_reason: null | string
  price: number | null
  qty: number
  stock_id: number | null
  stock_quality_id: number | null
  transaction_reason_id: number
  year: number | null
}

export interface AddStockBatch {
  code: string
  expired_date: string
  manufacture_id: number
  production_date: string | null
}
