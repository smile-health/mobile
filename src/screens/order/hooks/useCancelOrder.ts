import { useCallback, useMemo, useState } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { useLanguage } from '@/i18n/useLanguage'
import { CancelOrderPayload } from '@/models/order/OrderActions'
import {
  useCancelOrderMutation,
  useGetOrderCancelReasonsQuery,
} from '@/services/apis'
import { setActiveTab } from '@/services/features/order.slice'
import { useAppDispatch } from '@/services/store'
import { showError, showSuccess } from '@/utils/CommonUtils'
import { ORDER_TYPE } from '@/utils/Constants'
import { cancelOrderSchema } from '../schema/CancelOrderSchema'

type CancelOrderFormField = yup.InferType<ReturnType<typeof cancelOrderSchema>>

export function useCancelOrder(navigation, orderId, type) {
  const [isCancelOrderDialogOpen, setIsCancelOrderDialogOpen] = useState(false)

  const [cancelOrder, { isLoading: isLoadingCancelOrder }] =
    useCancelOrderMutation()
  const {
    data: orderCancelReasonData,
    isLoading: isLoadingGetOrderCancelReasons,
  } = useGetOrderCancelReasonsQuery({})

  const { t } = useLanguage()
  const dispatch = useAppDispatch()

  const {
    control,
    watch,
    formState: { errors },
  } = useForm<CancelOrderFormField>({
    resolver: yupResolver(cancelOrderSchema()),
    mode: 'onChange',
  })

  const { reason, comment, other_reason_text } = watch()

  const reasonId = Number(reason)
  const OTHER_REASON_ID = 4
  const isOtherReason = reasonId === OTHER_REASON_ID

  const isRelocation = type === ORDER_TYPE.RELOCATION
  const cancelButtonKey = isRelocation
    ? t('button.cancel_relocation')
    : t('button.cancel_order')

  const toggleCancelOrderDialog = () => {
    setIsCancelOrderDialogOpen(!isCancelOrderDialogOpen)
  }

  const handleCancelOrder = useCallback(async () => {
    setIsCancelOrderDialogOpen(false)

    const payload: CancelOrderPayload = {
      id: orderId,
      order_reason_id: reasonId,
      comment,
      ...(isOtherReason && { other_reason_text }),
    }

    try {
      await cancelOrder(payload).unwrap()
      showSuccess(
        t('order.success_cancel_order'),
        'snackbar-success-cancel-order'
      )
      dispatch(setActiveTab(6))
      navigation.navigate('OrderDetail', { id: orderId })
    } catch (error) {
      showError(error, 'snackbar-error-cancel-order')
    }
  }, [
    orderId,
    reasonId,
    comment,
    isOtherReason,
    other_reason_text,
    cancelOrder,
    t,
    dispatch,
    navigation,
  ])

  const isDisabledCancelOrder = useMemo(() => {
    const hasNoReason = !reason
    const missingOtherReasonText = isOtherReason && !other_reason_text
    const hasNoComment = !comment

    return hasNoReason || missingOtherReasonText || hasNoComment
  }, [comment, reason, isOtherReason, other_reason_text])

  return {
    formControl: {
      control,
      errors,
      watch: {
        reason,
        comment,
        other_reason_text,
      },
    },
    datas: {
      orderCancelReasonData: orderCancelReasonData || [],
    },
    status: {
      isOtherReason,
      isDisabledCancelOrder,
      isLoading: isLoadingGetOrderCancelReasons || isLoadingCancelOrder,
      cancelButtonKey,
    },
    uiState: {
      isCancelOrderDialogOpen,
    },
    actions: {
      toggleCancelOrderDialog,
      handleCancelOrder,
    },
  }
}
