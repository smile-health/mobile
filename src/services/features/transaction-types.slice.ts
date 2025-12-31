import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { TransactionTypesResponse } from '@/models'
import { saveLocalData } from '@/storage'
import { TRANSACTION_TYPE } from '@/utils/Constants'
import { transactionTypesApi } from '../apis/transaction-types.api'
import { RootState } from '../store'

export interface TransactionTypesState {
  transactionTypes: TransactionTypesResponse[]
  lastUpdated: number | null
}

const initialState: TransactionTypesState = {
  lastUpdated: null,
  transactionTypes: [],
}

export const transactionTypesSlice = createSlice({
  name: 'transactionTypes',
  initialState,
  reducers: {
    setTransactionTypes(
      state,
      { payload }: PayloadAction<TransactionTypesState>
    ) {
      state.lastUpdated = payload.lastUpdated
      state.transactionTypes = payload.transactionTypes
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      transactionTypesApi.endpoints.getTransactionTypes.matchFulfilled,
      (state, { payload, meta: { arg } }) => {
        state.transactionTypes = payload
        state.lastUpdated = Date.now()
        saveLocalData(`transactionType-${arg.originalArgs}`, state)
      }
    )
  },
})

export const { setTransactionTypes } = transactionTypesSlice.actions
export const transactionTypesReducer = transactionTypesSlice.reducer

export const getTrxReasons = createSelector(
  [
    (state: RootState) => state.transactionTypes.transactionTypes,
    (_state, id: number) => id,
  ],
  (transactionTypes, id) => {
    const transactionType = transactionTypes.find((type) => type.id === id)
    return (
      (transactionType?.transaction_reasons || []).map((reason) => ({
        label: reason.title,
        value: reason.id,
        is_other: !!reason.is_other,
        is_purchase: !!reason.is_purchase,
      })) || []
    )
  }
)

export const getTrxTypeOption = createSelector(
  [(state: RootState) => state.transactionTypes.transactionTypes],
  (trxTypes) => {
    return trxTypes
      .filter((trxType) => trxType.id !== TRANSACTION_TYPE.TRANSFER_STOCK)
      .map((trxType) => ({
        label: trxType.title,
        value: trxType.id,
      }))
  }
)
