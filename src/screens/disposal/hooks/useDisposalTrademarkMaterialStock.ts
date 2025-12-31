import { useNavigation } from '@react-navigation/native'
import { getSelectedDisposalStock } from '@/services/features/disposal.slice'
import { stockState, useAppSelector } from '@/services/store'

export default function useDisposalTrademarkMaterialStock() {
  const { stockActivity } = useAppSelector(stockState)
  const selectedStock = useAppSelector(getSelectedDisposalStock)

  const navigation = useNavigation()

  const onSelectTrademarkMaterial = (detail) => {
    navigation.navigate('DisposalTrademarkMaterialDetail', { detail })
  }

  return {
    stockActivity,
    selectedStock,
    onSelectTrademarkMaterial,
  }
}
