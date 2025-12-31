import { t } from 'i18next'
import { AppStackParamList } from '@/navigators'
import { TRANSACTION_TYPE } from '@/utils/Constants'

export const TRANSACTION_LABEL_KEYS = {
  ADD_STOCK: 'add_stock',
  REDUCE_STOCK: 'reduce_stock',
  DISCARDS: 'discard',
  CONSUMPTION: 'consumption',
  RETURN: 'return',
  CANCEL_DISCARDS: 'cancel_discard',
} as const

export type TransactionLabelType =
  (typeof TRANSACTION_LABEL_KEYS)[keyof typeof TRANSACTION_LABEL_KEYS]

export const transactionLabels = {
  [TRANSACTION_TYPE.ADD_STOCK]: TRANSACTION_LABEL_KEYS.ADD_STOCK,
  [TRANSACTION_TYPE.REDUCE_STOCK]: TRANSACTION_LABEL_KEYS.REDUCE_STOCK,
  [TRANSACTION_TYPE.DISCARDS]: TRANSACTION_LABEL_KEYS.DISCARDS,
  [TRANSACTION_TYPE.CONSUMPTION]: TRANSACTION_LABEL_KEYS.CONSUMPTION,
  [TRANSACTION_TYPE.RETURN]: TRANSACTION_LABEL_KEYS.RETURN,
  [TRANSACTION_TYPE.CANCEL_DISCARDS]: TRANSACTION_LABEL_KEYS.CANCEL_DISCARDS,
}

export const BATCH_TYPE = {
  ACTIVE: 'activeBatch',
  EXPIRED: 'expiredBatch',
} as const

export const STOCK_QUERY_TYPE = {
  STOCKS: 'stocks',
  CONSUMPTION: 'consumption',
} as const

export const VACCINE_METHOD = {
  INTRA_MUSCULAR: 1,
  INTRA_DERMAL: 2,
}

export const IDENTITY_TYPE = {
  NIK: 1,
  NON_NIK: 2,
} as const

export const identityTypeNames = {
  [IDENTITY_TYPE.NIK]: 'transaction.identity_type.nik',
  [IDENTITY_TYPE.NON_NIK]: 'transaction.identity_type.non_nik',
}

export const identityTypeOption = () => [
  { label: t('transaction.identity_type.nik'), value: 1 },
  { label: t('transaction.identity_type.non_nik'), value: 2 },
]

type StockQuerytype = (typeof STOCK_QUERY_TYPE)[keyof typeof STOCK_QUERY_TYPE]

interface TransactionConfig {
  destination: keyof AppStackParamList
  batchDestination?: keyof AppStackParamList
  queryType: StockQuerytype
}

export const TRANSACTION_CONFIG: Record<string, TransactionConfig> = {
  [TRANSACTION_TYPE.ADD_STOCK]: {
    destination: 'TransactionAddStock',
    batchDestination: 'TransactionAddStockBatch',
    queryType: STOCK_QUERY_TYPE.STOCKS,
  },
  [TRANSACTION_TYPE.REDUCE_STOCK]: {
    destination: 'TransactionReduceStock',
    batchDestination: 'TransactionReduceStockBatch',
    queryType: STOCK_QUERY_TYPE.STOCKS,
  },
  [TRANSACTION_TYPE.DISCARDS]: {
    destination: 'TransactionDiscard',
    batchDestination: 'TransactionDiscardBatch',
    queryType: STOCK_QUERY_TYPE.STOCKS,
  },
  [TRANSACTION_TYPE.CONSUMPTION]: {
    destination: 'TransactionConsumption',
    batchDestination: 'TransactionConsumptionBatch',
    queryType: STOCK_QUERY_TYPE.STOCKS,
  },
  [TRANSACTION_TYPE.RETURN]: {
    destination: 'TransactionReturnHF',
    queryType: STOCK_QUERY_TYPE.STOCKS,
  },
  [TRANSACTION_TYPE.CANCEL_DISCARDS]: {
    destination: 'TransactionCancelDiscard',
    queryType: STOCK_QUERY_TYPE.STOCKS,
  },
}

export const DEFAULT_TRANSACTION_VALUES = {
  allocated_qty: 0,
  available_qty: 0,
  max_open_vial_qty: 0,
  qty: 0,
  max: 0,
  min: 0,
  updated_at: '',
  stock_id: null,
  other_reason: null,
  change_qty: 0,
  open_vial_qty: 0,
  close_vial_qty: 0,
  transaction_reason_id: null,
  transaction_reason: null,
  stock_quality_id: null,
  stock_quality: null,
  price: null,
  year: null,
  budget_source_id: null,
  budget_source: null,
  created_at: null,
} as const
