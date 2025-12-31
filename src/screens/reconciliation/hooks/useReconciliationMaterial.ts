import { useCallback, useMemo } from 'react'
import { useNavigation } from '@react-navigation/native'
import { useForm } from 'react-hook-form'
import { useLanguage } from '@/i18n/useLanguage'
import { Material } from '@/models/app-data/Materials'
import { getActivityMaterials } from '@/services/features'
import { setMaterial } from '@/services/features/reconciliation.slice'
import {
  reconciliationState,
  useAppDispatch,
  useAppSelector,
} from '@/services/store'
import { MATERIAL_LEVEL_TYPE } from '@/utils/Constants'

export default function useReconciliationMaterial() {
  const { t } = useLanguage()
  const dispatch = useAppDispatch()
  const { activity } = useAppSelector(reconciliationState)
  const materials = useAppSelector((state) =>
    getActivityMaterials(state, activity.id, MATERIAL_LEVEL_TYPE.KFA_93)
  )
  const navigation = useNavigation()

  const { watch, control } = useForm({
    defaultValues: { name: '' },
  })
  const search = watch('name')

  const materialList = useMemo(() => {
    return materials.filter((m) =>
      m.name?.toLowerCase().includes(search.toLowerCase())
    )
  }, [materials, search])

  const handlePressMaterial = useCallback(
    (material: Material) => {
      dispatch(setMaterial(material))

      navigation.navigate('CreateReconciliation', {})
    },
    [dispatch, navigation]
  )

  return {
    t,
    control,
    activity,
    materials: materialList,
    handlePressMaterial,
  }
}
