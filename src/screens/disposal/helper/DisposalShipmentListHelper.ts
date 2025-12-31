import { ParseKeys } from 'i18next'
import {
  IDisposalShipmentDetailItem,
  IDisposalShipmentStock,
} from '@/models/disposal/DisposalShipmentList'
import {
  IShipmentDetailMaterialItem,
  IShipmentDetailStockItem,
  ReceiveDisposalShipmentPayload,
} from '@/models/disposal/DisposalShipmentStatus'
import { ReceiveShipmentForm } from '../schema/ReceiveDisposalShipmentSchema'

export function getStatusQtyList({ shippedQty, receivedQty, cancelledQty }) {
  return [
    { label: 'disposal.cancelled_qty', qty: cancelledQty },
    { label: 'disposal.received_qty', qty: receivedQty },
    { label: 'disposal.shipped_qty', qty: shippedQty },
  ].filter((d) => d.qty) as { label: ParseKeys; qty: number }[]
}

export function getReceiverShipmentStocks(
  stocks: IDisposalShipmentStock[]
): IShipmentDetailStockItem[] {
  const mapStockItem: Record<number, IShipmentDetailStockItem> = {}
  for (const stock of stocks) {
    if (!mapStockItem[stock.stock_id]) {
      mapStockItem[stock.stock_id] = {
        id: stock.id,
        batch_code: stock.stock.batch?.code,
        manufacture: stock.stock.batch?.manufacture_name ?? undefined,
        expired_date: stock.stock.batch?.expired_date,
        activity_name: stock.stock.activity.name,
        qty: 0,
        discard: [],
        received: [],
      }
    }
    mapStockItem[stock.stock_id].qty +=
      (stock.disposal_discard_qty ?? 0) + (stock.disposal_received_qty ?? 0)
    if (stock.disposal_discard_qty) {
      mapStockItem[stock.stock_id].discard.push({
        qty: stock.disposal_discard_qty,
        reason_id: stock.transaction_reasons.id,
        reason_title: stock.transaction_reasons.title,
      })
    }
    if (stock.disposal_received_qty) {
      mapStockItem[stock.stock_id].received.push({
        qty: stock.disposal_received_qty,
        reason_id: stock.transaction_reasons.id,
        reason_title: stock.transaction_reasons.title,
      })
    }
  }
  return Object.values(mapStockItem)
}

export function getReceiveShipmentItems(
  items: IDisposalShipmentDetailItem[]
): IShipmentDetailMaterialItem[] {
  return items.map((item) => ({
    id: item.id,
    is_batch: !!item.master_material.managed_in_batch,
    material_name: item.master_material.name,
    qty: item.shipped_qty,
    stocks: getReceiverShipmentStocks(item.disposal_shipment_stocks),
  }))
}

export function createReceivePayload(
  data: ReceiveShipmentForm
): ReceiveDisposalShipmentPayload {
  return {
    id: data.id,
    comment: data.comment || undefined,
    items: data.items.map((item) => ({
      ...item,
      stocks: item.stocks.map((stock) => ({
        disposal_shipment_stock_id: stock.disposal_shipment_stock_id,
        received_qty: stock.received_qty ?? 0,
      })),
    })),
  }
}
