import { t } from 'i18next'
import * as yup from 'yup'

export const TicketBatchSchema = yup.object().shape({
  batch_code: yup.string().required(t('ticket_batch.batch_code_required')),
  expired_date: yup.string().required(t('ticket_batch.expired_date_required')),
  qty: yup
    .number()
    .typeError(t('ticket_batch.quantity_type_error'))
    .required(t('ticket_batch.quantity_required'))
    .min(1, t('ticket_batch.quantity_min')),
  reason: yup.string().required(t('ticket_batch.reason_required')),
  detail_reason: yup
    .string()
    .required(t('ticket_batch.detail_reason_required')),
})
