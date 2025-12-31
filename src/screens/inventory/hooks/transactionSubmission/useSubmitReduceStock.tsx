import {
  ReduceStockMaterial,
  TransactionReduceStockPayload,
} from '@/models/transaction/ReduceStock'
import { TransactionSubmitHandler } from '@/models/transaction/TransactionSubmit'
import { useCreateTrxReduceStockMutation } from '@/services/apis/transaction.api'

export default function useSubmitReduceStock() {
  const [createReduceStockTransaction, { isLoading }] =
    useCreateTrxReduceStockMutation()

  const submitReduceStock: TransactionSubmitHandler = (
    program,
    transactions,
    activity
  ) => {
    const materials: ReduceStockMaterial[] = transactions.map((trx) => ({
      material_id: trx.material_id,
      other_reason: trx?.other_reason,
      qty: trx.change_qty,
      stock_id: trx?.stock_id ?? 0,
      stock_quality_id: trx?.stock_quality_id,
      transaction_reason_id: trx?.transaction_reason_id ?? 0,
    }))

    const payload: TransactionReduceStockPayload = {
      activity_id: activity.id,
      entity_activity_id: activity.entity_activity_id,
      entity_id: program.entity_id,
      materials,
    }

    return createReduceStockTransaction(payload).unwrap()
  }

  return {
    submitReduceStock,
    isLoadingReduceStock: isLoading,
  }
}
