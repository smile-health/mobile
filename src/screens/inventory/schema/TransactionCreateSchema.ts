/* eslint-disable unicorn/no-thenable */
import { t } from 'i18next'
import * as yup from 'yup'
import { TrxReasonOption } from '@/models/transaction/TransactionCreate'
import { TRANSACTION_TYPE } from '@/utils/Constants'
import {
  TRANSACTION_LABEL_KEYS,
  TransactionLabelType,
} from '../constant/transaction.constant'

export const commonObjectSchema = yup.object({
  id: yup.number().required(),
  name: yup.string().required(),
})

export const optionsSchema = yup.object({
  value: yup.number().required(),
  label: yup.string().required(),
})

export const stockBatchSchema = yup.object({
  id: yup.number().required().nullable(),
  code: yup.string().required(),
  production_date: yup.string().required().nullable(),
  expired_date: yup.string().required(),
  manufacture: yup.object({
    id: yup.number().required(),
    name: yup.string().required(),
    address: yup.string().nullable(),
  }),
})

// Transaction schema factory
export const createTransactionStockSchema = (type: TransactionLabelType) => {
  const isAddStock = type === TRANSACTION_LABEL_KEYS.ADD_STOCK
  const isConsumption = type === TRANSACTION_LABEL_KEYS.CONSUMPTION
  const isDiscard = type === TRANSACTION_LABEL_KEYS.DISCARDS

  return yup.object({
    qty: yup.number().required(),
    allocated_qty: yup.number().required(),
    available_qty: yup.number().required(),
    max_open_vial_qty: yup.number().required(),
    min: yup.number().required(),
    max: yup.number().required(),
    updated_at: yup.string().required(),
    activity: commonObjectSchema.required().nullable(),
    material_id: yup.number().required(),
    is_temperature_sensitive: yup.bool().required(),
    is_open_vial: yup.bool().required(),
    is_any_discard: yup.bool().optional().nonNullable(),
    unit: yup.string().required(),
    piece_per_unit: yup.number().required(),
    stock_id: yup.number().required().nullable(),
    change_qty: yup
      .number()
      .default(0)
      .when(
        ['piece_per_unit', 'available_qty', 'is_open_vial'],
        ([piecePerUnit, availableQty, isOpenVial], schema) => {
          if (isOpenVial) return schema.nullable()
          return schema
            .min(1, () => t('validation.zero_quantity'))
            .test(
              'multiple',
              t('transaction.validation.multiply_qty', {
                number: piecePerUnit,
              }),
              (changeQty) => {
                return (
                  !changeQty ||
                  (changeQty > 0 && changeQty % piecePerUnit === 0)
                )
              }
            )
            .test(
              'max-available',
              () => t('transaction.validation.max_qty'),
              function (changeQty) {
                if (!changeQty || changeQty <= 0) return true

                if (!isAddStock) {
                  return changeQty <= (availableQty ?? 0)
                }
                return true
              }
            )
        }
      ),
    open_vial_qty: yup
      .number()
      .default(0)
      .when(
        ['is_open_vial', 'max_open_vial_qty'],
        ([isOpenVial, maxOpenVialQty], schema) => {
          if (!isOpenVial || maxOpenVialQty === 0) return schema.nullable()

          schema = schema.min(1, () => t('validation.zero_quantity'))

          if (isDiscard) {
            return schema.test(
              'open-vial-discard-qty',
              () => t('transaction.validation.open_vial_discard'),
              function (openVialQty) {
                return openVialQty === maxOpenVialQty
              }
            )
          }

          return schema.test(
            'open-vial-max-available',
            () => t('transaction.validation.max_qty'),
            function (openVialQty) {
              if (!openVialQty || openVialQty <= 0) return true

              return openVialQty <= (maxOpenVialQty ?? 0)
            }
          )
        }
      )
      .test(
        'determine-required',
        () => t('validation.required'),
        function (value) {
          const { close_vial_qty, max_open_vial_qty } = this.parent
          if (close_vial_qty > 0 && max_open_vial_qty > 0 && isConsumption) {
            return value > 0
          }
          return true
        }
      ),
    close_vial_qty: yup
      .number()
      .default(0)
      .when(
        ['piece_per_unit', 'available_qty', 'is_open_vial'],
        ([piecePerUnit, availableQty, isOpenVial], schema) => {
          if (!isOpenVial) return schema.nullable()
          return schema
            .min(1, () => t('validation.zero_quantity'))
            .test(
              'multiply-close-vial',
              t('transaction.validation.multiply_qty', {
                number: piecePerUnit,
              }),
              (closeVialQty) => {
                return (
                  !closeVialQty ||
                  (closeVialQty > 0 && closeVialQty % piecePerUnit === 0)
                )
              }
            )
            .test(
              'close-vial-max-available',
              () => t('transaction.validation.max_qty'),
              function (closeVialQty) {
                if (!closeVialQty || closeVialQty <= 0) return true

                return closeVialQty <= (availableQty ?? 0)
              }
            )
        }
      ),
    transaction_reason_id: yup
      .number()
      .required()
      .nullable()
      .when(
        ['change_qty', 'open_vial_qty', 'close_vial_qty'],
        ([changeQty, openVialQty, closeVialQty], schema) => {
          const hasChangeQty = !!changeQty || !!openVialQty || !!closeVialQty
          if (hasChangeQty && !isConsumption) {
            return schema.required(t('validation.required'))
          }
          return schema.nullable()
        }
      ),
    transaction_reason: yup
      .object()
      .shape({
        value: yup.number().required(),
        label: yup.string().required(),
        is_other: yup.bool().required(),
        is_purchase: yup.bool().required(),
      })
      .required()
      .nullable(),
    other_reason: yup
      .string()
      .required(() => t('validation.required'))
      .nullable()
      .when('transaction_reason', {
        is: (val: TrxReasonOption) => val?.is_other,
        then: (schema) => schema.required(t('validation.required')),
        otherwise: (schema) => schema.nullable(),
      }),
    price: yup
      .number()
      .required()
      .nullable()
      .when('transaction_reason', {
        is: (val: TrxReasonOption) => val?.is_purchase && isAddStock,
        then: (schema) => schema.required(t('validation.required')),
        otherwise: (schema) => schema.nullable(),
      }),
    year: yup
      .number()
      .required()
      .nullable()
      .when('transaction_reason', {
        is: (val: TrxReasonOption) => val?.is_purchase && isAddStock,
        then: (schema) => schema.required(t('validation.required')),
        otherwise: (schema) => schema.nullable(),
      }),
    budget_source_id: yup
      .number()
      .required()
      .nullable()
      .when('transaction_reason', {
        is: (val: TrxReasonOption) => val?.is_purchase && isAddStock,
        then: (schema) => schema.required(t('validation.required')),
        otherwise: (schema) => schema.nullable(),
      }),
    budget_source: optionsSchema.required().nullable(),
    stock_quality_id: yup
      .number()
      .required()
      .nullable()
      .when(
        [
          'change_qty',
          'is_temperature_sensitive',
          'open_vial_qty',
          'close_vial_qty',
        ],
        ([changeQty, isTempSensitive, openVialQty, closeVialQty], schema) => {
          const hasChangeQty = !!changeQty || !!openVialQty || !!closeVialQty
          if (isTempSensitive && hasChangeQty) {
            return schema.required(t('validation.required'))
          }
          return schema.nullable()
        }
      ),
    stock_quality: optionsSchema.required().nullable(),
    batch: stockBatchSchema.required().nullable(),
    created_at: yup.string().required().nullable(),
  })
}

