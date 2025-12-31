import { useNavigation } from '@react-navigation/native'
import { StockDetail } from '@/models/shared/Material'
import { setMaterialDetail } from '@/services/features/stock-taking.slice'
import {
  stockTakingState,
  useAppDispatch,
  useAppSelector,
  workspaceState,
} from '@/services/store'
import { getStockTakingFormItems } from '../helpers/StockTakingHelpers'

export default function useStockTakingTrademarkMaterial() {
  const dispatch = useAppDispatch()
  const { selectedWorkspace } = useAppSelector(workspaceState)
  const { parentMaterial, period } = useAppSelector(stockTakingState)

  const navigation = useNavigation()

  const handleSelectMaterial = (item: StockDetail) => {
    const materialData = {
      entityId: selectedWorkspace?.entity_id ?? 0,
      materialId: item.material.id,
      materialName: item.material.name,
      lastStockOpname: item.last_opname_date ?? null,
      remainingQty: item.total_qty,
      isHierarchy: !!selectedWorkspace?.config.material.is_hierarchy_enabled,
      isBatch: !!item.material.is_managed_in_batch,
      activities: item.material.activities ?? [],
      stocks: getStockTakingFormItems(item.stocks),
    }

    dispatch(setMaterialDetail(materialData))
    navigation.navigate('CreateStockTaking')
  }

  return {
    period,
    parentMaterial,
    handleSelectMaterial,
  }
}
