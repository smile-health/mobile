import { t } from 'i18next'
import * as yup from 'yup'

export const addOrderItemSchema = yup.object().shape({
  quantity: yup.string().required(t('validation.required')),
  reason: yup.string().required(t('validation.required')),
})