export const getTrxValidationSchema = (transactionType?: number) => {
  switch (transactionType) {
    case TRANSACTION_TYPE.ADD_STOCK: {
      return createAddStockValidationSchema
    }
    case TRANSACTION_TYPE.REDUCE_STOCK: {
      return createReduceStockValidationSchema
    }
    case TRANSACTION_TYPE.DISCARDS: {
      return createDiscardValidationSchema
    }
    case TRANSACTION_TYPE.CONSUMPTION: {
      return createConsumptionValidationSchema
    }
    default: {
      return createAddStockValidationSchema
    }
  }
}

export const createAddStockValidationSchema = yup.object({
  activeBatch: yup
    .array()
    .of(createTransactionStockSchema(TRANSACTION_LABEL_KEYS.ADD_STOCK))
    .required(),
  expiredBatch: yup
    .array()
    .of(createTransactionStockSchema(TRANSACTION_LABEL_KEYS.ADD_STOCK))
    .required(),
})

export const createReduceStockValidationSchema = yup.object({
  activeBatch: yup
    .array()
    .of(createTransactionStockSchema(TRANSACTION_LABEL_KEYS.REDUCE_STOCK))
    .required(),
  expiredBatch: yup
    .array()
    .of(createTransactionStockSchema(TRANSACTION_LABEL_KEYS.REDUCE_STOCK))
    .required(),
})

export const createDiscardValidationSchema = yup.object({
  activeBatch: yup
    .array()
    .of(createTransactionStockSchema(TRANSACTION_LABEL_KEYS.REDUCE_STOCK))
    .required(),
  expiredBatch: yup
    .array()
    .of(createTransactionStockSchema(TRANSACTION_LABEL_KEYS.REDUCE_STOCK))
    .required(),
})

export const createConsumptionValidationSchema = yup.object({
  activeBatch: yup
    .array()
    .of(createTransactionStockSchema(TRANSACTION_LABEL_KEYS.CONSUMPTION))
    .required(),
  expiredBatch: yup
    .array()
    .of(createTransactionStockSchema(TRANSACTION_LABEL_KEYS.CONSUMPTION))
    .required(),
})
