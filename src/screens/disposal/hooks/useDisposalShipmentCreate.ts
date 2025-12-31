import { useCallback, useMemo, useState } from 'react'
import { AddDisposalForm } from '@/models/disposal/CreateSelfDisposal'
import {
  clearBatchData,
  saveMaterialDisposal,
} from '@/services/features/disposal.slice'
import { useAppSelector, disposalState, useAppDispatch } from '@/services/store'
import { navigate } from '@/utils/NavigationUtils'

export default function useDisposalShipmentCreate() {
  const dispatch = useAppDispatch()
  const { activity, material, batchDisposalData, materialDetail } =
    useAppSelector(disposalState)
  const [expandedStockId, setExpandedStockId] = useState<number | null>(null)

  const stocks = useMemo(() => {
    return materialDetail?.stocks ?? []
  }, [materialDetail])

  const canSaveMaterial = useMemo(() => {
    return Object.keys(batchDisposalData).length > 0
  }, [batchDisposalData])

  const getStockQuantities = useCallback(
    (stockId: number): AddDisposalForm | null => {
      return batchDisposalData[stockId] || null
    },
    [batchDisposalData]
  )

  const toggleExpandStockItem = useCallback((stockId: number) => {
    setExpandedStockId((prevId) => (prevId === stockId ? null : stockId))
  }, [])

  const handleSaveDisposalMaterial = useCallback(() => {
    if (canSaveMaterial) {
      dispatch(saveMaterialDisposal({ selectedActivityStocks: [activity.id] }))
      dispatch(clearBatchData())
      navigate('ShipmentDisposalMaterial')
    }
  }, [activity.id, canSaveMaterial, dispatch])

  return {
    activity,
    materialDetail,
    material,
    canSaveMaterial,
    stocks,
    expandedStockId,
    isBatch: !!material.material.is_managed_in_batch,
    disposalHistory: materialDetail?.history,
    toggleExpandStockItem,
    getStockQuantities,
    handleSaveDisposalMaterial,
  }
}
