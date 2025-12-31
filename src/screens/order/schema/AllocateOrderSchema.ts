import { t } from 'i18next'
import * as yup from 'yup'

const allocationSchema = yup.object().shape({
  stock_id: yup.number(),
  allocated_qty: yup.number().required(t('validation.required')),
  order_stock_status_id: yup.number().required(t('validation.required')),
})

const childSchema = yup.object().shape({
  id: yup.number().notRequired(),
  order_item_kfa_id: yup.number().notRequired(),
  material_id: yup.number().notRequired(),
  allocated_qty: yup.number().notRequired(),
  recommended_stock: yup.number().notRequired(),
  order_reason_id: yup.number().notRequired(),
  allocations: yup.array().of(allocationSchema),
})

const orderItemSchema = yup.object().shape({
  id: yup.number(),
  children: yup.array().of(childSchema),
})

export const AllocatedOrderSchema = () =>
  yup.object({
    comment: yup.string().nullable(),
    order_items: yup.array().of(orderItemSchema),
  })
