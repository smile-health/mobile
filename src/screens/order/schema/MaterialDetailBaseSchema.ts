/* eslint-disable unicorn/no-thenable */
import { t } from 'i18next'
import * as yup from 'yup'

export const materialDetailBaseSchema = (
  consumption_unit_per_distribution_unit = 1
) =>
  yup.object().shape({
    quantity: yup
      .number()
      .transform((value, originalValue) =>
        originalValue === '' ? undefined : value
      )
      .required(t('validation.required'))
      .min(1, () => t('validation.zero_quantity'))
      .test(
        'multiple',
        () =>
          t('transaction.validation.multiply_qty', {
            number: consumption_unit_per_distribution_unit,
          }),
        (change_qty) => {
          if (!change_qty || consumption_unit_per_distribution_unit <= 1)
            return true
          return change_qty % consumption_unit_per_distribution_unit === 0
        }
      ),
    reason: yup.string().required(t('validation.required')),
    other_reason: yup.string().when('reason', {
      is: 9,
      then: (schema) => schema.required(t('validation.required')),
      otherwise: (schema) => schema.nullable(),
    }),
  })
