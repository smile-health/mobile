import { useState } from 'react'
import { useLanguage } from '@/i18n/useLanguage'
import {
  ReturnHFTransaction,
  TransactionReturnHFPayload,
} from '@/models/transaction/ReturnHealthFacility'
import { TransactionSubmitHandler } from '@/models/transaction/TransactionSubmit'
import { useCreateTrxReturnHFMutation } from '@/services/apis/transaction.api'

export default function useSubmitReturnHF() {
  const [createReturnHFTransaction, { isLoading }] =
    useCreateTrxReturnHFMutation()
  const [actualReturnDate, setActualReturnDate] = useState('')

  const { t } = useLanguage()

  const submitReturnHF: TransactionSubmitHandler = (
    program,
    transactions,
    activity,
    customer
  ) => {
    if (!customer || !actualReturnDate) {
      throw new Error(
        t('error.actual_date_required', {
          type: t('label.actual_date_return'),
        })
      )
    }
    const returnHFtransactions: ReturnHFTransaction[] = transactions.map(
      (trx) => ({
        stock_id: trx.stock_id,
        ...(trx.is_open_vial
          ? {
              open_vial: trx.open_vial_qty,
              close_vial: trx.close_vial_qty,
              broken_open_vial: trx.broken_open_vial,
              broken_close_vial: trx.broken_close_vial,
            }
          : { qty: trx.change_qty, broken_qty: trx.broken_qty }),
        transaction_reason_id: trx.transaction_reason_id ?? undefined,
        transaction_id: trx.transaction_id,
        other_reason: trx.other_reason ?? undefined,
      })
    )

    const payload: TransactionReturnHFPayload = {
      activity_id: activity.id,
      entity_id: program.entity_id,
      entity_activity_id: activity.entity_activity_id,
      customer_id: customer.id,
      actual_transaction_date: actualReturnDate,
      transactions: returnHFtransactions,
    }

    return createReturnHFTransaction(payload).unwrap()
  }

  return {
    actualReturnDate,
    submitReturnHF,
    setActualReturnDate,
    isLoadingReturnHF: isLoading,
  }
}
