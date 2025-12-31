import { useMemo } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import { useNavigation } from '@react-navigation/native'
import { useForm } from 'react-hook-form'
import { useLanguage } from '@/i18n/useLanguage'
import { MaterialData } from '@/screens/shared/types/MaterialDetail'
import { setRelocations } from '@/services/features/relocation.slice'
import {
  relocationState,
  useAppDispatch,
  useAppSelector,
} from '@/services/store'
import { numberFormat } from '@/utils/CommonUtils'
import useProgramId from '@/utils/hooks/useProgramId'
import { RelocationMaterialScheme } from '../../schema/RelocationScheme'

interface Props {
  data: MaterialData
}

const useRelcoationTrademarkDetailForm = ({ data }: Props) => {
  const navigation = useNavigation()

  const dispatch = useAppDispatch()
  const { activity, vendor } = useAppSelector(relocationState)
  const programId = useProgramId()
  const { t } = useLanguage()

  const {
    activityMinMax,
    consumption_unit_per_distribution_unit,
    ordered_qty,
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
      RelocationMaterialScheme(data.consumption_unit_per_distribution_unit)
    ),
    defaultValues: {
      quantity: ordered_qty || recommendedStock,
      reason: 0,
    },
    mode: 'onChange',
  })

  const {
    control,
    watch,
    formState: { errors },
  } = methods

  const { quantity, reason } = watch()

  const shouldShowDropdownReason = !!quantity
  const getOrderRecommendation = useMemo(() => {
    return shouldShowDropdownReason && recommendedStock > 0
      ? t('order.recommended_num', { num: numberFormat(recommendedStock) ?? 0 })
      : ''
  }, [recommendedStock, shouldShowDropdownReason, t])

  const handleSaveTrademark = () => {
    const payload = {
      material_id: data.id ?? 0,
      parent_id: data.parent_id,
      material_name: data?.name,
      recommended_stock: 0,
      ordered_qty: quantity,
      reason_id: Number(reason),
      ...(data?.material_companion && {
        material_companion: data.material_companion,
      }),
      children: [],
    }

    dispatch(setRelocations({ relocation: payload, programId }))
    navigation.goBack()
  }

  return {
    t,
    methods,
    control,
    errors,
    quantity,
    reason,
    activity,
    vendor,
    qtyMaterial: total_available_qty,
    currentMinMax,
    recommendedStock,
    getOrderRecommendation,
    handleSaveTrademark,
  }
}

export default useRelcoationTrademarkDetailForm
