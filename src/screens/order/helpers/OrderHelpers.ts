import dayjs from 'dayjs'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import { t } from 'i18next'
import { OrderStocks, RelocationDraft } from '@/models'
import { MaterialStock } from '@/models/app-data/Materials'
import { OrderAllocateItem } from '@/models/order/OrderItem'
import { MaterialData } from '@/screens/shared/types/MaterialDetail'
import { loadLocalData } from '@/storage'
import { numberFormat, showError, showSuccess } from '@/utils/CommonUtils'
import { getRelocationDraftStorageKey, ORDER_STATUS } from '@/utils/Constants'
import { navigateToOrderDetail } from './NavigationHelpers'
import { OrderValidationParams } from '../types/order'

dayjs.extend(isSameOrAfter)

export async function loadExistingOrderDraft(programId: number) {
  return await loadLocalData(`regularDraft-${programId}` as const)
}

export async function loadExistingRegularActivity(programId: number) {
  return await loadLocalData(`regularActivity-${programId}` as const)
}

export async function loadExistingDistributionDraft(programId: number) {
  return await loadLocalData(`distributionDraft-${programId}` as const)
}

export async function loadExistingDistributionActivity(programId: number) {
  return await loadLocalData(`distributionActivity-${programId}` as const)
}

export async function loadExistingOrderEntity(programId: number) {
  return await loadLocalData(`regularEntity-${programId}` as const)
}

export async function loadExistingDistributionEntity(programId: number) {
  return await loadLocalData(`distributionEntity-${programId}` as const)
}

export const isOrderQuantityValid = ({
  quantity,
  recommendation,
  reason,
  t,
}: OrderValidationParams) => {
  if (!quantity) {
    showError(t('error.complete_data'))
    return false
  }

  const orderedQty = Number.parseInt(quantity, 10)

  if (orderedQty === 0) {
    showError(t('error.entry_batch_stock_zero'))
    return false
  }

  if (recommendation && orderedQty !== recommendation && !reason) {
    showError(t('error.complete_data'))
    return false
  }

  return true
}

export const calculateOrderStockCounts = (orderStocks?: OrderStocks) => {
  return (Array.isArray(orderStocks) ? orderStocks : []).reduce(
    (sum, curr) => ({
      allocateCount: sum.allocateCount + (curr.allocated_qty || 0),
      receiveCount: sum.receiveCount + (curr.received_qty || 0),
    }),
    { allocateCount: 0, receiveCount: 0 }
  )
}

export interface OrderDraftItem {
  material_name: string
  material_companion: { name: string }[]
}

export const getMissingCompanionMaterials = (data, t) => {
  const orderedMaterialNames = new Set(data?.map((item) => item?.material_name))

  const missingCompanions = data?.flatMap((item) =>
    item.material_companion
      ?.filter((companion) => !orderedMaterialNames.has(companion.name))
      .map((companion) => companion.name)
  )

  const uniqueCompanions = [...new Set(missingCompanions)]
  const formattedMaterials = uniqueCompanions
    .map((item) => `• ${item}`)
    .join('\n')

  return {
    uniqueMissingCompanions: uniqueCompanions,
    message: t('dialog.order_without_companion_materials_subtitle', {
      materials: formattedMaterials,
    }),
  }
}

export const getSectionedBatchData = (data: MaterialData) => {
  const today = dayjs()
  const stocks = data.stocks ?? []

  const partitions = {
    valid: [] as MaterialStock[],
    expired: [] as MaterialStock[],
  }

  for (const item of stocks) {
    if (!item.batch?.code) continue

    const isExpired = item.batch.expired_date
      ? !dayjs(item.batch.expired_date).isAfter(today, 'day')
      : false

    partitions[isExpired ? 'expired' : 'valid'].push(item)
  }

  return [
    {
      title: 'section.material_batch',
      data: partitions.valid,
    },
    {
      title: 'section.expired_material_batch',
      data: partitions.expired,
    },
  ]
}

export const validateReceivedQty = (
  receivedQty: number,
  allocatedQty: number
) => {
  return receivedQty > 0 && receivedQty !== allocatedQty
    ? t('validation.received_qty_mismatch', { qty: numberFormat(allocatedQty) })
    : undefined
}

export const showSuccessAndNavigateToDetail = (
  message: string,
  snackbarId: string,
  id: number,
  orderType: number
) => {
  showSuccess(message, snackbarId)
  navigateToOrderDetail(id, orderType)
}

export const ORDER_KEYS = {
  ACTIVITY: 'orderActivity',
  ORDER_DRAFT: 'orderDraft',
  DISTRIBUTION_ACTIVITY: 'orderActivity',
  DISTRIBUTION_DRAFT: 'distributionDraft',
} as const

/**
 * Loads existing relocation draft from storage
 */
export async function loadExistingRelocationDraft(
  programId: number,
  callback?: (value: RelocationDraft) => void
) {
  try {
    const draft = await loadLocalData(getRelocationDraftStorageKey(programId))

    if (draft && callback) {
      callback(draft)
    }

    return draft
  } catch (error) {
    console.error('Failed to load existing transaction:', error)
    return null
  }
}

export function getValueFromDraftByStockId(
  allocatedDraft: OrderAllocateItem[],
  targetStockId: number,
  fieldName: string
) {
  if (!allocatedDraft) return null

  // Normalisasi input menjadi array
  const drafts = Array.isArray(allocatedDraft)
    ? allocatedDraft
    : [allocatedDraft]

  // Cari stock item yang sesuai menggunakan metode array
  const matchingStock = drafts
    .flatMap((draft) => (Array.isArray(draft?.children) ? draft.children : []))
    .flatMap((child) => (Array.isArray(child?.stock) ? child.stock : []))
    .find((stockItem) => stockItem?.stock_id === targetStockId)

  return matchingStock ? matchingStock[fieldName] : null
}

export const getOrderStatusFromIndex = (tabIndex: number) => {
  if (tabIndex === ORDER_STATUS.ALL) return null
  if (tabIndex === 1) return ORDER_STATUS.DRAFT
  return tabIndex - 1
}
