/* eslint-disable unicorn/no-thenable */
import { t } from 'i18next'
import * as yup from 'yup'
import {
  commonObjectSchema,
  optionsSchema,
  stockBatchSchema,
} from '@/screens/inventory/schema/TransactionCreateSchema'

export const TransferStockItemSchema = yup.object({
  qty: yup.number().required(),
  available_qty: yup.number().required(),
  activity: commonObjectSchema.required().nullable(),
  material_id: yup.number().required(),
  material_name: yup.string(),
  piece_per_unit: yup.number().required(),
  stock_id: yup.number().required().nullable(),
  price: yup.number().required().nullable(),
  total_price: yup.number().required().nullable(),
  budget_source: optionsSchema.required().nullable(),
  batch: stockBatchSchema.required().nullable(),
  created_at: yup.string().required().nullable(),
  change_qty: yup
    .number()
    .nullable()
    .when(
      ['piece_per_unit', 'available_qty'],
      ([piecePerUnit, availableQty], schema) => {
        return schema
          .min(1, () => t('validation.zero_quantity'))
          .test(
            'must-multiple-qty',
            t('transaction.validation.multiply_qty', {
              number: piecePerUnit,
            }),
            (changeQty) => {
              return (
                !changeQty || (changeQty > 0 && changeQty % piecePerUnit === 0)
              )
            }
          )
          .test(
            'max-Transfer-Stock-Qty',
            () => t('transaction.validation.max_qty'),
            function (changeQty) {
              if (!changeQty || changeQty <= 0) return true
              return changeQty <= (availableQty ?? 0)
            }
          )
      }
    ),
})

export const TransferStockFormSchema = yup.object({
  destination_activity_id: yup
    .number()
    .required(() => t('validation.required')),
  destination_activity: optionsSchema,
  items: yup
    .object({
      activeBatch: yup.array().of(TransferStockItemSchema).required(),
      expiredBatch: yup.array().of(TransferStockItemSchema).required(),
    })
    .test('atleast-one-valid', t('error.complete_data'), (value) => {
      const { activeBatch, expiredBatch } = value
      return [...activeBatch, ...expiredBatch].some((s) =>
        Boolean(s.change_qty)
      )
    }),
})

export type TransferStockItemForm = yup.InferType<
  typeof TransferStockItemSchema
>

export type TransferStockForm = yup.InferType<typeof TransferStockFormSchema>
