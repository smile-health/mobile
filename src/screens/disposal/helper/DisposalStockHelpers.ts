import {
  DisposalDetailMaterialStockItem,
  DisposalStockItemResponse,
  DisposalStockSelectedItem,
} from '@/models/disposal/DisposalStock'
import { StockBatchSection } from '@/models/shared/Material'

export const transformDisposalStockItemToSelectedItem = (
  item: DisposalStockItemResponse
): DisposalStockSelectedItem => {
  return {
    id: item.material.id,
    name: item.material.name,
    isManagedInBatch: item.material.is_managed_in_batch,
    updatedAt: item.updated_at,
    totalStock:
      item.total_disposal_discard_qty + item.total_disposal_received_qty,
    details: item.details,
  }
}

export const generateDisposalBatchSection = (
  stocks: DisposalDetailMaterialStockItem[] = []
) => {
  return stocks.reduce((acc, current) => {
    if (!acc.some((group) => group.fieldname === 'activeBatch')) {
      acc.push({
        fieldname: 'activeBatch',
        title: 'disposal.material_batch',
        data: [],
      })
    }
    acc[0].data.push(current as any) // Type assertion needed due to different Stock type
    return acc
  }, [] as StockBatchSection[])
}
