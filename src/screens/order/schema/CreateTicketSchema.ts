import { t } from 'i18next'
import * as yup from 'yup'

export const createTicketSchema = yup.object().shape({
  isSubmitted: yup.number().oneOf([0, 1]).required(t('validation.required')),
  doNumber: yup.string().required(t('validation.required')),
  arrivalDate: yup.date().required(t('validation.required')),
})
