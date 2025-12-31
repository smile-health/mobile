import { TransactionDiscard } from '@/models/transaction/Transaction'
import { CreateTransaction } from '@/models/transaction/TransactionCreate'
import { generateTrxBatch } from './TransactionHelpers'

const createStockQuality = (
  stockQuality: { id: number; label: string } | null
) => {
  if (!stockQuality?.id) return null

  return {
    value: stockQuality.id,
    label: stockQuality.label ?? '',
  }
}

export function trxDiscardToCreateTransaction(
  trx: TransactionDiscard
): CreateTransaction {
  const {
    activity,
    stock: { batch, stock_quality },
  } = trx
  return {
    transaction_ids: [trx.id],
    stock_id: trx.stock_id,
    material_id: trx.material_id,
    other_reason: trx.other_reason,
    change_qty: trx.change_qty,
    open_vial_qty: 0,
    close_vial_qty: 0,
    transaction_reason_id: null,
    transaction_reason: null,
    stock_quality_id: stock_quality?.id ?? null,
    stock_quality: createStockQuality(stock_quality),
    price: trx.transaction_purchase?.price ?? null,
    year: trx.transaction_purchase?.year ?? null,
    budget_source_id: null,
    budget_source: null,
    batch: generateTrxBatch(batch),
    created_at: trx.created_at,
    is_temperature_sensitive: false,
    is_open_vial: false,
    piece_per_unit: 1,
    unit: '',
    activity,
  }
}

export const updateExistingTransaction = (
  trx: CreateTransaction,
  item: TransactionDiscard,
  isRemoving: boolean
): CreateTransaction => {
  const currentIds = trx.transaction_ids ?? []

  return {
    ...trx,
    transaction_ids: isRemoving
      ? currentIds.filter((id) => id !== item.id)
      : [...currentIds, item.id],
    change_qty: isRemoving
      ? trx.change_qty - item.change_qty
      : trx.change_qty + item.change_qty,
  }
}

export const updateSelectedTransactions = (
  selectedTrx: CreateTransaction[],
  updatedTrx: CreateTransaction,
  isEmptyIds: boolean
): CreateTransaction[] => {
  if (isEmptyIds) {
    return selectedTrx.filter((t) => t.stock_id !== updatedTrx.stock_id)
  }

  return selectedTrx.map((t) =>
    t.stock_id === updatedTrx.stock_id ? updatedTrx : t
  )
}
