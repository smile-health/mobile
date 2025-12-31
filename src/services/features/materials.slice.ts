import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AppDataMaterialResponse, Material } from '@/models/app-data/Materials'
import { materialsApi } from '@/services/apis'
import { saveLocalData } from '@/storage'
import {
  ADD_REMOVE_STOCK_TYPES,
  MATERIAL_LEVEL_TYPE,
  TRANSACTION_TYPE,
} from '@/utils/Constants'
import {
  getLevel2Materials,
  getLevel3Materials,
} from '@/utils/helpers/material/commonHelper'
import { convertMaterialToStockDetails } from '@/utils/helpers/material/MaterialToStockDetails'
import {
  convertMaterialToStockItem,
  createActivityMaterial,
} from '@/utils/helpers/MaterialHelpers'
import { RootState } from '../store'

export interface MaterialsState {
  lastUpdated: number | null
  materials: AppDataMaterialResponse
}

const initialState: MaterialsState = {
  lastUpdated: null,
  materials: [],
}

export const materialsSlice = createSlice({
  name: 'materials',
  initialState,
  reducers: {
    setMaterials(state, { payload }: PayloadAction<MaterialsState>) {
      state.lastUpdated = payload.lastUpdated
      state.materials = payload.materials
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      materialsApi.endpoints.getMaterials.matchFulfilled,
      (state, { payload, meta: { arg } }) => {
        state.materials = payload
        state.lastUpdated = Date.now()
        saveLocalData(`material-${arg.originalArgs}`, state)
      }
    )
  },
})

export const { setMaterials } = materialsSlice.actions
export const materialsReducer = materialsSlice.reducer

export const getAppDataTrxStocks = createSelector(
  [
    (state: RootState) => state.materials.materials,
    (state: RootState) => state.transaction.activity,
    (state: RootState) => state.auth.user?.entity,
    (state: RootState) => state.home.activeMenu?.transactionType,
  ],
  (materials, activity, entity, trxType = TRANSACTION_TYPE.VIEW_STOCK) => {
    if (!entity) return []
    const isAddRemoveStock = ADD_REMOVE_STOCK_TYPES.has(trxType)

    const level3Materials = getLevel3Materials(materials)
    const filteredMaterials = level3Materials
      .filter((m) => {
        const isIncludeActivity = m.activities.includes(activity.id)
        const addRemoveFilter = isAddRemoveStock ? m.is_addremove : true
        return isIncludeActivity && addRemoveFilter
      })
      .sort((a, b) => a.name.localeCompare(b.name))
    return filteredMaterials.map((material) =>
      convertMaterialToStockItem(material, activity, entity)
    )
  }
)

export const getAppDataStockDetail = createSelector(
  [
    (state: RootState) => state.materials.materials,
    (state: RootState) => state.cva.cva.origin_activities,
    (_state, materialId: number) => materialId,
  ],
  (materials, activities, materialId) => {
    const level3Materials = getLevel3Materials(materials)
    const material = level3Materials.find((m) => m.id === materialId)
    return material ? convertMaterialToStockDetails(material, activities) : []
  }
)

export const getInventoryStock = createSelector(
  [
    (state: RootState) => state.materials.materials,
    (state: RootState) => state.stock.stockActivity,
    (state: RootState) => state.auth.user?.entity,
    (state: RootState) =>
      !!state.workspace.selectedWorkspace?.config.material.is_hierarchy_enabled,
  ],
  (materials, activity, entity, isHierarchy) => {
    if (!entity) return []
    const selectedMaterials: Material[] = isHierarchy
      ? getLevel2Materials(materials)
      : getLevel3Materials(materials)

    // Map to stock items
    const stockItems = selectedMaterials
      .filter((m) => m.activities.includes(activity.id))
      .map((material) =>
        convertMaterialToStockItem(material, activity, entity, isHierarchy)
      )

    // Filter items with details
    return stockItems.sort((a, b) =>
      a.material.name.localeCompare(b.material.name)
    )
  }
)

export const getTrademarkMaterialDetail = createSelector(
  [
    (state: RootState) => state.materials.materials,
    (state: RootState) => state.stock,
    (state: RootState) => state.auth.user?.entity,
  ],
  (materials, stockState, entity) => {
    const { stockActivity, stockMaterial } = stockState
    const level2Materials = getLevel2Materials(materials)
    const selectedMaterial = level2Materials.find(
      (m) => m.id === stockMaterial.material.id
    )
    if (!entity || !selectedMaterial) return null

    return convertMaterialToStockItem(
      selectedMaterial,
      stockActivity,
      entity,
      true
    )
  }
)

export const getMaterialManufacturer = createSelector(
  [(state: RootState) => state.materials.materials, (_state, id: number) => id],
  (materials, id) => {
    const level3Materials = getLevel3Materials(materials)
    const material = level3Materials.find((m) => m.id === id)
    return material
      ? material.manufactures.map((mm) => ({
          id: mm.id,
          name: mm.name,
          address: '',
        }))
      : []
  }
)

export const getMaterialOption = createSelector(
  [
    (state: RootState) => state.materials.materials,
    (_state, materialLevelId?: number) => materialLevelId,
  ],
  (materials, materialLevelId = MATERIAL_LEVEL_TYPE.KFA_93) => {
    const materialOptions = {
      [MATERIAL_LEVEL_TYPE.KFA_92]: getLevel2Materials(materials),
      [MATERIAL_LEVEL_TYPE.KFA_93]: getLevel3Materials(materials),
    }
    const selectedMaterials: Material[] = materialOptions[materialLevelId] ?? []
    return selectedMaterials
      .map((trxType) => ({
        label: trxType.name,
        value: trxType.id,
        isBatch: trxType.is_managed_in_batch || 0,
      }))
      .sort((a, b) => a.label.localeCompare(b.label))
  }
)

export const getActivityMaterials = createSelector(
  [
    (state: RootState) => state.materials.materials,
    (state: RootState) => state.workspace.selectedWorkspace,
    (_state, activityId?: number) => activityId,
    (_state, activityId, materialLevelId?: number) => materialLevelId,
  ],
  (materials, program, activityId, materialLevelId) => {
    if (!activityId || !program) return []
    const isHierarchy = !!program.config.material.is_hierarchy_enabled

    if (!materialLevelId) {
      materialLevelId = isHierarchy
        ? MATERIAL_LEVEL_TYPE.KFA_92
        : MATERIAL_LEVEL_TYPE.KFA_93
    }

    const materialOptions = {
      [MATERIAL_LEVEL_TYPE.KFA_92]: getLevel2Materials(materials),
      [MATERIAL_LEVEL_TYPE.KFA_93]: getLevel3Materials(materials),
    }
    const selectedMaterials: Material[] = materialOptions[materialLevelId] ?? []
    const isKFA93 = materialLevelId === MATERIAL_LEVEL_TYPE.KFA_93
    const hierarchyFlag = isKFA93 ? false : isHierarchy

    return selectedMaterials
      .filter((m) => m.activities.includes(activityId))
      .map((material) =>
        createActivityMaterial(material, activityId, hierarchyFlag)
      )
      .sort((a, b) => a.name.localeCompare(b.name))
  }
)
