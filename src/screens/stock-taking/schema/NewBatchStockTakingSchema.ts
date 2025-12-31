import { t } from 'i18next'
import * as yup from 'yup'

export type NewBatchStockTakingForm = yup.InferType<
  typeof NewBatchStockTakingSchema
>

export const NewBatchStockTakingSchema = yup.object().shape({
  batch_code: yup.string().required(t('validation.required')),
  activity_id: yup.number().required(t('validation.required')),
  activity_name: yup.string().required(t('validation.required')),
  expired_date: yup.string().required(t('validation.required')),
})
