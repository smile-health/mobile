import { t } from 'i18next'

import * as yup from 'yup'

export const OrderEditItemSchema = (
  available_stock,
  consumption_unit_per_distribution_unit = 1
) =>
  yup.object().shape({
    qty: yup
      .number()
      .transform((value, originalValue) =>
        String(originalValue).trim() === '' ? undefined : value
      )
      .required(t('validation.required'))
      .test(
        'max-available',
        () => t('transaction.validation.max_qty'),
        (change_qty) => {
          if (!change_qty || !available_stock) return true
          return change_qty <= available_stock
        }
      )
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

    children: yup.array().of(
      yup.object().shape({
        id: yup.string().required(),
        confirmed_qty: yup
          .number()
          .transform((value, originalValue) =>
            String(originalValue).trim() === '' ? undefined : value
          )
          .required(t('validation.required'))
          .test(
            'max-available',
            () => t('transaction.validation.max_qty'),
            (change_qty) => {
              if (!change_qty || !available_stock) return true
              return change_qty <= available_stock
            }
          ),
      })
    ),
    reason: yup.string().required(t('validation.required')),
    other_reason_text: yup.string(),
  })
