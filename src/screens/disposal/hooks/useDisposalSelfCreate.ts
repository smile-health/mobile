import { useCallback, useMemo, useState } from 'react'
import { AddDisposalForm } from '@/models/disposal/CreateSelfDisposal'
import {
  clearBatchData,
  saveMaterialDisposal,
} from '@/services/features/disposal.slice'
import { useAppSelector, disposalState, useAppDispatch } from '@/services/store'

export default function useDisposalSelfCreate() {
  const dispatch = useAppDispatch()
  const { activity, material, batchDisposalData, materialDetail } =
    useAppSelector(disposalState)
  const [expandedStockId, setExpandedStockId] = useState<number | null>(null)

  const stocks = useMemo(() => {
    return materialDetail?.stocks ?? []
  }, [materialDetail])

  const getStockQuantities = useCallback(
    (stockId: number): AddDisposalForm | null => {
      return batchDisposalData[stockId] || null
    },
    [batchDisposalData]
  )

  const canSaveMaterial = useMemo(() => {
    return Object.keys(batchDisposalData).length > 0
  }, [batchDisposalData])

  const toggleExpand = useCallback((stockId: number) => {
    setExpandedStockId((prevId) => (prevId === stockId ? null : stockId))
  }, [])

  const handleSaveMaterial = useCallback(() => {
    if (canSaveMaterial) {
      dispatch(saveMaterialDisposal({ selectedActivityStocks: [activity.id] }))
      dispatch(clearBatchData())
    }
  }, [activity.id, canSaveMaterial, dispatch])

  return {
    activity,
    material,
    materialDetail,
    expandedStockId,
    stocks,
    toggleExpand,
    getStockQuantities,
    canSaveMaterial,
    handleSaveMaterial,
  }
}
