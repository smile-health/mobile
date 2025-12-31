import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Activity, BaseEntity } from '@/models'
import { GetOrderFilters } from '@/models/order/Order'
import { OrderDetailResponse } from '@/models/order/OrderDetail'
import { OrderItem } from '@/models/order/OrderItem'
import { OrderType } from '@/screens/order/types/order'
import { MaterialData } from '@/screens/shared/types/MaterialDetail'
import { removeLocalData, saveLocalData } from '@/storage'
import { PAGE_SIZE } from '@/utils/Constants'

export interface OrderState {
  filter: GetOrderFilters
  activeTab: number
  detailOrder: OrderDetailResponse
  orderItemDraft: OrderItem[]
  activities: Record<OrderType, Record<number, Activity> | undefined>
  entities: Record<OrderType, BaseEntity>
  drafts: Record<OrderType, Record<number, OrderItem[]>>
}

const filterInitialState: GetOrderFilters = {
  paginate: PAGE_SIZE,
  page: 1,
  purpose: 'purchase',
  type: null,
  status: null,
  order_number: null,
  vendor_id: null,
  customer_id: null,
  activity_id: null,
  from_date: null,
  to_date: null,
  order_id: null,
}

const initialState: OrderState = {
  filter: filterInitialState,
  activeTab: 0,
  detailOrder: {} as OrderDetailResponse,
  orderItemDraft: [],
  activities: {
    regular: {},
    distribution: {},
    return: {},
  } as Record<OrderType, Record<number, Activity>>,
  entities: {
    regular: {} as BaseEntity,
    distribution: {} as BaseEntity,
    return: {} as BaseEntity,
    relocation: {} as BaseEntity,
  },
  drafts: {
    regular: [],
    distribution: [],
    return: [],
    relocation: [],
  },
}

