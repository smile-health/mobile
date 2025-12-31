export interface TransactionReturnHFPayload {
  activity_id: number
  actual_transaction_date: string
  customer_id: number
  entity_id: number
  entity_activity_id: number
  transactions: ReturnHFTransaction[]
}

export interface ReturnHFTransaction {
  broken_qty?: number | null
  qty?: number
  open_vial?: number | null
  close_vial?: number | null
  broken_open_vial?: number | null
  broken_close_vial?: number | null
  stock_id: number | null
  other_reason?: string
  transaction_reason_id?: number
  transaction_id?: number
}

export interface ReturnHFMaterial {
  broken_qty: number | null
  material_id: number
  qty: number
  stock_id: number
  transaction_reason_id: number | null
  transaction_id?: number
}
