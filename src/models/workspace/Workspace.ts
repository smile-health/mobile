export interface WorkspaceResponse {
  workspaces: Workspace[]
}

export interface Workspace {
  id: number
  key: string
  name: string
  entity_id: number
  status: number
  config: WorkspaceConfig
}

interface WorkspaceConfig {
  material: {
    is_hierarchy_enabled: boolean
    is_batch_enabled: boolean
  }
  order: {
    is_create_restricted: boolean
    is_confirm_restricted: boolean
  }
  transaction: {
    is_transfer_stock_restricted: boolean
  }
  color: string
}
