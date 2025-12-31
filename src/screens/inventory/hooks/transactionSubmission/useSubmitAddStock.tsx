import {
  AddStockMaterial,
  TransactionAddStockPayload,
} from '@/models/transaction/AddStock'
import { TransactionSubmitHandler } from '@/models/transaction/TransactionSubmit'
import { useCreateTrxAddStockMutation } from '@/services/apis/transaction.api'

export default function useSubmitAddStock() {
  const [createAddStockTransaction, { isLoading }] =
    useCreateTrxAddStockMutation()

  const submitAddStock: TransactionSubmitHandler = async (
    program,
    transactions,
    activity
  ) => {
    const materials: AddStockMaterial[] = transactions.map((trx) => ({
      batch:
        trx.batch && !trx.stock_id
          ? {
              code: trx.batch.code,
              expired_date: trx.batch.expired_date,
              manufacture_id: trx.batch.manufacture.id,
              production_date: trx.batch.production_date,
            }
          : null,
      budget_source_id: trx?.budget_source_id ?? 0,
      material_id: trx.material_id,
      other_reason: trx?.other_reason ?? null,
      price: trx?.price ? trx.price / trx.change_qty : null,
      qty: trx.change_qty,
      stock_id: trx?.stock_id,
      stock_quality_id: trx?.stock_quality_id ?? null,
      transaction_reason_id: trx?.transaction_reason_id ?? 0,
      year: trx.year ?? null,
    }))

    const payload: TransactionAddStockPayload = {
      activity_id: activity.id,
      entity_activity_id: activity.entity_activity_id,
      entity_id: program.entity_id,
      materials,
    }

    return createAddStockTransaction(payload).unwrap()
  }

  return {
    submitAddStock,
    isLoadingAddStock: isLoading,
  }
}
