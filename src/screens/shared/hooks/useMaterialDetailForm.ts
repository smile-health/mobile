import { useEffect, useMemo, useState } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useForm } from 'react-hook-form'
import { useLanguage } from '@/i18n/useLanguage'
import { AppStackParamList } from '@/navigators'
import { OrderType } from '@/screens/order/types/order'
import {
  activityState,
  orderState,
  useAppSelector,
  workspaceState,
} from '@/services/store'
import { numberFormat } from '@/utils/CommonUtils'
import { OTHER_REASON_ID } from '@/utils/Constants'
import { useOrderMaterialDetail } from './useOrderMaterialDetail'
import { materialDetailBaseSchema } from '../../order/schema/MaterialDetailBaseSchema'
import { MaterialData, DispatchActionData } from '../types/MaterialDetail'

export const useMaterialDetailForm = <T extends keyof AppStackParamList>(
  data: MaterialData,
  navigation: NativeStackNavigationProp<AppStackParamList, T>,
  dispatchAction: (payload: DispatchActionData) => void,
  orderType: OrderType,
  parentMaterial?: MaterialData,
  isOrderItem?: boolean
) => {
  const { selectedWorkspace } = useAppSelector(workspaceState)
  const programId = selectedWorkspace?.id

  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const { t } = useLanguage()
  const { activeActivity } = useAppSelector(activityState)
  const { detailOrder } = useAppSelector(orderState)
  const { drafts } = useAppSelector(orderState)

  const {
    activityMinMax,
    consumption_unit_per_distribution_unit,
    ordered_qty,
    reason_id,
    order_other_reason,
    total_qty,
    total_available_qty,
  } = data

  const ORDER_REASONS = useMemo(
    () => t('order.order_reasons', { returnObjects: true }),
    [t]
  )

  const currentMinMax = useMemo(
    () => activityMinMax.find((amm) => amm.activity_id === activeActivity?.id),
    [activeActivity, activityMinMax]
  )

  const recommendedStock = useMemo(() => {
    if (!currentMinMax?.max) return 0
    const unit = consumption_unit_per_distribution_unit ?? 1
    const recommendationDiff = currentMinMax.max - (total_qty ?? 0)
    const recommendationFormula = Math.ceil(recommendationDiff / unit) * unit
    return Math.max(recommendationFormula, 0)
  }, [currentMinMax?.max, consumption_unit_per_distribution_unit, total_qty])

  const existingDraftItem = useMemo(() => {
    if (!programId) return

    const programDraftList = drafts[orderType]?.[programId] ?? []

    if (parentMaterial?.id) {
      const parent = programDraftList.find(
        (item) => item?.material_id === parentMaterial.id
      )
      return parent?.material_hierarchy?.find(
        (child) => child.material_id === data.id
      )
    }

    return programDraftList.find((item) => item.material_id === data.id)
  }, [drafts, orderType, programId, parentMaterial?.id, data.id])

  const methods = useForm({
    resolver: yupResolver(
      materialDetailBaseSchema(consumption_unit_per_distribution_unit)
    ),
    mode: 'onChange',
    defaultValues: {
      quantity: Number(ordered_qty || recommendedStock),
      reason: existingDraftItem?.reason_id ?? reason_id,
      other_reason: existingDraftItem?.other_reason ?? order_other_reason,
    },
  })

  const {
    control,
    watch,
    formState: { errors },
    setValue,
  } = methods

  const { quantity, reason, other_reason } = watch()

  useEffect(() => {
    if (Number(quantity) === recommendedStock) {
      setValue('reason', '')
    }
  }, [quantity, recommendedStock, setValue])

  useEffect(() => {
    if (existingDraftItem) {
      methods.reset({
        quantity: Number(existingDraftItem.ordered_qty ?? recommendedStock),
        reason: existingDraftItem.reason_id ?? reason_id,
        other_reason: existingDraftItem.other_reason ?? order_other_reason,
      })
    }
  }, [
    drafts,
    existingDraftItem,
    recommendedStock,
    methods,
    reason_id,
    order_other_reason,
  ])

  const shouldShowDropdownReason = !!(
    quantity &&
    Number(quantity) !== recommendedStock &&
    !parentMaterial?.id
  )

  const isSaveDisabled =
    !quantity ||
    (!parentMaterial?.id && Number(quantity) !== recommendedStock && !reason) ||
    (Number(reason) === OTHER_REASON_ID && !other_reason)

  const orderData = useMemo(
    () => ({
      data,
      recommendation: recommendedStock,
      quantity: String(quantity ?? 0),
      reason,
      other_reason,
    }),
    [data, recommendedStock, quantity, reason, other_reason]
  )

  const { handleSave, toggleDialog, validate } = useOrderMaterialDetail({
    orderData,
    navigation,
    isDialogOpen,
    setIsDialogOpen,
    t,
    dispatchAction,
    orderType,
    parentMaterial,
    isOrderItem,
  })

  const getOrderRecommendation = useMemo(() => {
    return shouldShowDropdownReason && recommendedStock > 0
      ? t('order.recommended_num', { num: numberFormat(recommendedStock) ?? 0 })
      : ''
  }, [recommendedStock, shouldShowDropdownReason, t])

  const filteredStocks = data.stocks.find(
    (item) => item.activity_id === activeActivity?.id
  )

  const handleSubmit = () => {
    if (recommendedStock > 0) {
      validate()
    } else {
      handleSave()
    }
  }

  const handleTrademark = () => {
    if (isOrderItem) {
      navigation.navigate('OrderItemTrademarkMaterial', { data })
    } else {
      navigation.navigate('RegularTrademarkMaterialScreen', { data })
    }
  }

  return {
    methods,
    control,
    errors,
    quantity,
    reason,
    isDialogOpen,
    shouldShowDropdownReason,
    isSaveDisabled,
    currentMinMax,
    qtyMaterial: total_available_qty,
    totalQty: total_qty,
    activeActivity,
    ORDER_REASONS,
    toggleDialog,
    handleSave,
    getOrderRecommendation,
    recommendedStock,
    filteredStocks,
    handleSubmit,
    handleTrademark,
    detailOrder,
  }
}
