import { Activity } from '@/models'
import { Material, MaterialStock } from '@/models/app-data/Materials'
import { CommonObject } from '@/models/Common'
import { Stock, StockDetail } from '@/models/shared/Material'
import {
  calculateTotalQty,
  getActivityMinMax,
  getMapActivity,
  getStockByActivity,
  getStockMaterial,
} from './commonHelper'

export const convertMaterialToStockDetails = (
  material: Material,
  activities: Activity[]
): StockDetail[] => {
  const activityMap = getMapActivity(activities)
  const activityIds = new Set(Object.keys(activityMap).map(Number))

  // Filter stocks by relevant activities
  const stockActivity = material.stocks.filter((sa) =>
    activityIds.has(sa.activity_id)
  )
  const stocksByActivity = getStockByActivity(stockActivity)

  return Object.entries(stocksByActivity).map(
    ([activityId, stocks]): StockDetail => {
      const activityIdNum = Number.parseInt(activityId)

      // Create activity object
      const activity = {
        id: activityIdNum,
        name: activityMap[activityIdNum]?.name || '',
      }

      // Get min-max values
      const { min, max } = getActivityMinMax(
        material.activityMinMax,
        activityIdNum
      )

      // Convert stocks to the required format
      const convertedStocks: Stock[] = createStock(stocks, min, max, activity)

      // Return the final StockDetail object
      return createStockDetailObject(
        activity,
        convertedStocks,
        stocks,
        min,
        max,
        material
      )
    }
  )
}

const getBudgetSource = (budgetSource: CommonObject | null) => {
  if (!budgetSource?.id) return null
  return {
    id: budgetSource.id,
    name: budgetSource.name,
  }
}

// Helper function to map stocks to the required format
const createStock = (
  stocks: MaterialStock[],
  min: number,
  max: number,
  activity: CommonObject
): Stock[] => {
  return stocks.map((stock) => ({
    id: stock.stock_id,
    batch: stock.batch.code ? mapBatchData(stock.batch) : null,
    budget_source: getBudgetSource(stock.budget_source),
    qty: stock.qty,
    allocated_qty: stock.allocated,
    available_qty: stock.available,
    open_vial_qty: stock.open_vial,
    in_transit_qty: stock.in_transit,
    price: stock.price,
    min,
    max,
    total_price: stock.total_price,
    year: stock.year,
    updated_at: stock.updated_at,
    activity,
  }))
}

// Helper function to map batch data
const mapBatchData = (batch: any) => {
  if (!batch) return null

  return {
    id: batch.id,
    code: batch.code,
    production_date: batch.production_date,
    expired_date: batch.expired_date,
    manufacture: {
      id: batch.manufacture?.id || 0,
      name: batch.manufacture?.name || '',
      address: batch.manufacture?.address || '',
    },
  }
}

// Helper function to create the StockDetail object
const createStockDetailObject = (
  activity: CommonObject,
  convertedStocks: Stock[],
  originalStocks: MaterialStock[],
  min: number,
  max: number,
  material: Material
): StockDetail => {
  return {
    activity,
    total_qty: calculateTotalQty(originalStocks, 'qty'),
    total_allocated_qty: calculateTotalQty(originalStocks, 'allocated'),
    total_in_transit_qty: calculateTotalQty(originalStocks, 'in_transit'),
    total_available_qty: calculateTotalQty(originalStocks, 'available'),
    total_open_vial_qty: calculateTotalQty(originalStocks, 'open_vial'),
    min,
    max,
    updated_at: originalStocks[0]?.updated_at || '',
    material: getStockMaterial(material),
    stocks: convertedStocks,
  }
}

export const getLevel2MaterialStockDetails = (
  materials: Material[],
  activity: Activity
) => {
  const filteredMaterial = materials.filter((mh) => {
    const hasActivity = mh.activities.includes(activity.id)
    return hasActivity
  })
  return filteredMaterial
    .map((mh) => convertMaterialToStockDetails(mh, [activity]))
    .filter((details) => details.length > 0)
    .map((details) => details[0])
}
