import { useNavigation } from '@react-navigation/native'
import { StockDetail } from '@/models/shared/Material'
import { getTrademarkMaterialDetail } from '@/services/features'
import { stockState, useAppSelector } from '@/services/store'

export default function useTrademarkMaterialStock() {
  const { stockActivity } = useAppSelector(stockState)

  const navigation = useNavigation()

  const trademarkMatrialData = useAppSelector(getTrademarkMaterialDetail)

  const handlePressTrademarkMaterial = (detail: StockDetail) => {
    navigation.navigate('TrademarkMaterialDetail', { detail })
  }

  const handleViewActiveMaterial = () => {
    navigation.navigate('StockMaterialSelect')
  }

  return {
    stockActivity,
    stockMaterial: trademarkMatrialData,
    handlePressTrademarkMaterial,
    handleViewActiveMaterial,
    goBack: navigation.goBack,
  }
}
