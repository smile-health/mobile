import { useState, useMemo, useCallback } from 'react'
import { getSectionedBatchData } from '@/screens/order/helpers/OrderHelpers'
import { MaterialData } from '../types/MaterialDetail'

export const useStocksManagement = (data: MaterialData) => {
  const [addedStocks, setAddedStocks] = useState<MaterialData['stocks']>([])
  const [isOpenActivityBottomSheet, setIsOpenActivityBottomSheet] =
    useState(false)

  const allStocks = useMemo(
    () => [...(data.stocks ?? []), ...addedStocks],
    [data.stocks, addedStocks]
  )

  const sectionData = useMemo(() => {
    if (data.is_managed_in_batch) {
      const base = getSectionedBatchData({ ...data, stocks: allStocks }) || []
      const manual =
        addedStocks.length > 0 ? [{ title: '', data: addedStocks }] : []
      return [...base, ...manual]
    }

    return [
      {
        title: '',
        data: allStocks,
      },
    ]
  }, [data, allStocks, addedStocks])

  const handleSelectActivityStock = useCallback(
    (item: MaterialData['stocks'][number]) => {
      setAddedStocks((prev) =>
        prev.some((s) => s.stock_id === item.stock_id) ? prev : [...prev, item]
      )
      setIsOpenActivityBottomSheet(false)
    },
    []
  )

  return {
    addedStocks,
    localStocks: allStocks,
    baseSectionData: sectionData,
    handleSelectActivityStock,
    isOpenActivityBottomSheet,
    setIsOpenActivityBottomSheet,
  }
}
