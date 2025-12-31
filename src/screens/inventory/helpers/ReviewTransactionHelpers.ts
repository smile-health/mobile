import {
  CompletedSequencePatient,
  OtherSequenceData,
  TransactionConsumptionPayload,
  ValidationErrorSequence,
} from '@/models/transaction/Consumption'
import { CompletedSequenceForm } from '../schema/CompletedSequenceSchema'

export function extractNumbers(str: string): string[] {
  return str.match(/\d+/g)?.map(String) || []
}

export function convertValidationError(
  payload: TransactionConsumptionPayload,
  errorSequence: ValidationErrorSequence
): CompletedSequencePatient[] {
  return Object.entries(errorSequence).map(([key, data]) => {
    const match = extractNumbers(key)
    const materialIndex = Number.parseInt(match[0], 10)
    const patientIndex = Number.parseInt(match[1], 10)

    const otherSequenceData: OtherSequenceData[] = data[0]?.data ?? []
    const patient = payload.materials[materialIndex]?.patients?.[patientIndex]

    return {
      material_index: materialIndex,
      patient_index: patientIndex,
      vaccine_method_title: data[0]?.data[0]?.vaccine_method_title,
      identity_type: patient?.identity_type,
      identity_number: patient?.identity_number,
      data: otherSequenceData,
    }
  })
}

export function mergePayloadWithOtherSequence(
  payload: TransactionConsumptionPayload,
  { patients }: CompletedSequenceForm
): TransactionConsumptionPayload {
  if (!payload.materials || !Array.isArray(patients) || patients.length === 0) {
    return { ...payload }
  }
  return {
    ...payload,
    materials: payload.materials.map((material, materialIndex) => {
      const patientsForThisMaterial = patients.filter(
        (p) => p?.material_index === materialIndex
      )

      if (patientsForThisMaterial.length === 0 || !material.patients) {
        return material
      }

      return {
        ...material,
        patients: material.patients.map((patientData, patientIndex) => {
          const matchingPatient = patientsForThisMaterial.find(
            (p) => p?.patient_index === patientIndex
          )

          if (!matchingPatient || !Array.isArray(matchingPatient.data)) {
            return patientData
          }

          return {
            ...patientData,
            other_sequences: matchingPatient.data
              .filter((p) => p && typeof p === 'object')
              .map((p) => ({
                actual_transaction_date: p.actual_transaction_date,
                vaccine_sequence: p.vaccine_sequence ?? 0,
              })),
          }
        }),
      }
    }),
  }
}
