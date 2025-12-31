import { t } from 'i18next'
import * as yup from 'yup'

export const cancelOrderSchema = () =>
  yup.object().shape({
    reason: yup.string().required(t('validation.required')),
    comment: yup.string().required(t('validation.required')),
    other_reason_text: yup.string().required(t('validation.required')),
  })
