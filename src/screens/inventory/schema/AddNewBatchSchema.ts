import { t } from 'i18next'
import * as yup from 'yup'

export type AddNewBatchFormField = yup.InferType<
  ReturnType<typeof AddNewBatchSchema>
>

export const AddNewBatchSchema = () =>
  yup.object().shape({
    code: yup.string().required(t('validation.required')),
    production_date: yup.string().required().nullable(),
    manufacture_id: yup.number().required(t('validation.required')),
    manufacture: yup
      .object()
      .shape({
        id: yup.number().required(),
        name: yup.string().required(),
        address: yup
          .string()
          .default('')
          .transform((value) => value || ''),
      })
      .required(),
    expired_date: yup.string().required(t('validation.required')),
  })
