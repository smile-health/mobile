import { useEffect, useState } from 'react'
import { StockDetail } from '@/models/shared/Material'
import { getAppDataStockDetail } from '@/services/features'
import { trxState, useAppSelector } from '@/services/store'

function useTransactionStockDetails() {
  const { activity, trxMaterial, transactions } = useAppSelector(trxState)
  const stockDetailData = useAppSelector((state) =>
    getAppDataStockDetail(state, trxMaterial.material?.id)
  )

  const [activityStocks, setActivityStocks] = useState<StockDetail[]>([])

  const allStockData = stockDetailData

  const onSelectActivityStock = (item: StockDetail) => {
    const filteredStock = activityStocks.filter(
      (s) => s.activity?.id !== item.activity?.id
    )
    setActivityStocks(filteredStock)
  }

  useEffect(() => {
    if (allStockData) {
      const materialTransaction = transactions.filter(
        (t) => t.material_id === trxMaterial.material?.id
      )
      const trxActivityIds = new Set([
        activity?.id,
        ...materialTransaction.flatMap((mt) => mt.activity?.id).filter(Boolean),
      ])
      const filteredStock = allStockData.filter(
        (s) => !trxActivityIds.has(s.activity.id)
      )
      setActivityStocks(filteredStock)
    }
  }, [allStockData, activity?.id, transactions, trxMaterial.material?.id])

  return {
    allStockData,
    activityStocks,
    onSelectActivityStock,
  }
}

export default useTransactionStockDetails
