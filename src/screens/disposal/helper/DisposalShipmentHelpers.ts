import {
  DisposalShipmentOrderItemsPayload,
  DisposalShipmentStockItemPayload,
  DisposalShipmentStocksPayload,
} from '@/models/disposal/CreateDisposalShipment'
import {
  AddDisposalItem,
  SelfDisposal,
  SelfDisposalStock,
} from '@/models/disposal/CreateSelfDisposal'

type DisposalStockType = 'discard' | 'received'

/**
 * Calculates total disposal quantity from disposal stocks
 */
const calculateTotalDisposalQty = (
  disposalStocks: DisposalShipmentStockItemPayload[]
): number => {
  return disposalStocks.reduce(
    (total, stock) => total + stock.discard_qty + stock.received_qty,
    0
  )
}

/**
 * Creates a unique key for grouping disposal items
 */
const createGroupingKey = (stockId: number, reasonId: number): string =>
  `${stockId}_${reasonId}`

/**
 * Creates initial disposal stock item payload
 */
const createInitialStockItem = (
  stockId: number,
  reasonId: number
): DisposalShipmentStockItemPayload => ({
  disposal_stock_id: stockId,
  transaction_reasons: { id: reasonId },
  discard_qty: 0,
  received_qty: 0,
})

/**
 * Processes disposal items and updates the grouped map
 */
const processDisposalItems = (
  items: AddDisposalItem[],
  type: DisposalStockType,
  groupedMap: Record<string, DisposalShipmentStockItemPayload>
): void => {
  for (const item of items) {
    const key = createGroupingKey(
      item.disposal_stock_id,
      item.transaction_reason_id
    )

    if (!groupedMap[key]) {
      groupedMap[key] = createInitialStockItem(
        item.disposal_stock_id,
        item.transaction_reason_id
      )
    }

    const quantityField = type === 'discard' ? 'discard_qty' : 'received_qty'
    groupedMap[key][quantityField] += item.disposal_qty
  }
}

/**
 * Aggregates disposal stocks by grouping items with same disposal_stock_id and transaction_reason_id
 */
export function aggregateDisposalStocks(
  stock: SelfDisposalStock
): DisposalShipmentStockItemPayload[] {
  const groupedMap: Record<string, DisposalShipmentStockItemPayload> = {}

  processDisposalItems(stock.discard, 'discard', groupedMap)
  processDisposalItems(stock.received, 'received', groupedMap)

  return Object.values(groupedMap)
}

/**
 * Creates a stock item payload from disposal data
 */
const createStockItem = (disposalItem: SelfDisposalStock) => {
  const disposal_stocks = aggregateDisposalStocks(disposalItem)
  const stock_qty = calculateTotalDisposalQty(disposal_stocks)

  return {
    activity_id: disposalItem.activity.id,
    activity_name: disposalItem.activity.name,
    batch: disposalItem.batch
      ? {
          code: disposalItem.batch.code,
          id: disposalItem.batch.id,
        }
      : null,
    stock_id: disposalItem.stock_id,
    stock_qty,
    disposal_stocks,
  }
}

/**
 * Creates disposal shipment order items from disposal data
 */
export function createDisposalShipmentOrderItems(
  disposal: Record<number, SelfDisposal>
): DisposalShipmentOrderItemsPayload[] {
  const result: DisposalShipmentOrderItemsPayload[] = []

  // Single loop through disposal items
  for (const item of Object.values(disposal)) {
    const stocks: DisposalShipmentStocksPayload[] = []
    let shipment_qty = 0

    // Process each disposal stock
    for (const disposalItem of item.disposal) {
      const stockItem = createStockItem(disposalItem)
      stocks.push(stockItem)
      shipment_qty += stockItem.stock_qty
    }

    result.push({
      material_id: item.material.id,
      material_name: item.material.name,
      shipment_qty,
      stocks,
    })
  }

  return result
}
