import { OrderItem } from '@/models/order/OrderItem'
import { setOrder } from '@/services/features'
import { AppDispatch } from '@/services/store'
import { loadLocalData } from '@/storage'
import { getOrderDraftStorageKey } from '@/utils/Constants'

export async function loadDraftFromStorage(programId: number) {
  return await loadLocalData(getOrderDraftStorageKey(programId))
}

export function processDraft(
  orderDraftTypeId: number,
  orders: OrderItem[],
  programId: number,
  dispatch: AppDispatch
) {
  if (!orders?.length) return

  for (const item of orders) {
    dispatch(
      setOrder({
        orderTypeId: orderDraftTypeId,
        programId,
        orders: item,
      })
    )
  }
}

export async function rehydrateDraftFromStorage(
  programId: number,
  dispatch: AppDispatch
) {
  const stored = await loadDraftFromStorage(programId)
  if (stored) {
    processDraft(stored?.orderDraftTypeId, stored.orders, programId, dispatch)
  }
}
