import { RouteProp, useNavigation, useRoute } from '@react-navigation/native'
import { StockItem } from '@/models/shared/Material'
import { AppStackParamList } from '@/navigators'
import { getInventoryStock } from '@/services/features'
import { setStockMaterial } from '@/services/features/stock.slice'
import {
  stockState,
  useAppDispatch,
  useAppSelector,
  workspaceState,
} from '@/services/store'

export default function useInventoryMaterialList() {
  const dispatch = useAppDispatch()
  const { selectedWorkspace } = useAppSelector(workspaceState)
  const { stockActivity } = useAppSelector(stockState)
  const materialList = useAppSelector(getInventoryStock)

  const {
    params: { alerts },
  } = useRoute<RouteProp<AppStackParamList, 'StockMaterialSelect'>>()
  const navigation = useNavigation()
  const isHierarchy = selectedWorkspace?.config.material.is_hierarchy_enabled

  const handlePressMaterial = (stock: StockItem) => {
    dispatch(setStockMaterial(stock))
    const materialAlert = alerts?.find(
      (alert) => alert.id === stock.material?.id
    )
    if (isHierarchy) {
      navigation.navigate('TrademarkMaterialSelect', {
        alerts: materialAlert?.materials,
      })
    } else {
      navigation.navigate('StockDetail', { materialId: stock.material.id })
    }
  }

  return {
    alerts,
    stockActivity,
    materialList,
    handlePressMaterial,
  }
}
