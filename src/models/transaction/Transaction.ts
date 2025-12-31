import { ProfileEntity } from '../account/Profile'
import { CommonObject } from '../Common'
import { PaginateParam, PaginateResponse } from '../Paginate'

export interface TransactionListFilter {
  start_date?: string
  end_date?: string
  activity_id?: number
  transaction_type_id?: number
  material_id?: number
  parent_material_id?: number
}

export interface TransactionListParams
  extends PaginateParam,
    TransactionListFilter {
  entity_id?: number
}

export interface TransactionDiscardFilter {
  start_date?: string
  end_date?: string
  transaction_reason_id?: number
}

export interface TransactionDiscardParams
  extends PaginateParam,
    TransactionDiscardFilter {
  entity_id?: number
  activity_id?: number
  material_id?: number
}

export interface TransactionConsumptionFilter {
  start_date?: string
  end_date?: string
}

export interface TransactionConsumptionParams
  extends PaginateParam,
    TransactionConsumptionFilter {
  entity_id?: number
  activity_id?: number
  material_id?: number
  customer_id?: number
}

export interface TransactionListResponse extends PaginateResponse {
  data: Transaction[]
}

export interface Transaction {
  id: number
  entity_id: number
  entity: ProfileEntity
  customer_id: number | null
  vendor_id: number | null
  customer: CommonObject | null
  vendor: CommonObject | null
  material_id: number
  material: TransactionMaterial
  parent_material: CommonObject
  activity_id: number
  activity: CommonObject
  opening_qty: number
  companion_program: CommonObject
  companion_activity: CommonObject
  transaction_type_id: number
  transaction_type: TransactionType
  transaction_reason_id: number
  transaction_reason: TransactionReason
  other_reason: string | null
  order_id: number | null
  order: TransactionOrder | null
  change_qty: number
  closing_qty: number
  created_at: string
  updated_at: string
  deleted_at: string | null
  created_by: number
  updated_by: number
  user_created_by: UserCreatedUpdatedBy
  user_updated_by: UserCreatedUpdatedBy
  device_type: number
  actual_transaction_date: string | null
  transaction_purchase: TransactionPurchase
  stock_id: number
  stock: TransactionStock
  patients: TransactionPatient[]
}

export interface TransactionDiscardsResponse extends PaginateResponse {
  data: TransactionDiscard[]
}

export interface TransactionDiscard extends Omit<Transaction, 'stock'> {
  transaction_type: TransactionType & { title_en: string }
  stock: {
    batch: TransactionStockBatch | null
    id: number
    stock_quality: {
      id: number
      label: string
    } | null
  }
}

export interface TransactionConsumptionResponse extends PaginateResponse {
  data: TransactionConsumption[]
}

export interface TransactionConsumption extends Transaction {
  max_return: number
  returned_qty: number
}

interface TransactionMaterial {
  id: number
  name: string
  description: string
  is_vaccine: number
  is_open_vial: number
  managed_in_batch: number
  material_type: CommonObject
  unit_of_consumption: string
  is_temperature_sensitive: number
  consumption_unit_per_distribution_unit: number
}

interface TransactionType {
  id: number
  title: string
  title_en: string
  change_type: number
}

interface TransactionReason {
  id: number
  title: string
  title_en: string
  is_other: number
  is_purchase: number
}

interface TransactionOrder {
  status_label: string
  id: number
  type: number
  status: number
}

interface UserCreatedUpdatedBy {
  id: number
  username: string | null
  firstname: string | null
  lastname: string | null
}

export interface TransactionPurchase {
  id: number | null
  year: number | null
  price: number | null
  budget_source: {
    id: number | null
    name: string | null
  }
}

export interface TransactionStock {
  id: number
  close_vial: number
  open_vial: number
  activity: CommonObject
  batch: TransactionStockBatch | null
  stock_quality_id: number | null
}

export interface TransactionStockBatch {
  id: number
  code: string
  expired_date: string
  production_date: string
  status: number
  manufacture: CommonObject & { address: string }
}

export interface TransactionPatient {
  identity_type: number
  identity_number: string
  phone_number: string
  protocol: string
  vaccine_type: {
    id: number
    title: string
  }
  vaccine_method: {
    id: number
    title: string
  }
  vaccine_sequence: {
    id: number
    title: string
  }
}
