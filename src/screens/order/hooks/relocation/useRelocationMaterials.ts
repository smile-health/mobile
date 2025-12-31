import { useCallback, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { Material } from '@/models/app-data/Materials'
import { MaterialData } from '@/screens/shared/types/MaterialDetail'
import { getActivityMaterials } from '@/services/features'
import { clearRelocations } from '@/services/features/relocation.slice'
import {
  relocationState,
  useAppDispatch,
  useAppSelector,
} from '@/services/store'
import useProgramId from '@/utils/hooks/useProgramId'

function useRelocationMaterials() {
  const navigation = useNavigation()

  const dispatch = useAppDispatch()
  const { activity, vendor, relocations } = useAppSelector(relocationState)
  const materials = useAppSelector((state) =>
    getActivityMaterials(state, activity?.id)
  )
  const programId = useProgramId()

  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false)

  const openDeleteAllDialog = () => setShowDeleteAllDialog(true)

  const dismissDeleteAllDialog = () => setShowDeleteAllDialog(false)

  const handleDeleteRelocation = () => {
    dispatch(clearRelocations({ programId }))
    dismissDeleteAllDialog()
  }

  const handlePressMaterial = useCallback(
    (material: Material) => {
      const selectedRelocation = relocations.find(
        (relocation) => relocation.material_id === material.id
      )
      const params: MaterialData = {
        ...material,
        ordered_qty: Number(selectedRelocation?.ordered_qty ?? 0),
        reason_id: selectedRelocation?.reason_id || 0,
        order_other_reason: selectedRelocation?.other_reason || '',
        recommended_stock: selectedRelocation?.recommended_stock || 0,
      }
      navigation.navigate('RelocationMaterialDetail', { material: params })
    },
    [relocations, navigation]
  )

  const handleNavigateToReview = () => {
    navigation.navigate('RelocationReview')
  }

  return {
    activity,
    vendor,
    relocations,
    materials,
    handlePressMaterial,
    showDeleteAllDialog,
    openDeleteAllDialog,
    dismissDeleteAllDialog,
    handleDeleteRelocation,
    handleNavigateToReview,
  }
}

export default useRelocationMaterials
