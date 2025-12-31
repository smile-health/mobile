import { ReviewTransactionStock } from './TransactionCreate'
import { PaginateParam } from '../Paginate'

export interface GetProgramParams {
  entity_id?: number
}

export interface TransferStockProgram {
  id: number
  key: string
  name: string
  color: string
}

export interface GetActivitiesParams {
  destination_program_id?: number
  material_id?: number
}

export interface TransferStockActivity {
  id: number
  name: string
}

export interface GetTransferStockMaterialParams extends PaginateParam {
  entity_id?: number
  keyword?: string
  destination_program_id?: number
  with_details?: number
}

export interface TransferStockPayload {
  entity_id: number
  companion_program_id: number
  materials: TransferStockMaterial[]
}

export interface TransferStockMaterial {
  material_id: number
  companion_activity_id: number
  stock_id: number
  qty: number
}

export interface IReviewTransferStockMaterialItem {
  materialId: string
  createdAt: string
  materialName: string
  items: IReviewTransferStockItem[]
}

export interface IReviewTransferStockItem extends ReviewTransactionStock {
  program_name: string
}
