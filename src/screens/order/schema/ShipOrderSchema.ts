import { t } from 'i18next'
import * as yup from 'yup'

export const ShipOrderSchema = () =>
  yup.object().shape({
    sales_ref: yup.string(),
    estimated_date: yup.string(),
    taken_by_customer: yup.number(),
    actual_shipment_date: yup.string().required(t('validation.required')),
    comment: yup.string(),
  })
