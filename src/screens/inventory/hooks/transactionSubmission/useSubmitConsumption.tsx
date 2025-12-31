import { useState } from 'react'
import { useLanguage } from '@/i18n/useLanguage'
import {
  ConsumptionMaterial,
  TransactionConsumptionPayload,
} from '@/models/transaction/Consumption'
import { TransactionSubmitHandler } from '@/models/transaction/TransactionSubmit'
import { useCreateTrxConsumptionMutation } from '@/services/apis/transaction.api'

export default function useSubmitConsumption() {
  const [createConsumptionTransaction, { isLoading }] =
    useCreateTrxConsumptionMutation()
  const [actualConsumptionDate, setActualConsumptionDate] = useState('')
  const [consumptionPayload, setConsumptionPayload] = useState<
    TransactionConsumptionPayload | undefined
  >()

  const { t } = useLanguage()

  const submitConsumption: TransactionSubmitHandler = (
    program,
    transactions,
    activity,
    customer
  ) => {
    if (!customer || !actualConsumptionDate) {
      throw new Error(
        t('error.actual_date_required', {
          type: t('label.actual_date_consumption'),
        })
      )
    }
    const materials: ConsumptionMaterial[] = transactions.map((trx) => ({
      material_id: trx.material_id,
      ...(trx.is_open_vial
        ? { open_vial: trx.open_vial_qty, close_vial: trx.close_vial_qty }
        : { qty: trx.change_qty }),
      qty: trx.change_qty,
      stock_id: trx?.stock_id ?? 0,
      stock_quality_id: trx?.stock_quality_id,
      // consumption is_need_patient= true && is_sequence = true
      ...(trx.is_need_patient && trx.is_sequence
        ? {
            vaccine_type: trx.vaccine_type_id,
            vaccine_method: trx.vaccine_method_id,
            patients: trx.patients?.map((patient) => ({
              identity_type: patient.identity_type ?? 0,
              identity_number: patient.patient_id ?? '',
              phone_number: patient.phone_number ?? null,
              vaccine_sequence: patient.vaccine_sequence,
              other_sequences: patient.other_sequence,
            })),
          }
        : {}),
      // consumption is_need_patient= true && is_sequence = false
      ...(trx.is_need_patient && !trx.is_sequence
        ? {
            identity_type: trx.patients?.[0]?.identity_type,
            identity_number: trx.patients?.[0]?.patient_id,
            phone_number: trx.patients?.[0]?.phone_number ?? null,
          }
        : {}),
    }))

    const payload: TransactionConsumptionPayload = {
      activity_id: activity.id,
      entity_activity_id: activity.entity_activity_id,
      entity_id: program.entity_id,
      customer_id: customer.id,
      actual_transaction_date: actualConsumptionDate,
      materials,
    }
    setConsumptionPayload(payload)

    return createConsumptionTransaction(payload).unwrap()
  }

  return {
    actualConsumptionDate,
    submitConsumption,
    setActualConsumptionDate,
    isLoadingConsumption: isLoading,
    consumptionPayload,
    createConsumptionTransaction,
  }
}
