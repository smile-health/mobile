import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { OrderAllocateItem } from '@/models/order/OrderItem'

export interface AllocateState {
  allocatedDraft: OrderAllocateItem[]
  allocatedOrderItem: any
}

const initialState: AllocateState = {
  allocatedDraft: [],
  allocatedOrderItem: {},
}

export const allocateSlice = createSlice({
  name: 'allocate',
  initialState,
  reducers: {
    setAllocatedDraft(state, action: PayloadAction<OrderAllocateItem>) {
      const index = state.allocatedDraft.findIndex(
        (item) => item.material_id === action.payload.material_id
      )

      if (index === -1) {
        state.allocatedDraft.push(action.payload)
      } else {
        state.allocatedDraft[index] = action.payload
      }
    },
    setAllocatedOrderItem(
      state,
      action: PayloadAction<{
        orderId: string | number
        materialId: string | number
        data: any
      }>
    ) {
      const { orderId, materialId, data } = action.payload
      const orderIdStr = String(orderId)
      const materialIdStr = String(materialId)

      // Inisialisasi object jika belum ada
      if (!state.allocatedOrderItem[orderIdStr]) {
        state.allocatedOrderItem[orderIdStr] = {}
      }

      // Simpan data berdasarkan orderId dan materialId
      state.allocatedOrderItem[orderIdStr][materialIdStr] = data
    },
    // Tambahan: Action untuk mengambil data berdasarkan orderId dan materialId
    getAllocatedOrderItem: (
      state,
      action: PayloadAction<{
        orderId: string | number
        materialId: string | number
      }>
    ) => {
      const { orderId, materialId } = action.payload
      const orderIdStr = String(orderId)
      const materialIdStr = String(materialId)

      return state.allocatedOrderItem[orderIdStr]?.[materialIdStr] || null
    },
    // Tambahan: Action untuk mengambil semua data berdasarkan orderId
    getAllocatedOrderItemsByOrderId: (
      state,
      action: PayloadAction<string | number>
    ) => {
      const orderId = String(action.payload)
      return state.allocatedOrderItem[orderId] || {}
    },
    filterAllocatedDraftByOrderId(state, action: PayloadAction<number>) {
      const orderId = action.payload
      state.allocatedDraft = state.allocatedDraft.filter(
        (item) => item.order_id === orderId
      )
    },
    resetAllocatedDraft(state) {
      state.allocatedDraft = []
      state.allocatedOrderItem = {}
    },
  },
})

export const {
  filterAllocatedDraftByOrderId,
  setAllocatedDraft,
  setAllocatedOrderItem,
  resetAllocatedDraft,
  getAllocatedOrderItem,
} = allocateSlice.actions
export const allocateReducer = allocateSlice.reducer

export const getAllocatedDraft = (state: { order: AllocateState }) =>
  state.order.allocatedDraft

export const selectAllocatedOrderItemsByOrderId =
  (orderId: string | number) => (state: { allocate: AllocateState }) => {
    const orderIdStr = String(orderId)
    return state.allocate.allocatedOrderItem[orderIdStr] || {}
  }
