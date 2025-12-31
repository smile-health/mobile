import { t } from 'i18next'
import * as yup from 'yup'

export const AddMaterialSchema = yup.object().shape({
  materialName: yup.string().required(t('validation.material_name_required')),

  isBatch: yup.number().required(t('validation.batch_status_required')),

  qty: yup
    .number()
    .typeError(t('ticket_batch.quantity_type_error'))
    .when(['isBatch'], ([isBatch], schema) =>
      isBatch === 0
        ? schema
            .required(t('ticket_batch.quantity_required'))
            .min(1, t('ticket_batch.quantity_min'))
        : schema.notRequired().nullable()
    ),

  reason: yup
    .string()
    .when(['isBatch'], ([isBatch], schema) =>
      isBatch === 0
        ? schema.required(t('ticket_batch.reason_required'))
        : schema.notRequired()
    ),
  detail_reason: yup
    .string()
    .when(['isBatch'], ([isBatch], schema) =>
      isBatch === 0
        ? schema.required(t('ticket_batch.detail_reason_required'))
        : schema.notRequired()
    ),
})
