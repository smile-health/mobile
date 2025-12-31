import { Stock, StockDetail, StockItem } from '@/models/shared/Material'
import {
  CreateTransaction,
  CreateTransactionForm,
  CreateTransactionStock,
  PatientIDMap,
} from '@/models/transaction/TransactionCreate'
import { createTransactionStock, getDefaultValue } from './TransactionHelpers'
import { IDENTITY_TYPE } from '../constant/transaction.constant'

export function setAdditionalFormValue(
  currentData: CreateTransactionStock[],
  additionalData: Stock[],
  transactions: CreateTransaction[],
  stockItem: StockItem,
  isOpenVial: boolean,
  cb: (values: CreateTransactionForm) => void
) {
  const additionalActivityStock = createTransactionStock(
    additionalData,
    transactions,
    stockItem.material,
    stockItem.protocol,
    isOpenVial
  )

  const formValues = getDefaultValue([
    ...currentData,
    ...additionalActivityStock,
  ])

  cb(formValues)
}

export function getTrxStockWithOtherActivityStock(
  stockItem: StockItem,
  transactions: CreateTransaction[],
  stockDetails: StockDetail[],
  activityId: number,
  isOpenVial: boolean
) {
  const { material, details, protocol } = stockItem
  const defaultStocks = details[0]?.stocks ?? []
  const materialTransactions = transactions.filter(
    (tx) => tx.material_id === material.id && tx.activity?.id !== activityId
  )
  const trxActivityIds = new Set(
    materialTransactions.map((tx) => tx.activity?.id).filter(Boolean)
  )

  let stocks: Stock[] = defaultStocks
  if (materialTransactions.length > 0) {
    for (const sd of stockDetails) {
      if (sd.activity && trxActivityIds.has(sd.activity.id)) {
        stocks = [...stocks, ...sd.stocks]
      }
    }
  }
  return createTransactionStock(
    stocks,
    transactions,
    material,
    protocol,
    isOpenVial
  )
}

export function extractPatientIds(
  transactions: CreateTransaction[]
): PatientIDMap {
  const result = { nik: new Set<string>(), non_nik: new Set<string>() }

  if (transactions.length === 0) {
    return { nik: [], non_nik: [] }
  }

  for (const transaction of transactions) {
    if (transaction.patients)
      for (const patient of transaction.patients) {
        if (!patient.patient_id) continue
        const isNIK = patient.identity_type === IDENTITY_TYPE.NIK

        const category = isNIK ? 'nik' : 'non_nik'
        result[category].add(patient.patient_id)
      }
  }

  return {
    nik: [...result.nik],
    non_nik: [...result.non_nik],
  }
}
