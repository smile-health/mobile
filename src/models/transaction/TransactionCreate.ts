import { TransferStockProgram } from './TransferStock'
import { BaseEntity } from '../app-data/BaseEntity'
import { Activity } from '../app-data/Cva'
import { CommonObject, IOptions } from '../Common'
import { StockBatch, StockDetail } from '../shared/Material'

export interface ReviewTransaction {
  materialName: string
  activityName: string
  transactionName: string
  totalQty: number
  stocks: ReviewTransactionStock[]
}

export interface ReviewTransactionStock
  extends Omit<CreateTransaction, 'patients'> {
  transactionTypeId: number
  customer?: BaseEntity
  vaccineTypeName?: string
  vaccineMethodName?: string
  patients?: (TransactionPatient & { vaccineSequenceName: string })[]
}

export interface TrxReasonOption {
  value: number
  label: string
  is_purchase: boolean
  is_other: boolean
}

export interface CreateTransaction {
  transaction_ids?: number[]
  transaction_id?: number
  stock_id: number | null
  material_id: number
  other_reason: string | null
  change_qty: number
  open_vial_qty: number
  close_vial_qty: number
  transaction_reason_id: number | null
  transaction_reason: TrxReasonOption | null
  stock_quality_id: number | null
  stock_quality: IOptions | null
  price: number | null
  year: number | null
  budget_source_id: number | null
  budget_source: IOptions | null
  batch: (Omit<StockBatch, 'id'> & { id: number | null }) | null
  created_at: string | null
  is_temperature_sensitive: boolean
  is_open_vial: boolean
  is_any_discard?: boolean
  broken_qty?: number
  broken_open_vial?: number
  broken_close_vial?: number
  piece_per_unit: number
  unit: string
  activity: CommonObject | null
  max_return?: number
  consumption_qty?: number
  is_sequence?: boolean
  is_need_patient?: boolean
  vaccine_type_id?: number
  vaccine_method_id?: number
  min_qty_vaccine?: number
  max_qty_vaccine?: number
  destination_activity?: IOptions
  material_name?: string
  total_price?: number | null
  patients?: TransactionPatient[]
}

export interface TransactionPatient {
  identity_type?: number
  patient_id?: string
  vaccine_sequence?: number
  phone_number?: string
  other_sequence?: PatientOtherSequence[]
}

export interface PatientIDMap {
  nik: string[]
  non_nik: string[]
}

export interface PatientOtherSequence {
  vaccine_sequence?: number
  actual_transaction_date?: string
}

export interface BudgetSourceData {
  change_qty: number
  unit: string
  year: number | null
  budget_source_id: number | null
  budget_source: IOptions | null
  price: number | null
}

export interface CreateTransactionStock extends CreateTransaction {
  qty: number
  allocated_qty: number
  available_qty: number
  max_open_vial_qty: number
  min: number
  max: number
  updated_at: string
}

export interface CreateTransactionForm {
  activeBatch: CreateTransactionStock[]
  expiredBatch: CreateTransactionStock[]
}

export type CreateTransactionDetail = StockDetail & {
  stocks: CreateTransactionStock[]
}

export interface TransactionDetail {
  transactionTypeId: number
  customer?: BaseEntity
  program?: TransferStockProgram
  activity: Activity
  transactions: CreateTransaction[]
}

export type BatchType = keyof CreateTransactionForm
export type SectionItemFieldName = `${BatchType}.${number}`
