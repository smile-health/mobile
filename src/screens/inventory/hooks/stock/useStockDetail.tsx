import { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { StockDetail } from '@/models/shared/Material'
import { stockState, useAppSelector } from '@/services/store'

export default function useStockDetail() {
  const { stockMaterial } = useAppSelector(stockState)

  const [stockDetail, setStockDetail] = useState<StockDetail | null>(null)

  const navigation = useNavigation()

  const handleNavigateBack = () => {
    navigation.navigate('StockMaterialSelect')
  }
  useEffect(() => {
    setStockDetail({
      ...stockMaterial.details[0],
      material: stockMaterial.material,
    })
  }, [stockMaterial.details, stockMaterial.material])

  return {
    stockDetail,
    handleNavigateBack,
  }
}
