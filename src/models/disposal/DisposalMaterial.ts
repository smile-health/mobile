import { CommonObject } from '../Common'
import { PaginateResponse } from '../Paginate'
import { StockBatch, StockMaterial } from '../shared/Material'

export interface DisposalMaterialParams {
  entity_id?: number
  activity_id?: number
  method_id?: number
  material_level_id?: number
  keyword?: string
}

export interface DisposalMaterialResponse extends PaginateResponse {
  data: DisposalMaterial[]
}

export interface DisposalStockBase {
  disposal_qty: number
  disposal_discard_qty: number
  disposal_received_qty: number
  disposal_shipped_qty: number
}

export interface TransactionReason {
  id: number
  title: string
  title_en: string
}

export interface DisposalTransactionStock extends DisposalStockBase {
  disposal_stock_id: number
  transaction_reason: TransactionReason
}

export interface DisposalMaterialStock extends DisposalStockBase {
  stock_id: number
  disposal_stock_id: number
  batch?: StockBatch
  updated_at: string
  activity: CommonObject
  stocks: DisposalTransactionStock[]
}

export interface DisposalMaterial {
  id: number
  total_disposal_qty: number
  total_disposal_discard_qty: number
  total_disposal_received_qty: number
  total_disposal_shipped_qty: number
  stock_update: string
  material_id: number
  material: StockMaterial
  details?: DisposalMaterialStock[]
}

export interface DisposalSectionData {
  key: string
  title: string
  data: []
}

export interface DisposalSectionItem {
  id: number
  title: string
  title_en: string
  disposal_qty: number
}
