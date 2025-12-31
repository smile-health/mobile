import { PatientOtherSequence } from './TransactionCreate'

export interface TransactionConsumptionPayload {
  activity_id: number
  entity_activity_id: number
  actual_transaction_date: string
  customer_id: number
  entity_id: number
  materials: ConsumptionMaterial[]
}

export interface ConsumptionMaterial {
  material_id: number
  qty?: number
  open_vial?: number | null
  close_vial?: number | null
  stock_id: number
  stock_quality_id: number | null
  vaccine_type?: number
  vaccine_method?: number
  identity_type?: number
  identity_number?: string
  phone_number?: string | null
  patients?: ConsumptionPatient[]
}

export interface ConsumptionPatient {
  identity_type: number
  identity_number: string
  vaccine_sequence?: number
  phone_number?: string | null
  other_sequences?: PatientOtherSequence[]
}

export type ValidationErrorSequence = Record<string, ValidationMessage[]>

export interface ValidationMessage {
  message: string
  data: OtherSequenceData[]
}

export interface CompletedSequencePatient {
  material_index: number
  patient_index: number
  vaccine_method_title?: string
  identity_type?: number
  identity_number?: string
  data: OtherSequenceData[]
}
export interface OtherSequenceData {
  vaccine_method: number
  vaccine_method_title: string
  vaccine_sequence: number
  vaccine_sequence_title: string
  actual_transaction_date: string
}
