import { Activity, ProfileEntity } from '@/models'
import { Material, MaterialStock } from '@/models/app-data/Materials'
import { Stock, StockBatchSection, StockItem } from '@/models/shared/Material'
import {
  calculateTotalQty,
  getActivityMinMax,
  getActivityProtocol,
  getStockMaterial,
} from './material/commonHelper'
import {
  convertMaterialToStockDetails,
  getLevel2MaterialStockDetails,
} from './material/MaterialToStockDetails'
import { EXPIRATION_STATUS } from '../Constants'
import { checkExpiration } from '../DateFormatUtils'

export const generateBatchSection = (
  stocks: Stock[] = [],
  activityId?: number
) => {
  if (!activityId) return []
  const filteredStocks = stocks.filter((s) => s.activity?.id === activityId)

  return filteredStocks.reduce((acc, current) => {
    const isExpired =
      checkExpiration(current.batch?.expired_date) === EXPIRATION_STATUS.EXPIRED

    if (!acc.some((group) => group.fieldname === 'activeBatch')) {
      acc.push({
        fieldname: 'activeBatch',
        title: 'section.material_batch',
        data: [],
      })
    }

    if (!acc.some((group) => group.fieldname === 'expiredBatch')) {
      acc.push({
        fieldname: 'expiredBatch',
        title: 'section.expired_batch',
        data: [],
      })
    }
    const groupIndex = isExpired ? 1 : 0
    acc[groupIndex].data.push(current)

    return acc
  }, [] as StockBatchSection[])
}

export const convertMaterialToStockItem = (
  material: Material,
  activity: Activity,
  entity: ProfileEntity,
  isHierarchy: boolean = false
): StockItem => {
  const {
    updated_at,
    activityMinMax,
    total_qty,
    total_allocated_qty,
    total_available_qty,
    total_in_transit_qty,
    total_open_vial_qty,
    material_hierarchy,
    activity_protocols,
  } = material
  const { min, max } = getActivityMinMax(activityMinMax, activity.id)
  const protocol = getActivityProtocol(activity_protocols, activity.id)
  const hasHierarchy = isHierarchy && !!material_hierarchy
  const details = hasHierarchy
    ? getLevel2MaterialStockDetails(material_hierarchy, activity)
    : convertMaterialToStockDetails(material, [activity])
  return {
    entity,
    material: getStockMaterial(material),
    protocol,
    updated_at,
    last_opname_date: null,
    total_qty,
    total_allocated_qty,
    total_in_transit_qty,
    total_available_qty,
    total_open_vial_qty,
    min,
    max,
    details,
  }
}

const calculateMaterialQuantities = (materials: Material[]) => ({
  total_qty: calculateTotalQty(materials, 'total_qty'),
  total_allocated_qty: calculateTotalQty(materials, 'total_allocated_qty'),
  total_available_qty: calculateTotalQty(materials, 'total_available_qty'),
  total_open_vial_qty: calculateTotalQty(materials, 'total_open_vial_qty'),
  total_in_transit_qty: calculateTotalQty(materials, 'total_in_transit_qty'),
})

const calculateStockQuantities = (stocks: MaterialStock[]) => ({
  total_qty: calculateTotalQty(stocks, 'qty'),
  total_allocated_qty: calculateTotalQty(stocks, 'allocated'),
  total_available_qty: calculateTotalQty(stocks, 'available'),
  total_open_vial_qty: calculateTotalQty(stocks, 'open_vial'),
  total_in_transit_qty: calculateTotalQty(stocks, 'in_transit'),
})

const getLatestUpdatedAt = (
  stocks: Stock[] | MaterialStock[]
): string | null => {
  if (!stocks || stocks.length === 0) return null

  const latest = stocks.reduce((latest, item) => {
    return new Date(item.updated_at) > new Date(latest.updated_at)
      ? item
      : latest
  })

  return latest.updated_at
}

export const isNewMaterial = (id: number | string | undefined): boolean => {
  return typeof id === 'number' && id > 1_000_000_000
}

export const createActivityMaterial = (
  material: Material,
  activityId: number,
  isHierarchy: boolean
) => {
  const { min, max } = getActivityMinMax(material.activityMinMax, activityId)
  const activityStocks = material.stocks.filter(
    (s) => s.activity_id === activityId
  )

  const materialHierarchy = (material.material_hierarchy ?? [])
    .filter((m) => m.activities.includes(activityId))
    .map((m) => createActivityMaterial(m, activityId, false))

  const quantities = isHierarchy
    ? calculateMaterialQuantities(materialHierarchy)
    : calculateStockQuantities(activityStocks)

  const latestActivityStockUpdate = getLatestUpdatedAt(activityStocks)

  const latestHierarchyUpdate = getLatestUpdatedAt(
    materialHierarchy.map((m) => ({ updated_at: m.updated_at }))
  )

  return {
    ...material,
    min,
    max,
    updated_at: isHierarchy ? latestHierarchyUpdate : latestActivityStockUpdate,
    ...quantities,
    material_hierarchy: isHierarchy ? materialHierarchy : null,
  }
}
