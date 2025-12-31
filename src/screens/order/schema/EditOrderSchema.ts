import { t } from 'i18next'
import * as yup from 'yup'

export const EditOrderSchema = () =>
  yup.object().shape({
    date: yup.string().required(t('validation.required')),
    comment: yup.string().required(t('validation.required')),
    letter_number: yup.string().required(t('validation.required')),
  })
