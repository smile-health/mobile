import {
  DiscardMaterial,
  TransactionDiscardPayload,
} from '@/models/transaction/Discard'
import { TransactionSubmitHandler } from '@/models/transaction/TransactionSubmit'
import { useCreateTrxDiscardMutation } from '@/services/apis/transaction.api'
import { TRANSACTION_TYPE } from '@/utils/Constants'

export default function useSubmitDiscard() {
  const [createDiscardTransaction, { isLoading }] =
    useCreateTrxDiscardMutation()

  const submitDiscard: TransactionSubmitHandler = (
    program,
    transactions,
    activity
  ) => {
    const materials: DiscardMaterial[] = transactions.map((trx) => ({
      material_id: trx.material_id,
      other_reason: trx?.other_reason,
      ...(trx.is_open_vial
        ? { open_vial: trx.open_vial_qty, close_vial: trx.close_vial_qty }
        : { qty: trx.change_qty }),
      stock_id: trx?.stock_id ?? 0,
      stock_quality_id: trx?.stock_quality_id,
      transaction_reason_id: trx?.transaction_reason_id ?? 0,
      transaction_type_id: TRANSACTION_TYPE.DISCARDS,
    }))

    const payload: TransactionDiscardPayload = {
      activity_id: activity.id,
      entity_id: program.entity_id,
      entity_activity_id: activity.entity_activity_id,
      materials,
    }

    return createDiscardTransaction(payload).unwrap()
  }

  return {
    submitDiscard,
    isLoadingDiscard: isLoading,
  }
}
