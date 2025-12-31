import dayjs from 'dayjs'
import { CommonObject } from '@/models/Common'
import {
  Stock,
  StockDetail,
  StockItem,
  StockMaterial,
} from '@/models/shared/Material'
import { CreateTransaction } from '@/models/transaction/TransactionCreate'
import {
  IReviewTransferStockItem,
  TransferStockMaterial,
  TransferStockPayload,
  TransferStockProgram,
} from '@/models/transaction/TransferStock'
import { DEFAULT_TRANSACTION_VALUES } from '@/screens/inventory/constant/transaction.constant'
import {
  BATCH_TYPE,
  DATE_CREATED_FORMAT,
  TIME_FORMAT,
  TRANSACTION_TYPE,
} from '@/utils/Constants'
import { convertString, getStringUTC } from '@/utils/DateFormatUtils'
import {
  TransferStockForm,
  TransferStockItemForm,
} from '../schema/CreateTransferStockSchema'

export const getAllStocks = (details: StockDetail[] = []) => {
  return details?.flatMap((detail) => detail.stocks)
}

function getBudgetSource(budgetSource: CommonObject | null) {
  if (!budgetSource?.id) return null
  return {
    value: budgetSource.id,
    label: budgetSource.name,
  }
}

export function createTransferStockItem(
  stock: Stock,
  material: StockMaterial
): TransferStockItemForm {
  const { id, name, consumption_unit_per_distribution_unit } = material
  const {
    batch,
    qty,
    available_qty,
    activity,
    price,
    total_price,
    budget_source,
  } = stock
  return {
    batch,
    qty,
    available_qty,
    activity,
    material_id: id,
    material_name: name,
    piece_per_unit: consumption_unit_per_distribution_unit,
    stock_id: stock.id,
    change_qty: null,
    created_at: null,
    budget_source: getBudgetSource(budget_source),
    price,
    total_price,
  }
}

export function createTransferStockItems(
  stocks: Stock[],
  material: StockMaterial,
  trx: CreateTransaction[]
): TransferStockItemForm[] {
  const transactionMap = new Map(trx.map((t) => [t.stock_id, t]))

  return stocks.map((stock) => {
    const existingTransaction = transactionMap.get(stock.id)
    return existingTransaction
      ? { ...stock, ...existingTransaction }
      : createTransferStockItem(stock, material)
  })
}

export function getFormItemsValue(
  material: StockItem,
  transactions: CreateTransaction[]
) {
  const allStocks = getAllStocks(material.details)
  const formItems = createTransferStockItems(
    allStocks,
    material.material,
    transactions
  )

  const isBatch = !!material.material.is_managed_in_batch

  const itemsValues: TransferStockForm['items'] = {
    activeBatch: [],
    expiredBatch: [],
  }
  const currentDate = dayjs()

  for (const stock of formItems) {
    const isExpired = stock.batch?.expired_date
      ? !dayjs(stock.batch?.expired_date).isAfter(currentDate, 'day')
      : false

    const batchType =
      isExpired && isBatch ? BATCH_TYPE.EXPIRED : BATCH_TYPE.ACTIVE
    itemsValues[batchType].push(stock)
  }
  const selectedTrx = transactions.find(
    (t) => t.material_id === material.material.id
  )
  return {
    destination_activity: selectedTrx?.destination_activity,
    destination_activity_id: selectedTrx?.destination_activity?.value,
    items: itemsValues,
  }
}

export function getValidTransferStock(
  data: TransferStockForm
): CreateTransaction[] {
  const { activeBatch, expiredBatch } = data.items
  const validItems = [...activeBatch, ...expiredBatch].filter(
    (i) => i.change_qty && i.change_qty > 0
  )
  const createdAt = getStringUTC(DATE_CREATED_FORMAT)
  const baseTransaction = {
    ...DEFAULT_TRANSACTION_VALUES,
    destination_activity: data.destination_activity,
    is_open_vial: false,
    is_temperature_sensitive: false,
    unit: '',
  }

  return validItems.map((item) => ({
    ...baseTransaction,
    ...item,
    created_at: createdAt,
    change_qty: item.change_qty ?? 0,
  }))
}

export function getHeaderMaterialProps(data: StockItem) {
  const { material, aggregate } = data
  const {
    max,
    min,
    total_qty,
    updated_at,
    total_allocated_qty,
    total_available_qty,
  } = aggregate ?? {}

  return {
    name: material.name,
    updatedAt: updated_at ?? '',
    qty: total_qty ?? 0,
    min: min ?? 0,
    max: max ?? 0,
    available: total_available_qty ?? 0,
    allocated: total_allocated_qty ?? 0,
  }
}

export function createTransferStockPayload(
  trx: CreateTransaction[],
  entityId?: number,
  programId?: number
): TransferStockPayload {
  const materials: TransferStockMaterial[] = trx.map((t) => ({
    material_id: t.material_id,
    stock_id: t.stock_id ?? 0,
    companion_activity_id: t.destination_activity?.value ?? 0,
    qty: t.change_qty,
  }))

  return {
    entity_id: entityId ?? 0,
    companion_program_id: programId ?? 0,
    materials,
  }
}

export function createReviewItems(
  trx: CreateTransaction[],
  program?: TransferStockProgram
) {
  const trxMaterialMap = trx.reduce(
    (acc, trx) => {
      if (!acc[trx.material_id]) {
        acc[trx.material_id] = []
      }

      acc[trx.material_id].push({
        ...trx,
        transactionTypeId: TRANSACTION_TYPE.TRANSFER_STOCK,
        program_name: program?.name ?? '',
        patients: [],
      })
      return acc
    },
    {} as Record<number, IReviewTransferStockItem[]>
  )

  return Object.entries(trxMaterialMap).map(([materialId, items]) => {
    return {
      materialId,
      createdAt: convertString(items[0]?.created_at, TIME_FORMAT) ?? '',
      materialName: items[0]?.material_name ?? '',
      items,
    }
  })
}
