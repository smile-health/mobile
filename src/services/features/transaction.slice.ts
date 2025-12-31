import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Activity, BaseEntity } from '@/models'
import { StockItem } from '@/models/shared/Material'
import {
  CreateTransaction,
  ReviewTransaction,
  ReviewTransactionStock,
  TransactionDetail,
  TrxReasonOption,
} from '@/models/transaction/TransactionCreate'
import { TransferStockProgram } from '@/models/transaction/TransferStock'
import { getVaccineSequenceName } from '@/screens/inventory/helpers/TransactionHelpers'
import { removeLocalData, saveLocalData } from '@/storage'
import { getTrxDraftStorageKey } from '@/utils/Constants'
import { getLevel3Materials } from '@/utils/helpers/material/commonHelper'
import { RootState } from '../store'

export interface TransactionState {
  draftTrxTypeId?: number
  customer?: BaseEntity
  program?: TransferStockProgram
  activity: Activity
  trxMaterial: StockItem
  trxMaterials: StockItem[]
  transactions: CreateTransaction[]
}

const initialState: TransactionState = {
  activity: {} as Activity,
  trxMaterial: {} as StockItem,
  trxMaterials: [],
  transactions: [],
}

export const transactionSlice = createSlice({
  name: 'transaction',
  initialState,
  reducers: {
    setProgram: (
      state,
      { payload }: PayloadAction<TransactionState['program']>
    ) => {
      state.program = payload
    },
    setCustomer: (
      state,
      { payload }: PayloadAction<BaseEntity | undefined>
    ) => {
      state.customer = payload
    },
    setActivity: (state, { payload }: PayloadAction<Activity>) => {
      state.activity = payload
    },
    setMaterial: (state, { payload }: PayloadAction<StockItem>) => {
      state.trxMaterial = payload
    },
    setMaterials: (state, { payload }: PayloadAction<StockItem[]>) => {
      state.trxMaterials = payload
    },
    setExistingTrx: (state, { payload }: PayloadAction<TransactionDetail>) => {
      state.draftTrxTypeId = payload.transactionTypeId
      state.activity = payload.activity
      state.customer = payload.customer
      state.program = payload.program
      state.transactions = payload.transactions
    },
    setTransactionReason: (
      state,
      {
        payload,
      }: PayloadAction<{ trx: CreateTransaction; trxReason: TrxReasonOption }>
    ) => {
      const { trx, trxReason } = payload
      const index = state.transactions.findIndex(
        (t) => t.stock_id === trx.stock_id
      )

      if (index > -1) {
        state.transactions[index] = {
          ...state.transactions[index],
          transaction_reason_id: trxReason.value,
          transaction_reason: trxReason,
        }
      }
    },
    setTransaction: (
      state,
      action: PayloadAction<{
        trxTypeId: number
        transactions: CreateTransaction[]
        programId: number
      }>
    ) => {
      const { trxTypeId, transactions, programId } = action.payload
      const currentTransaction = [...state.transactions].filter(
        (t) => t.material_id !== state.trxMaterial.material.id
      )
      const allTransaction = [...currentTransaction, ...transactions]
      state.transactions = allTransaction
      if (allTransaction.length > 0) {
        state.draftTrxTypeId = trxTypeId
        saveLocalData(getTrxDraftStorageKey(programId), {
          transactionTypeId: trxTypeId,
          activity: state.activity,
          customer: state.customer,
          program: state.program,
          transactions: state.transactions,
        })
      } else {
        state.draftTrxTypeId = undefined
        removeLocalData(getTrxDraftStorageKey(programId))
      }
    },
    deleteTransaction: (
      state,
      action: PayloadAction<{
        transaction: ReviewTransactionStock
        programId: number
      }>
    ) => {
      const { transaction, programId } = action.payload

      state.transactions = state.transactions.filter(
        (t) =>
          !(
            t.stock_id === transaction.stock_id &&
            t.material_id === transaction.material_id &&
            t.batch?.code === transaction.batch?.code &&
            t.batch?.id === transaction.batch?.id
          )
      )

      saveLocalData(getTrxDraftStorageKey(programId), {
        transactionTypeId: transaction.transactionTypeId,
        activity: state.activity,
        customer: state.customer,
        transactions: state.transactions,
      })
    },
    clearTrxState: (state) => {
      state.draftTrxTypeId = undefined
      state.customer = undefined
      state.activity = {} as Activity
      state.trxMaterial = {} as StockItem
      state.trxMaterials = []
      state.transactions = []
    },
    clearTransaction: (
      state,
      { payload }: PayloadAction<{ programId: number }>
    ) => {
      state.draftTrxTypeId = undefined
      state.transactions = []
      removeLocalData(getTrxDraftStorageKey(payload.programId))
    },
  },
})

export const {
  setProgram,
  setActivity,
  setCustomer,
  setMaterial,
  setMaterials,
  setExistingTrx,
  setTransactionReason,
  setTransaction,
  deleteTransaction,
  clearTrxState,
  clearTransaction,
} = transactionSlice.actions
export const transactionReducer = transactionSlice.reducer

export const getReviewTrxItems = createSelector(
  [
    (state: RootState) => state.transactionTypes.transactionTypes,
    (state: RootState) => state.transaction,
    (state: RootState) => state.materials.materials,
    (state: RootState) => state.vaccineSequence,
    (_state, trxTypeId?: number) => trxTypeId,
  ],
  (trxTypes, trxState, materials, vaccineSequence, trxTypeId) => {
    if (!trxTypeId) return []
    const groupedTrx = trxState.transactions.reduce(
      (acc, trx) => {
        if (!acc[trx.material_id]) {
          acc[trx.material_id] = []
        }
        const { rabiesSequences } = vaccineSequence
        const vaccineType = rabiesSequences.find(
          (vt) => vt.id === trx.vaccine_type_id
        )
        const vaccineMethod = vaccineType?.methods.find(
          (vm) => vm.id === trx.vaccine_method_id
        )

        const patients = trx.patients?.map((patient) => ({
          ...patient,
          vaccineSequenceName: getVaccineSequenceName(
            vaccineMethod?.sequences,
            patient.vaccine_sequence
          ),
        }))

        acc[trx.material_id].push({
          ...trx,
          customer: trxState.customer,
          transactionTypeId: trxTypeId,
          vaccineTypeName: vaccineType?.title,
          vaccineMethodName: vaccineMethod?.title,
          patients,
        })
        return acc
      },
      {} as Record<number, ReviewTransactionStock[]>
    )

    return Object.entries(groupedTrx).map(([materialId, stocks]) => {
      const level3Materials = getLevel3Materials(materials)
      const material = level3Materials.find((m) => m.id === Number(materialId))
      const transactionTypes = trxTypes.find((tt) => tt.id === trxTypeId)

      return {
        materialName: material?.name ?? '',
        activityName: trxState.activity.name ?? '',
        transactionName: transactionTypes?.title ?? '',
        totalQty: stocks.reduce(
          (sum, stock) => sum + (stock.change_qty ?? 0),
          0
        ),
        stocks: stocks,
      } as ReviewTransaction
    })
  }
)
