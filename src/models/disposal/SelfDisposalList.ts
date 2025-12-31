import { TransactionReason } from './DisposalMaterial'
import { DisposalMethod } from './DisposalMethod'
import { ProfileEntity } from '../account/Profile'
import { CommonObject, UserUpdatedBy } from '../Common'
import { PaginateParam, PaginateResponse } from '../Paginate'
import { StockBatch, StockMaterial } from '../shared/Material'

export interface SelfDisposalListFilter {
  start_date?: string
  end_date?: string
  activity_id?: number
  material_id?: number
}

export interface SelfDisposalListParams
  extends SelfDisposalListFilter,
    PaginateParam {
  entity_id?: number
}

export interface SelfDisposalStockDisposal {
  id: number
  stock_id: number
  entity_id: number
  batch_id: number
  material_id: number
  activity_id: number
  transaction_reason_id: number
  disposal_qty: number
  disposal_discard_qty: number
  disposal_received_qty: 0
  disposal_shipped_qty: 0
  updated_at: string
  batch: StockBatch
  activity: CommonObject
  transaction_reason: TransactionReason
}

export interface SelfDisposalListRecord {
  id: number
  activity_id: number
  activity: CommonObject
  entity_id: number
  entity: ProfileEntity
  material_id: number
  material: StockMaterial
  report_number?: string
  disposal_number?: string
  comment?: string
  stock_disposal_id: number
  opening_qty: number
  change_qty: number
  closing_qty: number
  disposal_discard_qty: number | null
  disposal_received_qty: number | null
  transaction_reason: TransactionReason
  disposal_transaction_type_id: number
  disposal_method_id: number
  disposal_method: DisposalMethod
  disposal_stock: SelfDisposalStockDisposal
  created_by: number
  created_at: string
  user_created: UserUpdatedBy
  updated_by: number
  updated_at: string
  user_updated: UserUpdatedBy
}

export interface SelfDisposalListResponse extends PaginateResponse {
  data: SelfDisposalListRecord[]
}
