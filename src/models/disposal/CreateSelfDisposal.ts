import { DisposalMaterialBatch } from './DisposalStock'
import { CommonObject } from '../Common'
import { StockMaterial } from '../shared/Material'

// Individual disposal item interface
export interface AddDisposalItem {
  disposal_stock_id: number
  transaction_reason_id: number
  transaction_reason_name: string
  disposal_qty: number
}

// Main form interface
export interface AddDisposalForm {
  discard: AddDisposalItem[]
  received: AddDisposalItem[]
}

export interface SelfDisposal {
  material: StockMaterial
  selected_activity_stocks: number[]
  disposal: SelfDisposalStock[]
}

export interface SelfDisposalBatch {
  batch: DisposalMaterialBatch
  disposal: CreateSelfDisposalItem[]
}

export interface SelfDisposalStock {
  stock_id: number
  activity: CommonObject
  batch?: DisposalMaterialBatch
  discard: AddDisposalItem[]
  received: AddDisposalItem[]
}

export interface CreateSelfDisposalItem {
  disposal_stock_id: number
  transaction_reason_id: number
  disposal_discard_qty: number
  disposal_received_qty: number
}

export interface CreateSelfDisposalRequest {
  activity_id: number
  disposal_method_id: number
  entity_id?: number
  report_number: string
  comment?: string
  disposal_items: CreateSelfDisposalItem[]
}
