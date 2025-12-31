import { t } from 'i18next'
import * as yup from 'yup'

// Base schemas for reusability
const baseStockSchema = {
  stock_id: yup.number().required(),
  allocated_qty: yup.number().min(0).default(0),
  order_stock_status_id: yup.number().nullable(),
}

const receiveStockSchema = yup.object({
  ...baseStockSchema,
  received_qty: yup.number().required().min(0),
  material_status: yup.number().nullable(),
})

const allocationStockSchema = yup.object({
  ...baseStockSchema,
  allocated_qty: yup.number().required().min(0),
})

// Reusable order item base schema
const baseOrderItemSchema = {
  id: yup.number().required(),
}

// Hierarchy child item schema
const hierarchyChildSchema = yup.object({
  ...baseOrderItemSchema,
  order_item_kfa_id: yup.number().nullable(),
  material_id: yup.number().nullable(),
  allocated_qty: yup.number().min(0).nullable(),
  recommended_stock: yup.number().min(0).nullable(),
  order_reason_id: yup.number().nullable(),
  allocations: yup
    .array()
    .of(allocationStockSchema)
    .required(t('validation.required')),
})

// Main schemas
export const ReceivedOrderSchema = () =>
  yup.object({
    fulfilled_at: yup.string().required(t('validation.required')),
    comment: yup.string().nullable().max(500), // Added max length
    order_items: yup
      .array()
      .of(
        yup.object({
          ...baseOrderItemSchema,
          receives: yup
            .array()
            .of(receiveStockSchema)
            .required(t('validation.required'))
            .min(1, t('validation.required')), // At least one receive item
        })
      )
      .required(t('validation.required'))
      .min(1, t('validation.required')), // At least one order item
  })

export const ReceivedOrderHierarchySchema = () =>
  yup.object({
    fulfilled_at: yup.string().required(t('validation.required')),
    comment: yup.string().nullable().max(500),
    order_items: yup
      .array()
      .of(
        yup.object({
          ...baseOrderItemSchema,
          children: yup
            .array()
            .of(hierarchyChildSchema)
            .required(t('validation.required'))
            .min(1, t('validation.required')),
        })
      )
      .required(t('validation.required'))
      .min(1, t('validation.required')),
  })
