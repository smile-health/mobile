import { Activity } from '@/models'
import {
  ActivityMinMax,
  ActivityProtocol,
  Material,
  MaterialStock,
} from '@/models/app-data/Materials'
import { CommonObject } from '@/models/Common'
import { StockMaterial } from '@/models/shared/Material'

export const getLevel3Materials = (materials: Material[]): Material[] => {
  const level3Materials: Material[] = []
  level3Materials.push(...materials.filter((m) => m.material_level_id === 3))

  const level2Materials = materials.filter(
    (m) => m.material_level_id === 2 && m.material_hierarchy
  )

  for (const m of level2Materials) {
    if (m.material_hierarchy) {
      level3Materials.push(...m.material_hierarchy)
    }
  }

  return level3Materials
}

export const getLevel2Materials = (materials: Material[]): Material[] => {
  return materials.filter((m) => m.material_level_id === 2)
}

export const getMapActivity = (activities: Activity[]) => {
  return activities.reduce(
    (acc, activity) => {
      acc[activity.id] = activity
      return acc
    },
    {} as Record<number, Activity>
  )
}

export const getStockByActivity = (stockActivity: MaterialStock[]) => {
  return stockActivity.reduce(
    (acc, stock) => {
      if (!acc[stock.activity_id]) {
        acc[stock.activity_id] = []
      }
      acc[stock.activity_id].push(stock)
      return acc
    },
    {} as Record<number, MaterialStock[]>
  )
}

export const getActivityMinMax = (
  activityMinMax: ActivityMinMax[],
  activityId: number
) => {
  const minMax = activityMinMax.find((mm) => mm.activity_id === activityId)
  return {
    min: minMax?.min ?? 0,
    max: minMax?.max ?? 0,
  }
}

export const getActivityProtocol = (
  activityProtocols: ActivityProtocol[],
  activityId: number
): ActivityProtocol => {
  const activityProtocol = activityProtocols.find(
    (ap) => ap.activity_id === activityId
  )
  return {
    activity_id: activityId,
    key: activityProtocol?.key ?? '',
    material_id: activityProtocol?.material_id ?? 0,
    is_patient_needed: activityProtocol?.is_patient_needed ?? 0,
    is_sequence: activityProtocol?.is_sequence ?? 0,
  }
}

// Helper function to calculate total properties
export const calculateTotalQty = (
  stocks: any[],
  property: string,
  options?: { isTradeMarkMaterial?: boolean; children?: any[] }
): number => {
  if (
    options?.isTradeMarkMaterial &&
    options?.children &&
    options.children.length > 0
  ) {
    return options.children.reduce((total, child) => {
      if (child.order_stocks && child.order_stocks.length > 0) {
        return (
          total +
          child.order_stocks.reduce(
            (sum, stock) => sum + (stock[property] ?? 0),
            0
          )
        )
      }
      return total
    }, 0)
  }

  // Kalkulasi normal jika bukan trademark material atau tidak ada children
  return stocks.reduce((sum, stock) => sum + (stock[property] ?? 0), 0)
}

export const getStockMaterial = (
  material: Material,
  activities?: CommonObject[]
): StockMaterial => {
  return {
    id: material.id,
    name: material.name,
    is_temperature_sensitive: material.is_temperature_sensitive,
    is_open_vial: material.is_open_vial,
    is_managed_in_batch: material.is_managed_in_batch,
    consumption_unit_per_distribution_unit:
      material.consumption_unit_per_distribution_unit,
    unit_of_consumption: material.unit_of_consumption,
    activities: activities ?? [],
    companions: material.material_companion,
    material_level_id: material.material_level_id,
    status: material.status,
  }
}
