import { useCallback, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { MaterialData } from '@/screens/shared/types/MaterialDetail'
import { clearRelocations } from '@/services/features/relocation.slice'
import {
  relocationState,
  useAppDispatch,
  useAppSelector,
  workspaceState,
} from '@/services/store'

interface RelocationTrademarkProps {
  data: MaterialData
}

const findHierarchy = (relocations, item) => {
  const parent = relocations.find((val) => val.material_id === item.parent_id)
  return parent?.material_hierarchy?.find((val) => val.material_id === item.id)
}

function useRelocationTrademark({ data }: RelocationTrademarkProps) {
  const navigation = useNavigation()

  const dispatch = useAppDispatch()
  const { activity, vendor, relocations } = useAppSelector(relocationState)
  const { selectedWorkspace } = useAppSelector(workspaceState)
  const programId = Number(selectedWorkspace?.id)

  const isHierarchy = selectedWorkspace?.config.material.is_hierarchy_enabled
  const materialHierarchy = data?.material_hierarchy || ([] as any)

  const [dialogVisible, setDialogVisible] = useState(false)

  const toggleDialog = () => setDialogVisible((prev) => !prev)

  const hasRelocationHierarchy = relocations.find(
    (val) => val.material_id === data.id
  )?.material_hierarchy

  const handlePressTrademarkMaterial = useCallback(
    (item) => {
      const selectedHierarchy = findHierarchy(relocations, item)

      const params: MaterialData = {
        ...item,
        ordered_qty: selectedHierarchy?.ordered_qty || 0,
        reason_id: selectedHierarchy?.reason_id || 0,
        recommended_stock: selectedHierarchy?.recommended_stock || 0,
      }

      navigation.navigate('RelocationTrademarkMaterialDetail', {
        material: params,
      })
    },
    [relocations, navigation]
  )

  const handleSave = () => {
    const materialRelocation = relocations.find(
      (val) => val.material_id === data.id
    )

    const params: MaterialData = {
      ...data,
      ordered_qty: Number(materialRelocation?.ordered_qty ?? 0),
      reason_id: materialRelocation?.reason_id || 0,
      recommended_stock: materialRelocation?.recommended_stock || 0,
    }

    navigation.navigate('RelocationMaterialDetail', {
      material: params,
    })
  }

  const handleDeleteAll = () => {
    dispatch(clearRelocations({ programId }))
    setDialogVisible(false)
  }

  return {
    activity,
    vendor,
    relocations,
    isHierarchy,
    materialHierarchy,
    hasRelocationHierarchy,
    handlePressTrademarkMaterial,
    handleSave,
    dialogVisible,
    toggleDialog,
    handleDeleteAll,
  }
}

export default useRelocationTrademark
