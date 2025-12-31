import dayjs from 'dayjs'
import { ParseKeys, TFunction } from 'i18next'
import { Path, UseFormSetValue } from 'react-hook-form'
import { ActivityProtocol } from '@/models/app-data/Materials'
import {
  Stock,
  StockBatchSection,
  StockItem,
  StockMaterial,
} from '@/models/shared/Material'
import {
  Transaction,
  TransactionStockBatch,
} from '@/models/transaction/Transaction'
import {
  CreateTransaction,
  CreateTransactionForm,
  CreateTransactionStock,
  TransactionDetail,
} from '@/models/transaction/TransactionCreate'
import { VaccineSequence } from '@/models/transaction/VaccineSequence'
import { loadLocalData } from '@/storage'
import { numberFormat } from '@/utils/CommonUtils'
import {
  DATE_CREATED_FORMAT,
  DATE_FILTER_FORMAT,
  getTrxDraftStorageKey,
  SHORT_DATE_FORMAT,
  TRANSACTION_TYPE,
} from '@/utils/Constants'
import { convertString, getStringUTC } from '@/utils/DateFormatUtils'
import {
  BATCH_TYPE,
  DEFAULT_TRANSACTION_VALUES,
  transactionLabels,
} from '../constant/transaction.constant'

export function getTrxListSection(list: Transaction[]) {
  const groupedTransactions = list.reduce(
    (acc: { [key: string]: Transaction[] }, trx) => {
      const date = convertString(trx.created_at, DATE_FILTER_FORMAT)
      acc[date] = acc[date] ? [...acc[date], trx] : [trx]
      return acc
    },
    {}
  )
  return Object.entries(groupedTransactions).map(([date, transaction]) => ({
    key: date,
    title: convertString(date, SHORT_DATE_FORMAT),
    data: transaction,
  }))
}

/**
 * Creates default transaction stock object
 */
function generateTransactionStock(
  material: StockMaterial,
  stock?: Stock,
  protocol?: ActivityProtocol,
  isOpenVial?: boolean
): CreateTransactionStock {
  const {
    is_temperature_sensitive = 0,
    consumption_unit_per_distribution_unit = 1,
    id,
    unit_of_consumption = '',
  } = material
  return {
    ...DEFAULT_TRANSACTION_VALUES,
    batch: stock?.batch ?? null,
    qty: stock?.qty ?? 0,
    allocated_qty: stock?.allocated_qty ?? 0,
    available_qty: stock?.available_qty ?? 0,
    max_open_vial_qty: stock?.open_vial_qty ?? 0,
    max: stock?.max ?? 0,
    min: stock?.min ?? 0,
    updated_at: stock?.updated_at ?? '',
    activity: stock?.activity ?? null,
    material_id: id,
    is_temperature_sensitive: !!is_temperature_sensitive,
    is_open_vial: !!isOpenVial,
    unit: unit_of_consumption,
    piece_per_unit: consumption_unit_per_distribution_unit,
    stock_id: stock?.id ?? null,
    is_need_patient: !!protocol?.is_patient_needed,
    is_sequence: !!protocol?.is_sequence,
  }
}

/**
 * Creates transaction stock array from existing stocks and transaction data
 */
export function createTransactionStock(
  stocks: Stock[],
  trx: CreateTransaction[],
  material: StockMaterial,
  protocol?: ActivityProtocol,
  isOpenVial?: boolean
): CreateTransactionStock[] {
  const isBatch = material.is_managed_in_batch
  const newBatchStock: CreateTransactionStock[] = trx
    .filter((t) => t.material_id === material.id && t.stock_id == null)
    .map((newBatchTrx) => ({
      ...DEFAULT_TRANSACTION_VALUES,
      ...newBatchTrx,
    }))
  const currentStock = stocks.map((stock) => {
    const existingTransaction = trx.find(
      (t) => t.stock_id === stock.id && t.material_id === material?.id
    )

    return existingTransaction
      ? {
          ...stock,
          max_open_vial_qty: stock.open_vial_qty,
          ...existingTransaction,
        }
      : generateTransactionStock(material, stock, protocol, isOpenVial)
  })

  const allStock = [...newBatchStock, ...currentStock]

  // For non-batch materials, ensure at least one stock exists
  if (!isBatch && allStock.length === 0) {
    allStock.push(
      generateTransactionStock(material, undefined, undefined, isOpenVial)
    )
  }

  return allStock
}

