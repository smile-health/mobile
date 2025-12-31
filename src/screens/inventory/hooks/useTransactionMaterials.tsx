import { useEffect } from 'react'
import { useNavigation } from '@react-navigation/native'
import { StockItem } from '@/models/shared/Material'
import { getAppDataTrxStocks } from '@/services/features'
import {
  setMaterial,
  setMaterials,
} from '@/services/features/transaction.slice'
import { homeState, useAppDispatch, useAppSelector } from '@/services/store'
import { TRANSACTION_CONFIG } from '../constant/transaction.constant'

export default function useTransactionMaterials() {
  const dispatch = useAppDispatch()
  const { activeMenu } = useAppSelector(homeState)
  const stockData = useAppSelector(getAppDataTrxStocks)
  const navigation = useNavigation()

  const transactionType = activeMenu?.transactionType
  const config = transactionType ? TRANSACTION_CONFIG[transactionType] : null

  const handlePressMaterial = (stock: StockItem) => {
    if (!config) return
    const isBatch =
      stock.material.is_managed_in_batch && config.batchDestination
    dispatch(setMaterial(stock))
    const destination = isBatch ? config.batchDestination : config.destination

    navigation.navigate(destination as any, { stock })
  }

  useEffect(() => {
    if (stockData) {
      dispatch(setMaterials(stockData))
    }
  }, [stockData, dispatch])

  return {
    materials: stockData,
    handlePressMaterial,
  }
}
