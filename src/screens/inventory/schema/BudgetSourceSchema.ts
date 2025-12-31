import { t } from 'i18next'
import * as yup from 'yup'

export const BudgetSourceSchema = () =>
  yup.object().shape({
    is_purchase: yup.boolean(),
    change_qty: yup.number().required(),
    unit: yup.string().required(),
    budget_source_id: yup
      .number()
      .nullable()
      .when(['is_purchase'], ([isPurchase], schema) => {
        if (!isPurchase) return schema.nullable()
        return schema.required(t('validation.required'))
      }),
    budget_source: yup
      .object({
        label: yup.string().required(),
        value: yup.number().required(),
      })
      .nullable(),
    year: yup
      .number()
      .nullable()
      .when(['is_purchase'], ([isPurchase], schema) => {
        if (!isPurchase) return schema.nullable()
        return schema.required(t('validation.required'))
      }),
    price: yup
      .number()
      .nullable()
      .when(['is_purchase'], ([isPurchase], schema) => {
        if (!isPurchase) return schema.nullable()
        return schema
          .required(t('validation.required'))
          .min(1, t('validation.zero_quantity'))
      }),
  })

export type BudgetSourceForm = yup.InferType<
  ReturnType<typeof BudgetSourceSchema>
>
