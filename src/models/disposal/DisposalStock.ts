import { CommonObject } from '../Common'
import { PaginateParam, PaginateResponse } from '../Paginate'
import { StockMaterial } from '../shared/Material'

// Define the disposal stock item interface based on the API response
export interface DisposalStockItemResponse {
  parent_material_id: number
  material_id: number
  entity_id: number
  total_disposal_qty: number
  total_disposal_discard_qty: number
  total_disposal_received_qty: number
  total_disposal_shipped_qty: number
  updated_at: string
  entity: {
    id: number
    name: string
    type: number
    address: string
    tag: string
    updated_at: string
    location: string
  }
  material: {
    id: number
    name: string
    material_level_id: number
    is_temperature_sensitive: number
    is_open_vial: number
    is_managed_in_batch: number
    unit_of_consumption: string
    consumption_unit_per_distribution_unit: number
    status: number
    companions: Array<{
      id: number
      name: string
    }>
    activities: Array<{
      id: number
      name: string
    }>
  }
  details: DisposalDetailMaterialItem[]
}

export interface DisposalStockSelectedItem {
  id: number
  name: string
  isManagedInBatch: number
  updatedAt: string
  totalStock: number
  details: DisposalDetailMaterialItem[]
  material?: {
    code: string
    unit_of_consumption: string
  }
}

export interface DisposalTransactionStockDetail extends DisposalStockBase {
  material_id: number
  stock_id: number
  disposal_stock_id: number
  updated_at: string
  transaction_reason_id: number
  transaction_reason: TransactionReason
}

export interface DisposalDetailMaterialStockItem extends DisposalStockBase {
  id: number
  material_id: number
  batch: DisposalMaterialBatch | null
  updated_at: string
  activity: CommonObject
  disposals: DisposalTransactionStockDetail[]
}
export interface DisposalDetailMaterialItem {
  activity_id: number
  material_id: number
  material: StockMaterial
  disposal_qty: number
  disposal_discard_qty: number
  disposal_received_qty: number
  disposal_shipped_qty: number
  updated_at: string
  activity: {
    id: number
    name: string
    code: string | null
  }
  history: {
    total_disposal_shipment: number
    total_self_disposal: number
  }
  stocks: DisposalDetailMaterialStockItem[]
}

export interface DisposalMaterialParams {
  activity_id: string | number
  method_id: string | number
  keyword: string | null
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

export interface DisposalMaterialBatch {
  id: number
  code: string
  expired_date: string
  production_date: string
  manufacture: {
    id: number
    name: string
  }
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
  batch?: DisposalMaterialBatch
  updated_at: string
  activity: CommonObject
  disposals: DisposalTransactionStock[]
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

// Define query parameters interface based on API specification
export interface DisposalStockQueryParams extends PaginateParam {
  entity_id?: number
  activity_id?: number
  flow_id?: number
  material_level_id?: number
  keyword?: string
  only_have_qty?: number
}

// Define API response interface
export interface DisposalStockResponse extends PaginateResponse {
  data: DisposalStockItemResponse[]
}
