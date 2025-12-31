import { t } from 'i18next'
import * as yup from 'yup'
import {
  IDisposalShipmentDetail,
  IDisposalShipmentStock,
} from '@/models/disposal/DisposalShipmentList'

export const ReceiveShipmentStockSchema = yup.object({
  shipped_qty: yup.number().min(1).required(),
  disposal_shipment_stock_id: yup.number().required(),
  received_qty: yup
    .number()
    .nullable()
    .when(['shipped_qty'], ([shippedQty], schema) => {
      return schema
        .required(() => t('validation.required'))
        .test(
          'not_match_qty',
          () => t('disposal.validation.mismatch_qty'),
          function (receivedQty) {
            return receivedQty === shippedQty
          }
        )
    }),
})

export const ReceiveShipmentItemSchema = yup.object({
  confirmed_qty: yup.number().min(1).required(),
  disposal_shipment_item_id: yup.number().required(),
  stocks: yup.array().of(ReceiveShipmentStockSchema).required(),
})

export const ReceiveShipmentFormSchema = yup.object({
  id: yup.number().required(),
  comment: yup.string().optional(),
  items: yup.array().of(ReceiveShipmentItemSchema).required(),
})

export type ReceiveShipmentStockForm = yup.InferType<
  typeof ReceiveShipmentStockSchema
>

export type ReceiveShipmentForm = yup.InferType<
  typeof ReceiveShipmentFormSchema
>

function getReceiveStockDefaultValue(stocks: IDisposalShipmentStock[]) {
  const mapStock: Record<number, ReceiveShipmentStockForm> = {}
  for (const stock of stocks) {
    if (!mapStock[stock.stock_id]) {
      mapStock[stock.stock_id] = {
        disposal_shipment_stock_id: stock.id,
        received_qty: null,
        shipped_qty: 0,
      }
    }
    mapStock[stock.stock_id].shipped_qty +=
      (stock.disposal_discard_qty ?? 0) + (stock.disposal_received_qty ?? 0)
  }
  return Object.values(mapStock)
}

export function getReceiveDefaultValue(
  data: IDisposalShipmentDetail
): ReceiveShipmentForm {
  const { id, disposal_items } = data
  return {
    id,
    comment: undefined,
    items: disposal_items.map((item) => ({
      disposal_shipment_item_id: item.id,
      confirmed_qty: item.shipped_qty,
      stocks: getReceiveStockDefaultValue(item.disposal_shipment_stocks),
    })),
  }
}
