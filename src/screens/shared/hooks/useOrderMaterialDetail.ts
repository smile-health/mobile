import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { TFunction } from 'i18next'
import { AppStackParamList } from '@/navigators'
import { OrderType } from '@/screens/order/types/order'
import { setOrderActivity } from '@/services/features/order.slice'
import {
  activityState,
  useAppDispatch,
  useAppSelector,
  workspaceState,
} from '@/services/store'
import { showError } from '@/utils/CommonUtils'
import { isOrderQuantityValid } from '../../order/helpers/OrderHelpers'
import {
  DispatchActionData,
  MaterialData,
  OrderData,
} from '../types/MaterialDetail'

type DispatchAction = (payload: DispatchActionData) => any

interface UseOrderMaterialDetailOptions<T extends keyof AppStackParamList> {
  orderData: OrderData
  navigation: NativeStackNavigationProp<AppStackParamList, T>
  isDialogOpen: boolean
  setIsDialogOpen: (isOpen: boolean) => void
  t: TFunction
  dispatchAction: DispatchAction
  orderType: OrderType
  parentMaterial?: MaterialData
  isOrderItem?: boolean
}

export function useOrderMaterialDetail<T extends keyof AppStackParamList>(
  options: UseOrderMaterialDetailOptions<T>
) {
  const {
    orderData,
    navigation,
    isDialogOpen,
    setIsDialogOpen,
    t,
    dispatchAction,
    orderType,
    parentMaterial,
  } = options

  const { data, recommendation, quantity, reason, other_reason } = orderData

  const dispatch = useAppDispatch()
  const { activeActivity } = useAppSelector(activityState)

  const { selectedWorkspace } = useAppSelector(workspaceState)
  const programId = selectedWorkspace?.id ?? 0

  const toggleDialog = () => setIsDialogOpen(!isDialogOpen)

  const buildOrderPayload = (orderedQty: number): DispatchActionData => ({
    material_id: data.id ?? 0,
    material_name: data?.name,
    recommended_stock: recommendation ?? 0,
    ordered_qty: orderedQty,
    reason_id: recommendation === orderedQty ? 0 : Number(reason),
    other_reason: other_reason ?? '',
    ...(data?.material_companion && {
      material_companion: data.material_companion,
    }),
  })

  const isPiecesMultipleInvalid = (qty: number) => {
    const piecesPerUnit = data?.pieces_per_unit ?? 0
    return piecesPerUnit > 0 && qty % piecesPerUnit !== 0
  }
  const showMultiplesError = () => {
    showError(
      t('error.stock_input_multiples', {
        unit: data?.pieces_per_unit,
        name: data?.name,
      })
    )
  }

  const handleSave = () => {
    const orderedQty = Number.parseInt(quantity, 10)
    const payload = buildOrderPayload(orderedQty)

    if (activeActivity) {
      dispatch(
        setOrderActivity({
          type: orderType,
          activity: activeActivity,
          programId,
        })
      )
    }
    dispatchAction({
      ...payload,
      ...(parentMaterial && { parentMaterial }),
    })
    navigation.pop()
  }

  const validate = () => {
    const orderedQty = Number.parseInt(quantity, 10)

    if (!isOrderQuantityValid({ quantity, recommendation, reason, t })) return

    if (isPiecesMultipleInvalid(orderedQty)) {
      showMultiplesError()
      return
    }

    if (recommendation !== orderedQty) {
      toggleDialog()
      return
    }

    handleSave()
  }

  return {
    handleSave,
    toggleDialog,
    validate,
    activeActivity,
  }
}
