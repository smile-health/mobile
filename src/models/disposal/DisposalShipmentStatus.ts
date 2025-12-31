export interface DisposalShipmentStatusCount {
  status: number
  status_label: string
  total: number
}

export interface UpdateDisposalShipmentResponse {
  id: number
  status: string
}

export interface CancelDisposalShipmentPayload {
  id: number
  comment?: string
}

export interface ReceiveDisposalShipmentPayload {
  id: number
  comment?: string
  items: ReceiveDisposalShipmentItem[]
}

export interface ReceiveDisposalShipmentItem {
  disposal_shipment_item_id: number
  confirmed_qty: number
  stocks: ReceiveDisposalShipmentItemStock[]
}

export interface ReceiveDisposalShipmentItemStock {
  disposal_shipment_stock_id: number
  received_qty: number
}

export interface IShipmentItemStockQuantity {
  reason_title: string
  reason_id: number
  qty: number
}

export interface IShipmentDetailStockItem {
  id: number
  activity_name: string
  qty: number
  batch_code?: string
  expired_date?: string
  manufacture?: string
  discard: IShipmentItemStockQuantity[]
  received: IShipmentItemStockQuantity[]
}

export interface IShipmentDetailMaterialItem {
  id: number
  qty: number
  material_name: string
  is_batch: boolean
  stocks: IShipmentDetailStockItem[]
}
