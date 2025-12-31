import { t } from 'i18next'
import * as yup from 'yup'

export const TicketNonBatchSchema = yup.object().shape({
  qty: yup
    .number()
    .typeError(t('ticket_batch.quantity_type_error'))
    .required(t('ticket_batch.quantity_required'))
    .min(1, t('ticket_batch.quantity_min')),
})
