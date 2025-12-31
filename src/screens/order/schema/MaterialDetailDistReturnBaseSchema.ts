import { t } from 'i18next'
import * as yup from 'yup'
import { QuantityByStockForm } from '../types/order'

export const materialDetailDistReturnBaseSchema = (
  batchCodes: string[],
  unit = 1
): yup.ObjectSchema<QuantityByStockForm> => {
  const shape = Object.fromEntries(
    batchCodes.map((code) => [
      code,
      yup
        .number()
        .typeError(t('validation.required'))
        .required(t('validation.required'))
        .min(1, t('validation.zero_quantity'))
        .test(
          'multiple',
          t('transaction.validation.multiply_qty', { number: unit }),
          (val) => {
            if (!val || unit <= 1) return true
            return val % unit === 0
          }
        ),
    ])
  )

  return yup.object({
    quantityByStock: yup.object().shape(shape).required(),
    resultPayload: yup
      .array()
      .of(
        yup.object({
          activity_id: yup.number().required(),
          allocated: yup.number().required(),
          available: yup.number().required(),
          batch_id: yup.number().required(),
          batch: yup
            .object({
              id: yup.number().required(),
              code: yup.string().required(),
              expired_date: yup.string().required(),
              production_date: yup.string().required(),
              manufacture_id: yup.number().required(),
              manufacture: yup
                .object({
                  id: yup.number().required(),
                  name: yup.string().required(),
                  address: yup.string().nullable(),
                  description: yup.string().nullable(),
                })
                .required(),
            })
            .required(),
          budget_source: yup.object().required(),
          budget_source_id: yup.number().nullable(),
          created_at: yup.string().required(),
          created_by: yup.string().required(),
          in_transit: yup.number().required(),
          material_id: yup.number().required(),
          open_vial: yup.number().required(),
          price: yup.number().required(),
          qty: yup.number().required(),
          stock_id: yup.number().required(),
          total_price: yup.number().required(),
          updated_at: yup.string().required(),
          updated_by: yup.string().required(),
          year: yup.number().nullable(),
        })
      )
      .required(),
  }) as yup.ObjectSchema<QuantityByStockForm>
}