/**
 * Converts transaction stocks to batch sections for UI display
 */
export function getTrxStockSection(
  stocks: CreateTransactionForm
): StockBatchSection[] {
  return Object.entries(stocks).map(([fieldname, data]) => ({
    fieldname,
    title:
      fieldname === BATCH_TYPE.ACTIVE
        ? 'section.material_batch'
        : 'section.expired_material_batch',
    data,
  }))
}

/**
 * Separates stocks into active and expired batches
 */
export function getDefaultValue(
  stocks: CreateTransactionStock[] = [],
  isBatch: boolean = true
) {
  const defaultValues: CreateTransactionForm = {
    activeBatch: [],
    expiredBatch: [],
  }
  const currentDate = dayjs()

  for (const stock of stocks) {
    const isExpired = stock.batch?.expired_date
      ? !dayjs(stock.batch?.expired_date).isAfter(currentDate, 'day')
      : false

    const batchType =
      isExpired && isBatch ? BATCH_TYPE.EXPIRED : BATCH_TYPE.ACTIVE
    defaultValues[batchType].push(stock)
  }
  return defaultValues
}

/**
 * Transforms CreateTransactionStock to CreateTransaction
 */
export const createTransactionData = (
  stock: CreateTransactionStock
): CreateTransaction => ({
  // Basic properties
  batch: stock.batch,
  material_id: stock.material_id,
  stock_id: stock.stock_id,
  activity: stock.activity,

  // Quantity properties
  change_qty: stock.change_qty,
  open_vial_qty: stock.open_vial_qty,
  close_vial_qty: stock.close_vial_qty,
  broken_qty: stock.broken_qty,
  consumption_qty: stock.consumption_qty,

  // Unit properties
  piece_per_unit: stock.piece_per_unit,
  unit: stock.unit,

  // Budget properties
  price: stock.price,
  year: stock.year,
  budget_source_id: stock.budget_source_id,
  budget_source: stock.budget_source,

  // Quality and reason properties
  stock_quality: stock.stock_quality,
  stock_quality_id: stock.stock_quality_id,
  transaction_reason: stock.transaction_reason,
  transaction_reason_id: stock.transaction_reason_id,
  other_reason: stock.other_reason,

  // Boolean flags
  is_temperature_sensitive: stock.is_temperature_sensitive,
  is_open_vial: stock.is_open_vial,
  is_any_discard: stock.is_any_discard,
  is_need_patient: stock.is_need_patient,
  is_sequence: stock.is_sequence,

  // Vaccine properties
  vaccine_method_id: stock.vaccine_method_id,
  vaccine_type_id: stock.vaccine_type_id,
  min_qty_vaccine: stock.min_qty_vaccine,
  max_qty_vaccine: stock.max_qty_vaccine,

  // Transaction relationships
  transaction_id: stock.transaction_id,
  transaction_ids: stock.transaction_ids,
  patients: stock.patients,
  max_return: stock.max_return,

  // Timestamp
  created_at: getStringUTC(DATE_CREATED_FORMAT),
})

/**
 * Filters valid transactions (with quantities > 0)
 */
export const getValidTransaction = (
  transactionStocks: CreateTransactionStock[]
) => {
  const hasValidQuantity = (stock: CreateTransactionStock): boolean => {
    return Boolean(
      (stock.change_qty && stock.change_qty > 0) ||
        (stock.open_vial_qty && stock.open_vial_qty > 0) ||
        (stock.close_vial_qty && stock.close_vial_qty > 0)
    )
  }

  return transactionStocks
    .filter((s) => hasValidQuantity(s))
    .map((s) => createTransactionData(s))
}

/**
 * Finds the next material in the stock items array
 */
