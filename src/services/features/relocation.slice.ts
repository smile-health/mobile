import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Activity, BaseEntity, RelocationDraft } from '@/models'
import { Material } from '@/models/app-data/Materials'
import { OrderItem } from '@/models/order/OrderItem'
import { removeLocalData, saveLocalData } from '@/storage'
import { getRelocationDraftStorageKey } from '@/utils/Constants'

export interface RelocationState {
  activity: Activity // selected activity
  vendor: BaseEntity // selected entity (vendor)
  relocations: OrderItem[] // relocation draf
  parentMaterial: Material
}

const initialState: RelocationState = {
  activity: {} as Activity,
  vendor: {} as BaseEntity,
  relocations: [],
  parentMaterial: {} as Material,
}

// HELPER FUNCTIONS - Extract pure functions for better performance & testability
const calculateTotalOrderedQty = (hierarchy: OrderItem[]): number => {
  return hierarchy.reduce((sum, item) => sum + Number(item.ordered_qty), 0)
}

const updateHierarchy = (
  currentHierarchy: OrderItem[] | undefined,
  payload: OrderItem
): OrderItem[] => {
  const filtered =
    currentHierarchy?.filter(
      (val) => val.material_id !== payload.material_id
    ) || []
  return [...filtered, payload]
}

export const relocationSlice = createSlice({
  name: 'relocation',
  initialState,
  reducers: {
    setActivity: (state, { payload }: PayloadAction<Activity>) => {
      state.activity = payload
    },
    setVendor: (state, { payload }: PayloadAction<BaseEntity>) => {
      state.vendor = payload
    },
    setParentMaterial: (state, { payload }: PayloadAction<Material>) => {
      state.parentMaterial = payload
    },
    setExistingRelocation: (
      state,
      { payload }: PayloadAction<RelocationDraft>
    ) => {
      state.activity = payload.activity
      state.vendor = payload.vendor
      state.parentMaterial = payload.parentMaterial
      state.relocations = payload.relocations
    },
    setRelocations: (
      state,
      { payload }: PayloadAction<{ relocation: OrderItem; programId: number }>
    ) => {
      const { relocation, programId } = payload
      if (relocation.parent_id) {
        // Handle trademark material
        const parentIndex = state.relocations.findIndex(
          (val) => val.material_id === relocation.parent_id
        )

        if (parentIndex >= 0) {
          // Parent exists - direct mutation with Immer
          const parent = state.relocations[parentIndex]
          const updatedHierarchy = updateHierarchy(
            parent.material_hierarchy,
            relocation
          )

          // Direct mutation - Immer allows this
          parent.material_hierarchy = updatedHierarchy
          parent.ordered_qty = calculateTotalOrderedQty(updatedHierarchy)
        } else {
          // Parent doesn't exist - create new parent
          const newParent: OrderItem = {
            material_id: state.parentMaterial.id,
            material_name: state.parentMaterial.name,
            recommended_stock: 0,
            ordered_qty: Number(relocation.ordered_qty),
            material_hierarchy: [relocation],
            children: [],
          }

          // Remove existing and add new - more efficient than filter + spread
          const existingIndex = state.relocations.findIndex(
            (val) => val.material_id === newParent.material_id
          )

          if (existingIndex >= 0) {
            state.relocations[existingIndex] = newParent
          } else {
            state.relocations.push(newParent)
          }
        }
      } else {
        // Regular material - optimized remove + add
        const existingIndex = state.relocations.findIndex(
          (val) => val.material_id === relocation.material_id
        )

        if (existingIndex >= 0) {
          // Replace existing
          state.relocations[existingIndex] = relocation
        } else {
          // Add new
          state.relocations.push(relocation)
        }
      }

      // save to local data storage
      saveLocalData(getRelocationDraftStorageKey(programId), {
        activity: state.activity,
        vendor: state.vendor,
        parentMaterial: state.parentMaterial,
        relocations: state.relocations,
      })
    },
    clearRelocations: (
      state,
      { payload }: PayloadAction<{ programId: number }>
    ) => {
      state.relocations = []

      // remove local data storage
      removeLocalData(getRelocationDraftStorageKey(payload.programId))
    },
    resetRelocationState: () => initialState,
  },
})

export const {
  setActivity,
  setVendor,
  setParentMaterial,
  setExistingRelocation,
  setRelocations,
  clearRelocations,
  resetRelocationState,
} = relocationSlice.actions

export const relocationReducer = relocationSlice.reducer
