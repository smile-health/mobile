import { t } from 'i18next'
import * as yup from 'yup'
import { AddDisposalForm } from '@/models/disposal/CreateSelfDisposal'

// Individual disposal item schema
export const addDisposalItemSchema = yup.object({
  max_qty: yup.number(),
  disposal_stock_id: yup
    .number()
    .required(() => t('validation.required'))
    .min(1, () => t('validation.required')),
  transaction_reason_id: yup
    .number()
    .required(() => t('validation.required'))
    .min(1, () => t('validation.required')),
  transaction_reason_name: yup
    .string()
    .required(() => t('validation.required')),
  disposal_qty: yup
    .number()
    .default(0)
    .min(0)
    .test(
      'valid-disposal-qty',
      () => t('validation.zero_quantity'),
      function (disposalQty) {
        // Allow 0 (empty field) or values >= 1
        return (
          disposalQty === 0 || (disposalQty !== undefined && disposalQty >= 1)
        )
      }
    )
    .test(
      'max-available',
      () => t('disposal.validation.max_qty'),
      function (disposalQty) {
        const { max_qty = 0 } = this.parent
        if (disposalQty === 0 || disposalQty === undefined) return true
        return max_qty >= disposalQty
      }
    ),
})

// Main form schema
export const AddDisposalFormSchema = yup.object({
  discard: yup.array().of(addDisposalItemSchema).required(),
  received: yup.array().of(addDisposalItemSchema).required(),
})

// Default values for the form
export const getAddDisposalDefaultValues = (
  discardItems: Array<{
    max_qty: number
    transaction_reason_id: number
    transaction_reason_name: string
    disposal_stock_id: number
  }> = [],
  receivedItems: Array<{
    max_qty: number
    transaction_reason_id: number
    transaction_reason_name: string
    disposal_stock_id: number
  }> = []
): AddDisposalForm => ({
  discard: discardItems.map((item) => ({
    max_qty: item.max_qty,
    disposal_stock_id: item.disposal_stock_id,
    transaction_reason_id: item.transaction_reason_id,
    transaction_reason_name: item.transaction_reason_name,
    disposal_qty: 0,
  })),
  received: receivedItems.map((item) => ({
    max_qty: item.max_qty,
    disposal_stock_id: item.disposal_stock_id,
    transaction_reason_id: item.transaction_reason_id,
    transaction_reason_name: item.transaction_reason_name,
    disposal_qty: 0,
  })),
})