export function findNextMaterial(
  stockItems: StockItem[],
  currentItem: StockItem | null
) {
  if (!currentItem?.material?.id || !stockItems?.length) {
    return
  }
  const currentIndex = stockItems.findIndex(
    (item) => item.material.id === currentItem?.material.id
  )

  return currentIndex >= 0 && currentIndex < stockItems.length - 1
    ? stockItems[currentIndex + 1]
    : undefined
}

/**
 * Generates material transaction label with quantity
 */
export function getMaterialTrxLabel(
  transactions: CreateTransaction[],
  transactionType: number,
  materialId: number,
  t: TFunction
) {
  const totalQty = transactions
    .filter((trx) => trx.material_id === materialId)
    .reduce((total, trx) => {
      const trxQty =
        (trx.change_qty ?? 0) +
        (trx.open_vial_qty ?? 0) +
        (trx.close_vial_qty ?? 0)
      return total + trxQty
    }, 0)

  const labelKey = transactionLabels[transactionType]

  if (totalQty <= 0 || !labelKey) return

  return t(`transaction.transaction_label.${labelKey}` as ParseKeys, {
    qty: numberFormat(totalQty),
  })
}

/**
 * Loads existing transaction draft from storage
 */
export async function loadExistingTransaction(
  programId: number,
  callback?: (value: TransactionDetail) => void
) {
  try {
    const draft = await loadLocalData(getTrxDraftStorageKey(programId))

    if (draft && callback) {
      callback(draft)
    }

    return draft
  } catch (error) {
    console.error('Failed to load existing transaction:', error)
    return null
  }
}

/**
 * Updates form values for a specific field path
 */
export function updatePartialValues(
  fieldName: Path<CreateTransactionForm>,
  setValue: UseFormSetValue<CreateTransactionForm>,
  data: Partial<CreateTransactionStock>
) {
  for (const [key, value] of Object.entries(data)) {
    const fieldPath = `${fieldName}.${key}` as Path<CreateTransactionForm>
    setValue(fieldPath, value, { shouldValidate: true })
  }
}

/**
 * Extracts material card properties from stock item
 */
export const getMaterialCardProps = (
  data: StockItem,
  showMinMax: boolean = true
) => {
  const { material, details } = data
  const stockDetails = details?.[0]

  return {
    name: material.name,
    updatedAt: stockDetails?.updated_at ?? '',
    qty: stockDetails?.total_qty ?? 0,
    min: stockDetails?.min ?? 0,
    max: stockDetails?.max ?? 0,
    available: stockDetails?.total_available_qty ?? 0,
    allocated: stockDetails?.total_allocated_qty ?? 0,
    showMinMax,
  }
}

export const checkParamsChange = (currentArg, previousArg) => {
  if (!currentArg || !previousArg) return true
  const { page: currentPage, ...currentFilters } = currentArg
  const { page: prevPage, ...prevFilters } = previousArg
  const filtersChanged =
    JSON.stringify(currentFilters) !== JSON.stringify(prevFilters)
  const pageChanged = currentPage !== prevPage

  return filtersChanged || pageChanged
}

export function generateTrxBatch(batch: TransactionStockBatch | null) {
  if (!batch) return null
  return {
    ...batch,
    manufacture: {
      id: batch.manufacture?.id ?? 0,
      name: batch.manufacture?.name ?? '',
      address: batch.manufacture?.address ?? '',
    },
  }
}

export function checkDraftTransaction(
  itemTrxType?: number,
  draftTrxType?: number
) {
  const hasTrxDraft = !!itemTrxType && draftTrxType
  const isViewStock = itemTrxType === TRANSACTION_TYPE.VIEW_STOCK
  const notSameAsDraft = itemTrxType !== draftTrxType

  return hasTrxDraft && !isViewStock && notSameAsDraft
}

export function checkTrxDraftFlag(itemTrxType?: number, draftTrxType?: number) {
  return !!itemTrxType && itemTrxType === draftTrxType
}

export const getVaccineSequenceName = (
  items?: VaccineSequence[],
  value?: number
) => {
  const vaccineSequence = items?.find((i) => i.id === value)
  return vaccineSequence?.title ?? ''
}
