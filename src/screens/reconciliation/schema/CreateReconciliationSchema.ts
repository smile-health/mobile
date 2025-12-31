import { t } from 'i18next'
import * as yup from 'yup'

type ActionReasonListType = {
  reason_id?: number | null
  reason_title?: string
  action_id?: number | null
  action_title?: string
}[]

const isQtyDifferent = (recorded_qty: number, actual_qty: number | null) => {
  return (
    recorded_qty !== actual_qty &&
    actual_qty !== null &&
    actual_qty !== undefined
  )
}

const getRootValues = (context: any) => {
  const from = context.from
  return from && from.length > 1 ? from[1].value : null
}

const isValuePresent = (value: any) => {
  return value !== undefined && value !== null
}

// Validation functions
const validateReasonOrActionRequired: yup.TestFunction<
  number | null | undefined,
  yup.AnyObject
> = function (value) {
  const rootValues = getRootValues(this)
  if (!rootValues) return true

  const { recorded_qty, actual_qty } = rootValues
  const haveValue = isValuePresent(value)
  const differentActual = isQtyDifferent(recorded_qty, actual_qty)

  return haveValue && differentActual
}

const validateNoDuplicates = function (value: any[] | undefined) {
  if (!value || value.length === 0) return true

  const combinations = value.map(
    (item) => `${item.reason_title}-${item.action_title}`
  )
  const uniqueCombinations = new Set(combinations)
  return combinations.length === uniqueCombinations.size
}

const validateRequiredWhenQtyDifferent: yup.TestFunction<
  ActionReasonListType | undefined,
  yup.AnyObject
> = function (value) {
  const { recorded_qty, actual_qty } = this.parent

  // If quantities are different, action_reasons is required
  if (isQtyDifferent(recorded_qty, actual_qty)) {
    return value && value.length > 0
  }
  return true
}

export const ReconciliationFormItemSchema = yup.object({
  reconciliation_category: yup.number().required(),
  reconciliation_category_label: yup.string().required(),
  recorded_qty: yup.number().required(),
  actual_qty: yup
    .number()
    .nullable()
    .test(
      'actual_qty_required',
      () => t('validation.required'),
      function (value) {
        const { reconciliation_category } = this.parent

        if (reconciliation_category) {
          return value !== null && value !== undefined
        }
        return true
      }
    ),
  action_reasons: yup
    .array()
    .of(
      yup.object({
        reason_id: yup
          .number()
          .nullable()
          .test(
            'required',
            () => t('validation.required'),
            validateReasonOrActionRequired
          ),
        reason_title: yup.string().optional(),
        action_id: yup
          .number()
          .nullable()
          .test(
            'required',
            () => t('validation.required'),
            validateReasonOrActionRequired
          ),
        action_title: yup.string().optional(),
      })
    )
    .test(
      'no_duplicates',
      () => t('reconciliation.validation.no_duplicate_reason_action'),
      validateNoDuplicates
    )
    .test(
      'required_when_qty_different',
      () => t('reconciliation.validation.reason_action_required'),
      validateRequiredWhenQtyDifferent
    ),
})

export const ReconciliationFormSchema = yup.object({
  entity_id: yup.number().required(),
  activity_id: yup.number().required(),
  start_date: yup.string().optional(),
  end_date: yup.string().optional(),
  material_id: yup.number().required(),
  items: yup.array().of(ReconciliationFormItemSchema).required(),
})

export type ReconciliationFormItem = yup.InferType<
  typeof ReconciliationFormItemSchema
>
export type ReconciliationForm = yup.InferType<typeof ReconciliationFormSchema>
