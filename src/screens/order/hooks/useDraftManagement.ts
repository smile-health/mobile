import { useCallback } from 'react'
import { OrderItem } from '@/models/order/OrderItem'
import {
  resetDraft as resetDraftAction,
  setDraft as setDraftAction,
} from '@/services/features/order.slice'
import { orderState, useAppDispatch, useAppSelector } from '@/services/store'
import useProgramId from '@/utils/hooks/useProgramId'
import { OrderType } from '../types/order'

export function useDraftManagement(type: OrderType) {
  const dispatch = useAppDispatch()
  const programId = useProgramId()
  const { drafts } = useAppSelector(orderState)

  const programDrafts = programId ? (drafts[type]?.[programId] ?? []) : []

  const resetDraft = useCallback(() => {
    dispatch(resetDraftAction({ type, programId }))
  }, [dispatch, type, programId])

  const setDraftItem = useCallback(
    (item: OrderItem) => {
      dispatch(setDraftAction({ type, item, programId }))
    },
    [dispatch, type, programId]
  )

  return { drafts: programDrafts, resetDraft, setDraftItem }
}