export const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    setOrderFilter(state, action: PayloadAction<Partial<GetOrderFilters>>) {
      const { purpose, ...rest } = action.payload

      state.filter = {
        ...(purpose ? { ...filterInitialState, purpose } : state.filter),
        ...rest,
      }
    },
    setOrderActivity: (
      state,
      {
        payload,
      }: PayloadAction<{
        type: OrderType
        activity: Activity
        programId?: number
      }>
    ) => {
      const { type, activity, programId = 0 } = payload
      state.activities[type] ??= {}
      state.activities[type][programId] = activity
      saveLocalData(`${type}Activity-${programId}`, activity)
    },
    setOrderEntity: (
      state,
      {
        payload,
      }: PayloadAction<{
        type: OrderType
        entities: BaseEntity
        programId: number
      }>
    ) => {
      const { type, entities, programId } = payload
      state.entities[type] = entities
      saveLocalData(`${type}Entity-${programId}` as const, entities)
    },
    setDraft(
      state,
      {
        payload,
      }: PayloadAction<{
        type: OrderType
        item: OrderItem
        programId?: number
        parentMaterial?: MaterialData
      }>
    ) {
      const { item, parentMaterial, type, programId = 0 } = payload

      state.drafts[type] ??= {}
      const programDrafts = state.drafts[type][programId] || []

      const save = (updated: OrderItem[]) => {
        state.drafts[type][programId] = updated
        saveLocalData(`${type}Draft-${programId}` as const, updated)
      }

      const updateChildDraft = () => {
        const parentIndex = programDrafts.findIndex(
          (d) => d.material_id === parentMaterial!.id
        )

        if (parentIndex === -1) {
          save([
            ...programDrafts,
            {
              material_id: parentMaterial!.id,
              material_name: parentMaterial?.name ?? '',
              recommended_stock: 0,
              ordered_qty: Number(item.ordered_qty) || 0,
              material_hierarchy: [item],
              children: [],
            },
          ])
          return
        }

        const parentItem = programDrafts[parentIndex]
        parentItem.material_hierarchy ??= []

        const childIndex = parentItem.material_hierarchy.findIndex(
          (c) => c.material_id === item.material_id
        )

        if (childIndex === -1) {
          parentItem.material_hierarchy.push(item)
        } else {
          parentItem.material_hierarchy[childIndex] = item
        }

        parentItem.ordered_qty = parentItem.material_hierarchy.reduce(
          (sum, child) => sum + Number(child.ordered_qty || 0),
          0
        )

        programDrafts[parentIndex] = parentItem
        save([...programDrafts])
      }

      const updateParentDraft = () => {
        const index = programDrafts.findIndex(
          (d) => d.material_id === item.material_id
        )

        if (index === -1) {
          save([...programDrafts, item])
          return
        }

        const existing = programDrafts[index]
        const hierarchy = existing.material_hierarchy || []
        const totalChildQty = hierarchy.reduce(
          (sum, child) => sum + Number(child.ordered_qty || 0),
          0
        )

        const finalItem = {
          ...item,
          ordered_qty: totalChildQty > 0 ? totalChildQty : item.ordered_qty,
          material_hierarchy: hierarchy,
        }

        programDrafts[index] = finalItem
        save([...programDrafts])
      }

      if (parentMaterial?.id) {
        updateChildDraft()
      } else {
        updateParentDraft()
      }
    },
    resetFilter(state) {
      state.filter = {
        ...state.filter,
        vendor_id: null,
        customer_id: null,
        activity_id: null,
        from_date: null,
        to_date: null,
        type: null,
        integration: null,
      }
    },
    setActiveTab(state, action: PayloadAction<number>) {
      state.activeTab = action.payload
    },
    resetOrderActivity: (
      state,
      {
        payload,
      }: PayloadAction<{
        type: OrderType
        programId?: number
      }>
    ) => {
      const { type, programId = 0 } = payload

      if (state.activities[type]) {
        delete state.activities[type][programId]
      }

      removeLocalData(`${type}Activity-${programId}`)
    },
    resetOrderEntity(
      state,
      action: PayloadAction<{ type: OrderType; programId: number }>
    ) {
      const { type, programId } = action.payload
      state.entities[type] = {} as BaseEntity
      removeLocalData(`${type}Entity-${programId}` as const)
    },
    resetDraft(
      state,
      action: PayloadAction<{ type: OrderType; programId?: number }>
    ) {
      const { type, programId } = action.payload
      state.drafts[type] ??= {}

      if (typeof programId === 'number') {
        delete state.drafts[type][programId]
        removeLocalData(`${type}Draft-${programId}` as const)
      }
    },
    setDetailOrder(state, action: PayloadAction<OrderDetailResponse>) {
      state.detailOrder = action.payload
    },
    setOrderItemDraft(state, action: PayloadAction<OrderItem>) {
      const index = state.orderItemDraft.findIndex(
        (item) => item.material_id === action.payload.material_id
      )

      if (index === -1) {
        state.orderItemDraft.push(action.payload)
      } else {
        state.orderItemDraft[index] = action.payload
      }
    },
    resetOrderItemDraft(state) {
      state.orderItemDraft = []
    },
    resetOrderState(state, action: PayloadAction<{ programId: number }>) {
      const { programId } = action.payload
      Object.assign(state, initialState)

      for (const type of Object.keys(state.activities)) {
        const orderType = type as OrderType
        removeLocalData(`${orderType}Activity-${programId}` as const)
      }

      for (const type of Object.keys(state.drafts)) {
        const orderType = type as OrderType
        removeLocalData(`${orderType}Draft-${programId}` as const)
      }
    },
    removeAllChildDraft(
      state,
      action: PayloadAction<{
        type: OrderType
        parentMaterialId: number
        programId: number
      }>
    ) {
      const { type, parentMaterialId, programId } = action.payload
      const programDrafts = state.drafts[type]?.[programId] ?? []

      const updated = programDrafts.filter(
        (d) => d.material_id !== parentMaterialId
      )

      state.drafts[type][programId] = updated
    },
    removeOrderState(state) {
      state.orderItemDraft = []
      state.activities = {} as Record<OrderType, Record<number, Activity>>
      state.entities = {
        regular: {} as BaseEntity,
        distribution: {} as BaseEntity,
        return: {} as BaseEntity,
        relocation: {} as BaseEntity,
      }
      state.drafts = {
        regular: [],
        distribution: [],
        return: [],
        relocation: [],
      }
    },
  },
})

export const {
  setOrderFilter,
  resetFilter,
  setOrderActivity,
  setDraft,
  resetOrderActivity,
  resetDraft,
  setDetailOrder,
  setOrderItemDraft,
  resetOrderItemDraft,
  setActiveTab,
  resetOrderState,
  setOrderEntity,
  resetOrderEntity,
  removeAllChildDraft,
  removeOrderState,
} = orderSlice.actions
export const orderReducer = orderSlice.reducer

export const getOrderFilters = (state: { order: OrderState }) =>
  state.order.filter
export const getActiveTab = (state: { order: OrderState }) =>
  state.order.activeTab
export const getOrderItemDraft = (state: { order: OrderState }) =>
  state.order.orderItemDraft
export const getOrderActivities = (state: { order: OrderState }) =>
  state.order.activities
export const getOrderEntities = (state: { order: OrderState }) =>
  state.order.entities
export const getOrderDrafts = (state: { order: OrderState }) =>
  state.order.drafts
