import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Activity, BaseEntity, DraftOrderDetail } from '@/models'
import { OrderItem } from '@/models/order/OrderItem'
import { OrderMaterialsData, StockData } from '@/screens/order/types/order'
import { removeLocalData, saveLocalData } from '@/storage'
import { getOrderDraftStorageKey } from '@/utils/Constants'

export interface OrdersState {
  orderDraftTypeId?: number
  orderCustomer?: BaseEntity
  orderActivity: Activity
  orderMaterial: StockData
  orderMaterials: OrderMaterialsData[]
  orders: OrderItem[]
}

const initialState: OrdersState = {
  orderActivity: {} as Activity,
  orderCustomer: {} as BaseEntity,
  orderMaterial: {} as StockData,
  orderMaterials: [],
  orders: [],
}

export const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setOrderCustomer: (state, { payload }: PayloadAction<BaseEntity>) => {
      state.orderCustomer = payload
    },
    setOrderActivity: (state, { payload }: PayloadAction<Activity>) => {
      state.orderActivity = payload
    },
    setOrderMaterial: (state, { payload }: PayloadAction<StockData>) => {
      state.orderMaterial = payload
    },
    setOrderMaterials: (
      state,
      { payload }: PayloadAction<OrderMaterialsData[]>
    ) => {
      state.orderMaterials = payload
    },
    setOrder: (
      state,
      action: PayloadAction<{
        orderTypeId: number
        orders: OrderItem
        programId: number
      }>
    ) => {
      const { orderTypeId, orders, programId } = action.payload
      const index = state.orders.findIndex(
        (o) => o.material_id === orders.material_id
      )

      if (index === -1) {
        state.orders.push(orders)
      } else {
        state.orders[index] = {
          ...state.orders[index],
          ...orders,
        }
      }

      state.orderDraftTypeId = orderTypeId
      saveLocalData(getOrderDraftStorageKey(programId), {
        orderDraftTypeId: orderTypeId,
        orderActivity: state.orderActivity,
        orderCustomer: state.orderCustomer,
        orderMaterial: state.orderMaterial,
        orderMaterials: state.orderMaterials,
        orders: state.orders,
      })
    },
    setExistingOrder: (state, { payload }: PayloadAction<DraftOrderDetail>) => {
      state.orderDraftTypeId = payload.orderDraftTypeId
      state.orderActivity = payload.orderActivity
      state.orderCustomer = payload.orderCustomer
    },
    clearOrderState: (
      state,
      { payload }: PayloadAction<{ programId: number }>
    ) => {
      state.orderDraftTypeId = undefined
      state.orderCustomer = undefined
      state.orderActivity = {} as Activity
      state.orderMaterial = {} as StockData
      state.orderMaterials = []
      state.orders = []
      removeLocalData(getOrderDraftStorageKey(payload.programId))
    },
    removeOrdersState: () => initialState,
  },
})

export const {
  setOrderActivity,
  setOrderCustomer,
  setOrderMaterial,
  setOrderMaterials,
  setOrder,
  clearOrderState,
  removeOrdersState,
} = ordersSlice.actions
export const ordersReducer = ordersSlice.reducer
