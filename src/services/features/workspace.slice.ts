import { PayloadAction, createSelector, createSlice } from '@reduxjs/toolkit'
import { Workspace } from '@/models'

import { setApiProgramId } from '../api'
import { profileApi } from '../apis'
import { workspaceApi } from '../apis/workspaces.api'
import { RootState } from '../store'

interface WorkspacesState {
  workspaces: Workspace[]
  selectedWorkspace: Workspace | null
}

const initialState: WorkspacesState = {
  workspaces: [],
  selectedWorkspace: null,
}

export const ProgramWasteManagement: Workspace = {
  id: 999,
  key: 'waste-management',
  name: 'Waste Management',
  entity_id: 0,
  status: 1,
  config: {
    color: '#068009',
    material: {
      is_hierarchy_enabled: false,
      is_batch_enabled: false,
    },
    order: {
      is_create_restricted: false,
      is_confirm_restricted: false,
    },
    transaction: {
      is_transfer_stock_restricted: true,
    },
  },
}

export const workspacesSlice = createSlice({
  name: 'workspaces',
  initialState,
  reducers: {
    setWorkspacesData(state, action: PayloadAction<Workspace[]>) {
      state.workspaces = action.payload
        .filter((p) => !!p.status)
        .sort((a, b) => a.name.localeCompare(b.name))
    },
    clearWorkspacesData(state) {
      state.workspaces = []
    },
    setSelectedWorkspace(state, action: PayloadAction<Workspace>) {
      setApiProgramId(action.payload.id || null)
      state.selectedWorkspace = action.payload
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      workspaceApi.endpoints.getWorkspaces.matchFulfilled,
      (state, { payload }) => {
        state.workspaces = payload
      }
    )
    builder.addMatcher(
      profileApi.endpoints.fetchProfile.matchFulfilled,
      (state, { payload }) => {
        state.workspaces = payload.programs
          .filter((p) => !!p.status)
          .sort((a, b) => a.name.localeCompare(b.name))
      }
    )
  },
})

export const { setWorkspacesData, clearWorkspacesData, setSelectedWorkspace } =
  workspacesSlice.actions
export const workspacesReducer = workspacesSlice.reducer

export const getProgramConfig = createSelector(
  [(state: RootState) => state.workspace.selectedWorkspace],
  (program) => program?.config
)
