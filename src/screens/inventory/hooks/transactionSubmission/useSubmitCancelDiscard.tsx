import { useLanguage } from '@/i18n/useLanguage'
import {
  CancelDiscardTransaction,
  TransactionCancelDiscardPayload,
} from '@/models/transaction/CancelDiscard'
import { TransactionSubmitHandler } from '@/models/transaction/TransactionSubmit'
import { useCreateTrxCancelDiscardMutation } from '@/services/apis/transaction.api'

export default function useSubmitCancelDiscard() {
  const [createCancelDiscardTransaction, { isLoading }] =
    useCreateTrxCancelDiscardMutation()

  const { t } = useLanguage()

  const submitCancelDiscard: TransactionSubmitHandler = (
    program,
    transactions,
    activity
  ) => {
    const cancelDiscardTransactions: CancelDiscardTransaction[] =
      transactions.map((trx) => ({
        stock_id: trx.stock_id ?? 0,
        transaction_ids: trx.transaction_ids || [],
        transaction_reason_id: trx.transaction_reason_id ?? 0,
      }))

    const payload: TransactionCancelDiscardPayload = {
      activity_id: activity.id,
      entity_activity_id: activity.entity_activity_id,
      entity_id: program.entity_id,
      transactions: cancelDiscardTransactions,
    }
    const isAnyEmptyTrxReasons = cancelDiscardTransactions.some(
      (t) => !t.transaction_reason_id
    )

    if (isAnyEmptyTrxReasons) {
      throw new Error(t('error.reason_cancellation_of_discards_requested'))
    }

    return createCancelDiscardTransaction(payload).unwrap()
  }

  return {
    submitCancelDiscard,
    isLoadingCancelDiscard: isLoading,
  }
}
