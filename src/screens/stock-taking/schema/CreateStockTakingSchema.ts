import { t } from 'i18next'
import * as yup from 'yup'

export const StockTakingFormItemSchema = yup.object({
  stock_id: yup.number().required().nullable(),
  activity_id: yup.number().required(),
  activity_name: yup.string().required(),
  batch_code: yup.string().optional(),
  expired_date: yup.string().optional(),
  manufacture_id: yup.number().optional(),
  manufacture_name: yup.string().optional(),
  production_date: yup.string().optional(),
  in_transit_qty: yup.number().required(),
  actual_qty: yup
    .number()
    .nullable()
    .test(
      'actual_qty_required',
      () => t('validation.required'),
      function (value) {
        const { recorded_qty, in_transit_qty } = this.parent

        if (recorded_qty > 0 || in_transit_qty > 0) {
          return value !== null && value !== undefined
        }
        return true
      }
    ),
  recorded_qty: yup.number().required(),
})

export const StockTakingFormSchema = yup.object({
  entity_id: yup.number().required(),
  period_id: yup.number().required(),
  material_id: yup.number().required(),
  items: yup.array().of(StockTakingFormItemSchema).required(),
})

export type StockTakingFormItem = yup.InferType<
  typeof StockTakingFormItemSchema
>
export type StockTakingForm = yup.InferType<typeof StockTakingFormSchema>
