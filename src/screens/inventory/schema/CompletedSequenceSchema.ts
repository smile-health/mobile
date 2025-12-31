import { t } from 'i18next'
import * as yup from 'yup'

export const CompletedSequenceSchema = () => {
  return yup.object({
    actual_consumption_date: yup.string().nullable(),
    patients: yup
      .array()
      .of(
        yup.object({
          material_index: yup.number().required(),
          patient_index: yup.number().required(),
          vaccine_method_title: yup.string().nullable(),
          identity_type: yup.number().nullable(),
          identity_number: yup.string().nullable(),
          data: yup
            .array()
            .of(
              yup.object({
                vaccine_method: yup.number().nullable(),
                vaccine_method_title: yup.string().nullable(),
                vaccine_sequence: yup.number().nullable(),
                vaccine_sequence_title: yup.string().nullable(),
                actual_transaction_date: yup
                  .string()
                  .required(t('validation.required')),
              })
            )
            .required(),
        })
      )
      .required(),
  })
}

export type CompletedSequenceForm = yup.InferType<
  ReturnType<typeof CompletedSequenceSchema>
>
