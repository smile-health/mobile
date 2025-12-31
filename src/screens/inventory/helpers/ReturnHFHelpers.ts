import {
  TransactionConsumption,
  TransactionPatient,
} from '@/models/transaction/Transaction'
import { CreateTransaction } from '@/models/transaction/TransactionCreate'
import { materialStatuses } from '@/utils/Constants'
import { generateTrxBatch } from './TransactionHelpers'

const createPatients = (patients?: TransactionPatient[]) => {
  if (!patients) return

  return patients.map((p) => ({
    identity_type: p.identity_type,
    patient_id: p.identity_number,
    phone_number: p.phone_number,
    vaccine_sequence: p.vaccine_sequence.id,
  }))
}

export function trxConsumptionToCreateTransaction(
  trx: TransactionConsumption,
  isOpenVial: boolean
): CreateTransaction {
  const {
    activity,
    stock: { batch, stock_quality_id },
    patients,
  } = trx

  const stockQuality = materialStatuses.find(
    (ms) => ms.value === stock_quality_id
  )

  return {
    activity,
    transaction_id: trx.id,
    stock_id: trx.stock_id,
    material_id: trx.material.id,
    other_reason: trx.other_reason ?? null,
    change_qty: patients.length > 0 ? trx.max_return : 0,
    max_return: trx.max_return,
    consumption_qty: Math.abs(trx.change_qty),
    open_vial_qty: 0,
    close_vial_qty: 0,
    transaction_reason_id: null,
    transaction_reason: null,
    stock_quality_id,
    stock_quality: stockQuality ?? null,
    price: trx.transaction_purchase?.price ?? null,
    year: trx.transaction_purchase?.year ?? null,
    budget_source_id: null,
    budget_source: null,
    batch: generateTrxBatch(batch),
    created_at: trx.created_at,
    is_temperature_sensitive: !!trx.material.is_temperature_sensitive,
    is_open_vial: isOpenVial,
    piece_per_unit: trx.material.consumption_unit_per_distribution_unit,
    unit: trx.material.unit_of_consumption,
    vaccine_type_id: trx.patients?.[0]?.vaccine_type?.id,
    vaccine_method_id: trx.patients?.[0]?.vaccine_method?.id,
    patients: createPatients(patients),
  }
}
