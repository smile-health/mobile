import { Stock, StockDetail, StockItem } from '@/models/shared/Material'
import {
  StockTakingItemStock,
  StockTakingMaterialDetail,
  StockTakingPayload,
} from '@/models/stock-taking/CreateStockTaking'
import { StockTaking } from '@/models/stock-taking/StockTakingList'
import { DATE_FILTER_FORMAT, SHORT_DATE_FORMAT } from '@/utils/Constants'
import { convertString } from '@/utils/DateFormatUtils'
import {
  StockTakingForm,
  StockTakingFormItem,
} from '../schema/CreateStockTakingSchema'

export const getAllStocks = (details?: StockDetail[]) => {
  return details?.flatMap((detail) => detail.stocks) ?? []
}

export const stockToStockTakingFormItem = (
  stock: Stock
): StockTakingFormItem => {
  return {
    stock_id: stock.id,
    activity_id: stock.activity?.id,
    activity_name: stock.activity?.name ?? '',
    batch_code: stock.batch?.code ?? undefined,
    expired_date: stock.batch?.expired_date ?? undefined,
    production_date: stock.batch?.production_date ?? undefined,
    actual_qty: null,
    in_transit_qty: stock.unreceived_qty ?? 0,
    recorded_qty: stock.qty ?? 0,
  }
}

export const getStockTakingFormItems = (stocks: Stock[]) => {
  return stocks
    .map((s) => stockToStockTakingFormItem(s))
    .sort((a, b) => b.recorded_qty - a.recorded_qty)
}

export const getSortedStockTakingItems = (stocks: StockTakingFormItem[]) => {
  return stocks.sort((a, b) => b.recorded_qty - a.recorded_qty)
}

export const getHeaderMaterialProps = (
  detail: StockTakingMaterialDetail,
  parentMaterial?: StockItem
) => {
  const { materialName, remainingQty, isHierarchy, isMandatory } = detail
  return {
    name: materialName,
    remainingQty,
    isHierarchy,
    isMandatory: !isHierarchy && isMandatory,
    parentMaterial: parentMaterial
      ? {
          name: parentMaterial.material?.name,
          remainingQty: parentMaterial.total_qty,
          isMandatory: !!parentMaterial.material.is_managed_in_batch,
        }
      : undefined,
  }
}

export const createStockTakingPayload = (
  data: StockTakingForm
): StockTakingPayload => {
  const { entity_id, period_id, material_id, items } = data

  const itemStocks: StockTakingItemStock[] = items.map((item) => ({
    stock_id: item.stock_id,
    activity_id: item.activity_id,
    batch_code: item.batch_code,
    expired_date: item.expired_date
      ? convertString(item.expired_date, DATE_FILTER_FORMAT)
      : undefined,
    recorded_qty: item.recorded_qty,
    in_transit_qty: item.in_transit_qty,
    actual_qty: item.actual_qty ?? 0,
  }))
  return {
    entity_id,
    period_id,
    items: [{ material_id, stocks: itemStocks }],
  }
}

export const getGroupedStockTakingList = (items: StockTaking[]) => {
  const groupedStockTaking = items.reduce(
    (acc: { [date: string]: StockTaking[] }, item) => {
      const date = convertString(item.created_at, DATE_FILTER_FORMAT)
      acc[date] = acc[date] ? [...acc[date], item] : [item]
      return acc
    },
    {}
  )

  return Object.entries(groupedStockTaking).map(([date, data]) => ({
    title: convertString(date, SHORT_DATE_FORMAT).toUpperCase(),
    data,
  }))
}
