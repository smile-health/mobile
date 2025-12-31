import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Activity, BaseEntity } from '@/models'
import {
  AddDisposalForm,
  SelfDisposal,
  SelfDisposalStock,
} from '@/models/disposal/CreateSelfDisposal'
import { DisposalMethod } from '@/models/disposal/DisposalMethod'
import {
  DisposalDetailMaterialItem,
  DisposalStockItemResponse,
  DisposalStockSelectedItem,
} from '@/models/disposal/DisposalStock'

export interface DisposalState {
  activity: Activity
  receiver?: BaseEntity
  material: DisposalStockItemResponse
  materialDetail?: DisposalDetailMaterialItem
  method: DisposalMethod
  // Store individual batch disposal data using stock_id as key
  batchDisposalData: Record<number, AddDisposalForm>
  // Store completed material disposal data
  disposal: Record<number, SelfDisposal>
  selectedDisposalStock: DisposalStockSelectedItem
}

const initialState: DisposalState = {
  activity: {} as Activity,
  material: {} as DisposalStockItemResponse,
  method: {} as DisposalMethod,
  batchDisposalData: {},
  disposal: {},
  selectedDisposalStock: {} as DisposalStockSelectedItem,
}

export const disposalSlice = createSlice({
  name: 'disposal',
  initialState,
  reducers: {
    setActivity: (state, { payload }: PayloadAction<Activity>) => {
      state.activity = payload
    },
    setReceiver: (
      state,
      { payload }: PayloadAction<BaseEntity | undefined>
    ) => {
      state.receiver = payload
    },
    setDisposalMethod: (state, { payload }: PayloadAction<DisposalMethod>) => {
      state.method = payload
    },
    setMaterial: (
      state,
      { payload }: PayloadAction<DisposalStockItemResponse>
    ) => {
      state.material = payload
      state.materialDetail = payload.details[0]
      const existingDisposal = state.disposal[payload.material_id]
      if (existingDisposal) {
        for (const item of existingDisposal.disposal) {
          state.batchDisposalData[item.stock_id] = {
            discard: item.discard,
            received: item.received,
          }
        }
      }
    },
    setBatchDisposal: (
      state,
      {
        payload,
      }: PayloadAction<{ stockId: number; disposalData: AddDisposalForm }>
    ) => {
      state.batchDisposalData[payload.stockId] = payload.disposalData
    },
    clearBatchData: (state) => {
      state.batchDisposalData = {}
    },
    saveMaterialDisposal: (
      state,
      { payload }: PayloadAction<{ selectedActivityStocks: number[] }>
    ) => {
      const material = state.material
      const materialId = material.material_id.toString()
      const detail = state.materialDetail
      const disposalList =
        detail?.stocks
          ?.filter((item) => state.batchDisposalData[item.id] != null)
          .map(
            (item) =>
              ({
                stock_id: item.id,
                activity: item.activity,
                batch: item.batch,
                discard: state.batchDisposalData[item.id].discard,
                received: state.batchDisposalData[item.id].received,
              }) as SelfDisposalStock
          ) || []
      const selfDisposal: SelfDisposal = {
        material: material.material,
        selected_activity_stocks: payload.selectedActivityStocks,
        disposal: disposalList,
      }

      state.disposal[materialId] = selfDisposal
      state.batchDisposalData = {}
    },
    clearDisposal: (state) => {
      state.disposal = {}
    },
    setSelectedDisposalStock: (
      state,
      { payload }: PayloadAction<DisposalStockSelectedItem>
    ) => {
      state.selectedDisposalStock = payload
    },
    clearSelectedDisposalStock: (state) => {
      state.selectedDisposalStock = initialState.selectedDisposalStock
    },
  },
})

export const {
  setActivity,
  setReceiver,
  setDisposalMethod,
  setMaterial,
  setBatchDisposal,
  clearBatchData,
  saveMaterialDisposal,
  clearDisposal,
  setSelectedDisposalStock,
  clearSelectedDisposalStock,
} = disposalSlice.actions
export const disposalReducer = disposalSlice.reducer

export const getSelectedDisposalStock = (state: { disposal: DisposalState }) =>
  state.disposal.selectedDisposalStock
