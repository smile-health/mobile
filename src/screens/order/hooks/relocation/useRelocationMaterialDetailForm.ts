import { useEffect, useMemo } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import { useNavigation } from '@react-navigation/native'
import { useForm } from 'react-hook-form'
import { useLanguage } from '@/i18n/useLanguage'
import { MaterialData } from '@/screens/shared/types/MaterialDetail'
import {
  setParentMaterial,
  setRelocations,
} from '@/services/features/relocation.slice'
import {
  relocationState,
  useAppDispatch,
  useAppSelector,
} from '@/services/store'
import { numberFormat } from '@/utils/CommonUtils'
import { OTHER_REASON_ID } from '@/utils/Constants'
import useProgramId from '@/utils/hooks/useProgramId'
import { RelocationMaterialScheme } from '../../schema/RelocationScheme'

interface RelocationMaterialDetailFormProps {
  data: MaterialData
}

const useRelocationMaterialDetailForm = ({
  data,
}: RelocationMaterialDetailFormProps) => {
  const navigation = useNavigation()

  const dispatch = useAppDispatch()
  const { activity, vendor, relocations } = useAppSelector(relocationState)

  const programId = useProgramId()
  const { t } = useLanguage()
  const findMaterial = useMemo(() => {
    return relocations.find((val) => val.material_id === data.id)
  }, [data.id, relocations])

  const {
    activityMinMax,
    consumption_unit_per_distribution_unit,
    ordered_qty,
    reason_id,
    order_other_reason,
    total_qty,
    total_available_qty,
  } = data

  const currentMinMax = useMemo(
    () => activityMinMax.find((amm) => amm.activity_id === activity?.id),
    [activity, activityMinMax]
  )

  const recommendedStock = useMemo(() => {
    if (!currentMinMax?.max) return 0
    const unit = consumption_unit_per_distribution_unit ?? 1
    const recommendationDiff = currentMinMax.max - (total_qty ?? 0)
    const recommendationFormula = Math.ceil(recommendationDiff / unit) * unit
    return Math.max(recommendationFormula, 0)
  }, [currentMinMax?.max, consumption_unit_per_distribution_unit, total_qty])

  const methods = useForm({
    resolver: yupResolver(
      RelocationMaterialScheme(consumption_unit_per_distribution_unit)
    ),
    defaultValues: {
      quantity: ordered_qty || recommendedStock,
      reason: reason_id,
      other_reason: order_other_reason,
    },
    mode: 'onChange',
  })

  const {
    control,
    watch,
    formState: { errors },
    setValue,
  } = methods

  const { quantity, reason, other_reason } = watch()

  const shouldShowDropdownReason = !!quantity
  const isSaveDisabled =
    !quantity || !reason || (reason === OTHER_REASON_ID && !other_reason)
  const getOrderRecommendation = useMemo(() => {
    return shouldShowDropdownReason && recommendedStock > 0
      ? t('order.recommended_num', { num: numberFormat(recommendedStock) ?? 0 })
      : ''
  }, [recommendedStock, shouldShowDropdownReason, t])

  // effect to update quantity from trademark material
  useEffect(() => {
    if (findMaterial?.ordered_qty) {
      setValue('quantity', Number(findMaterial.ordered_qty))
      setValue('reason', Number(findMaterial.reason_id))
    } else {
      setValue('quantity', 0)
      setValue('reason', 0)
    }
  }, [findMaterial, setValue])

  const handleSave = () => {
    const findRelocation = relocations.find(
      (val) => val.material_id === data.id
    )

    const payload = {
      material_id: data.id ?? 0,
      material_name: data?.name,
      recommended_stock: 0,
      ordered_qty: quantity,
      reason_id: Number(reason),
      other_reason,
      material_hierarchy: findRelocation?.material_hierarchy ?? [],
      ...(data?.material_companion && {
        material_companion: data.material_companion,
      }),
      children: [],
    }

    dispatch(setRelocations({ relocation: payload, programId }))
    navigation.navigate('RelocationMaterialSelect')
  }

  const handleNavigateToTrademark = () => {
    dispatch(setParentMaterial(data))
    navigation.navigate('RelocationTrademarkMaterial', { material: data })
  }

  return {
    methods,
    control,
    errors,
    quantity,
    reason,
    activity,
    vendor,
    relocations,
    qtyMaterial: total_available_qty,
    currentMinMax,
    recommendedStock,
    getOrderRecommendation,
    shouldShowDropdownReason,
    handleSave,
    isSaveDisabled,
    handleNavigateToTrademark,
  }
}

export default useRelocationMaterialDetailForm
