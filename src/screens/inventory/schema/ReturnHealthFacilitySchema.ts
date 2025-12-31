/* eslint-disable unicorn/no-thenable */
import { t } from 'i18next'
import * as yup from 'yup'
import { TrxReasonOption } from '@/models/transaction/TransactionCreate'
import {
  commonObjectSchema,
  optionsSchema,
  stockBatchSchema,
} from './TransactionCreateSchema'

export const ReturnHealthFacilitySchema = () => {
  return yup
    .object()
    .shape({
      selectedTrx: yup
        .array()
        .of(
          yup.object({
            transaction_id: yup.number().optional(),
            activity: commonObjectSchema.required().nullable(),
            material_id: yup.number().required(),
            unit: yup.string().required(),
            piece_per_unit: yup.number().required(),
            stock_id: yup.number().required().nullable(),
            vaccine_type_id: yup.number().optional(),
            vaccine_method_id: yup.number().optional(),
            is_temperature_sensitive: yup.bool().required(),
            is_open_vial: yup.bool().required(),
            is_any_discard: yup.bool().optional().nonNullable(),
            batch: stockBatchSchema.required().nullable(),
            consumption_qty: yup.number().optional(),
            max_return: yup.number().optional(),
            change_qty: yup
              .number()
              .default(0)
              .when(
                ['piece_per_unit', 'max_return', 'is_open_vial'],
                ([piecePerUnit, maxReturn, isOpenVial], schema) => {
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
                      () => t('transaction.validation.max_return_qty'),
                      function (changeQty) {
                        if (!changeQty || changeQty <= 0) return true
                        return changeQty <= (maxReturn ?? 0)
                      }
                    )
                }
              ),
            open_vial_qty: yup
              .number()
              .default(0)
              .when(
                ['is_open_vial', 'piece_per_unit'],
                ([isOpenVial, piecePerUnit], schema) => {
                  if (!isOpenVial) return schema.nullable()

                  return schema
                    .min(1, () => t('validation.zero_quantity'))
                    .test(
                      'open-vial-max-return',
                      () =>
                        t('transaction.validation.max_qty_vaccine', {
                          number: piecePerUnit,
                        }),
                      function (openVialQty) {
                        if (!openVialQty || openVialQty <= 0) return true

                        return openVialQty < (piecePerUnit ?? 0)
                      }
                    )
                }
              )
              .test(
                'determine-required',
                () => t('validation.required'),
                function (value) {
                  const { close_vial_qty } = this.parent
                  if (close_vial_qty > 0) {
                    return value > 0
                  }
                  return true
                }
              ),
            close_vial_qty: yup
              .number()
              .default(0)
              .when(
                [
                  'piece_per_unit',
                  'max_return',
                  'open_vial_qty',
                  'is_open_vial',
                ],
                (
                  [piecePerUnit, maxReturn, openVialQty, isOpenVial],
                  schema
                ) => {
                  if (!isOpenVial) return schema.nullable()
                  const maxReturnQty = openVialQty
                    ? maxReturn - openVialQty
                    : maxReturn
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
                          (closeVialQty > 0 &&
                            closeVialQty % piecePerUnit === 0)
                        )
                      }
                    )
                    .test(
                      'close-vial-max-return',
                      () =>
                        t('transaction.validation.max_qty_vaccine', {
                          number: maxReturnQty,
                        }),
                      function (closeVialQty) {
                        if (!closeVialQty || closeVialQty <= 0) return true
                        const maxReturnQty = openVialQty
                          ? maxReturn - openVialQty
                          : maxReturn

                        return closeVialQty <= (maxReturnQty ?? 0)
                      }
                    )
                }
              ),
            broken_qty: yup
              .number()
              .optional()
              .when(
                ['change_qty', 'is_any_discard', 'is_open_vial'],
                ([changeQty, isAnyDiscard, isOpenVial], schema) => {
                  const isEmptyChangeQty = changeQty === 0 || !changeQty
                  if (isEmptyChangeQty || !isAnyDiscard || isOpenVial) {
                    return schema.nullable()
                  }
                  return schema
                    .required(t('validation.required'))
                    .min(1, t('validation.zero_quantity'))
                    .max(changeQty, t('transaction.validation.max_discard_qty'))
                }
              ),
            broken_open_vial: yup
              .number()
              .optional()
              .when(
                ['open_vial_qty', 'is_any_discard', 'is_open_vial'],
                ([openVialQty, isAnyDiscard, isOpenVial], schema) => {
                  const isEmptyOpenVialQty = openVialQty === 0 || !openVialQty
                  if (isEmptyOpenVialQty || !isAnyDiscard || !isOpenVial) {
                    return schema.nullable()
                  }
                  return schema
                    .required(t('validation.required'))
                    .min(1, t('validation.zero_quantity'))
                    .test(
                      'must-equal-open-vial',
                      () => t('transaction.validation.must_equal_open_vial'),
                      function (brokenOpenVial) {
                        return brokenOpenVial === openVialQty
                      }
                    )
                }
              ),
            broken_close_vial: yup
              .number()
              .optional()
              .when(
                ['piece_per_unit', 'close_vial_qty', 'is_open_vial'],
                ([piecePerUnit, closeVialQty, isOpenVial], schema) => {
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
                          (closeVialQty > 0 &&
                            closeVialQty % piecePerUnit === 0)
                        )
                      }
                    )
                    .test(
                      'close-vial-max-discard',
                      () => t('transaction.validation.max_discard_close_vial'),
                      function (brokenCloseVial) {
                        if (!brokenCloseVial || brokenCloseVial <= 0)
                          return true

                        return brokenCloseVial <= (closeVialQty ?? 0)
                      }
                    )
                }
              ),
            stock_quality_id: yup.number().required().nullable(),
            stock_quality: optionsSchema.required().nullable(),
            transaction_reason_id: yup
              .number()
              .required()
              .nullable()
              .when(
                ['change_qty', 'is_any_discard'],
                ([changeQty, isAnyDiscard], schema) => {
                  if (!!changeQty && isAnyDiscard) {
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
                is_purchase: yup.bool().required(),
                is_other: yup.bool().required(),
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
            price: yup.number().required().nullable(),
            year: yup.number().required().nullable(),
            budget_source_id: yup.number().required().nullable(),
            budget_source: optionsSchema.required().nullable(),
            patients: yup.array().of(
              yup.object({
                identity_type: yup.number().optional(),
                patient_id: yup.string().optional(),
                vaccine_sequence: yup.number().optional(),
                phone_number: yup.string().optional(),
              })
            ),
            created_at: yup.string().required().nullable(),
          })
        )
        .required(),
    })
    .required()
}

export type ReturnHFForm = yup.InferType<
  ReturnType<typeof ReturnHealthFacilitySchema>
>
