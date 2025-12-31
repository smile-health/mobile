import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Reason, ReasonApiResponse } from '@/models/order/Reason'
import { TicketBatch, TicketMaterial } from '@/models/order/Ticket'
import { reasonApi } from '../apis/reason.api'
import { RootState } from '../store'

export interface TicketFormData {
  doNumber: string
  arrivalDate: string
  isSubmitted: number
  comment?: string
}

export interface TicketReasonState {
  ticketMaterials: TicketMaterial[]
  ticketFormData?: TicketFormData
  reasons: Reason[]
  lastUpdated: number | null
  ignoreConfirm: boolean
}

const initialState: TicketReasonState = {
  ticketMaterials: [],
  ticketFormData: undefined,
  reasons: [],
  lastUpdated: null,
  ignoreConfirm: false,
}

export const ticketReasonSlice = createSlice({
  name: 'ticketReason',
  initialState,
  reducers: {
    addTicketMaterial(state, action: PayloadAction<TicketMaterial>) {
      const existingIndex = state.ticketMaterials.findIndex(
        (m) => m.id === action.payload.id
      )
      if (existingIndex === -1) {
        state.ticketMaterials.push(action.payload)
      } else {
        state.ticketMaterials[existingIndex] = action.payload
      }
    },
    addBatchToTicketMaterial(
      state,
      action: PayloadAction<{ materialId: number; batch: TicketBatch }>
    ) {
      const { materialId, batch } = action.payload
      const idx = state.ticketMaterials.findIndex((m) => m.id === materialId)
      if (idx !== -1) {
        const existingBatchIdx = state.ticketMaterials[idx].batches?.findIndex(
          (b) => b.batch_code === batch.batch_code
        )

        if (existingBatchIdx !== undefined && existingBatchIdx !== -1) {
          state.ticketMaterials[idx].batches![existingBatchIdx] = batch
        } else {
          if (!state.ticketMaterials[idx].batches) {
            state.ticketMaterials[idx].batches = []
          }
          state.ticketMaterials[idx].batches!.push(batch)
        }
      }
    },
    removeBatchFromTicketMaterial(
      state,
      action: PayloadAction<{ materialId: number; batchCode: string }>
    ) {
      const { materialId, batchCode } = action.payload
      const idx = state.ticketMaterials.findIndex((m) => m.id === materialId)
      if (idx !== -1 && state.ticketMaterials[idx].batches) {
        state.ticketMaterials[idx].batches = state.ticketMaterials[
          idx
        ].batches!.filter((b) => b.batch_code !== batchCode)

        if (state.ticketMaterials[idx].batches.length > 0) {
          const totalQuantity = state.ticketMaterials[idx].batches.reduce(
            (sum, batch) => sum + (batch.qty ?? 0),
            0
          )
          state.ticketMaterials[idx].qty = totalQuantity
        } else {
          state.ticketMaterials[idx].qty = 0
        }
      }
    },
    removeTicketMaterial(state, action: PayloadAction<number>) {
      state.ticketMaterials = state.ticketMaterials.filter(
        (m) => m.id !== action.payload
      )
    },
    clearTicketMaterials(state) {
      state.ticketMaterials = []
      state.ignoreConfirm = false
    },
    setTicketFormData(state, action: PayloadAction<TicketFormData>) {
      state.ticketFormData = action.payload
    },
    clearTicketFormData(state) {
      state.ticketFormData = undefined
      state.ignoreConfirm = false
    },
    setReasons(
      state,
      {
        payload,
      }: PayloadAction<{ reasons: Reason[]; lastUpdated: number | null }>
    ) {
      state.reasons = payload.reasons
      state.lastUpdated = payload.lastUpdated
    },
    setIgnoreConfirm(state, action: PayloadAction<boolean>) {
      state.ignoreConfirm = action.payload
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      reasonApi.endpoints.getReasons.matchFulfilled,
      (state, { payload }) => {
        state.reasons = (payload as unknown as ReasonApiResponse[]).map(
          (reason) => ({
            label: reason.title ?? reason.name ?? '',
            value: String(reason.id),
            children: (reason.child || []).map((child) => ({
              label: child.title ?? child.name ?? '',
              value: String(child.id),
            })),
          })
        )
        state.lastUpdated = Date.now()
      }
    )
  },
})

export const {
  addTicketMaterial,
  addBatchToTicketMaterial,
  removeBatchFromTicketMaterial,
  removeTicketMaterial,
  clearTicketMaterials,
  setTicketFormData,
  clearTicketFormData,
  setReasons,
  setIgnoreConfirm,
} = ticketReasonSlice.actions
export const ticketReasonReducer = ticketReasonSlice.reducer

export const getTicketMaterials = (state: RootState) =>
  state.ticketReason.ticketMaterials

export const getTicketFormData = (state: RootState) =>
  state.ticketReason.ticketFormData

export const getReasons = (state: RootState) => state.ticketReason.reasons || []

export const getStoreIgnoreConfirm = (state: RootState) =>
  state.ticketReason.ignoreConfirm
