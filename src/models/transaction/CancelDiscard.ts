export interface TransactionCancelDiscardPayload {
  activity_id: number
  entity_id: number
  entity_activity_id: number
  transactions: CancelDiscardTransaction[]
}

export interface CancelDiscardTransaction {
  stock_id: number
  transaction_ids: number[]
  transaction_reason_id: number
}
