export type DisposalShipmentStockItemPayload = {
  discard_qty: number
  received_qty: number
  disposal_stock_id: number
  transaction_reasons: {
    id: number
  }
}

export type DisposalShipmentStocksPayload = {
  activity_id: number
  activity_name: string
  batch: {
    code: string
    id: number
  } | null
  stock_id: number
  stock_qty: number
  disposal_stocks: DisposalShipmentStockItemPayload[]
}

export type DisposalShipmentOrderItemsPayload = {
  material_id: number
  material_name: string
  shipment_qty: number
  stocks: DisposalShipmentStocksPayload[]
}

export interface CreateDisposalShipmentPayload {
  activity_id: number
  customer_id?: number
  vendor_id?: number
  flow_id: number
  is_allocated: number
  no_document: string
  disposal_comments?: string
  disposal_items: DisposalShipmentOrderItemsPayload[]
  type: number
  follow_up_action_id?: number | null
}
