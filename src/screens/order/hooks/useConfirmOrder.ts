import { useCallback, useMemo, useState } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import { TFunction } from 'i18next'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { Material } from '@/models/app-data/Materials'
import { OrderDetailResponse } from '@/models/order/OrderDetail'
import {
  useConfirmOrderMutation,
  useValidateOrderMutation,
} from '@/services/apis'
import { showError, showSuccess } from '@/utils/CommonUtils'
import { DATE_FILTER_FORMAT, OTHER_REASON_ID } from '@/utils/Constants'
import { dateToString, stringToDate } from '@/utils/DateFormatUtils'
import {
  getErrorMessage,
  showFormattedError,
} from '@/utils/helpers/ErrorHelpers'
import { navigateAndReset } from '@/utils/NavigationUtils'
import { EditOrderSchema as ConfirmOrderSchema } from '../schema/EditOrderSchema'

interface UseConfirmOrderProps {
  data: OrderDetailResponse
  orderId: number
  t: TFunction
  navigation?: any
}
interface OrderItemChild {
  id: number
  confirmed_qty: number
  ordered_qty: number
  qty: number
  material_name: string
  material: Material
}

interface OrderItemData {
  id: number
  qty: number
  ordered_qty: number
  material: Material
  reason_id: number
  other_reason_text: string
  children: OrderItemChild[]
}

type ConfirmOrderFormField = yup.InferType<
  ReturnType<typeof ConfirmOrderSchema>
>

export function useConfirmOrder({
  data,
  orderId,
  t,
  navigation,
}: UseConfirmOrderProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [orderItems, setOrderItems] = useState(() => [...data.order_items])
  const [confirmOrder, { isLoading }] = useConfirmOrderMutation()
  const [validateOrder, { isLoading: isLoadingValidate }] =
    useValidateOrderMutation()

  const {
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ConfirmOrderFormField>({
    resolver: yupResolver(ConfirmOrderSchema()),
    mode: 'onChange',
    defaultValues: {
      date: dateToString(new Date(data?.created_at), DATE_FILTER_FORMAT),
    },
  })

  const form = watch()
  const { comment, date, letter_number } = form

  const formattedDate = useMemo(
    () => (date ? stringToDate(date) : undefined),
    [date]
  )

  const handleDateChange = useCallback(
    (val: Date) => setValue('date', dateToString(val, DATE_FILTER_FORMAT)),
    [setValue]
  )

  const updateItem = useCallback((index: number, key: string, value: any) => {
    setOrderItems((prev) => {
      const existingValue = prev[index][key]
      if (existingValue === value) return prev

      const updated = [...prev]
      updated[index] = { ...updated[index], [key]: value }
      return updated
    })
  }, [])

  const updateChildrenQty = useCallback(
    (parentIndex: number, childId: number, value: string) => {
      setOrderItems((prev) => {
        const updated = [...prev]
        const parent = updated[parentIndex]

        if (parent?.children) {
          parent.children = parent.children.map((child) =>
            child.id === childId
              ? { ...child, confirmed_qty: Number(value), qty: Number(value) }
              : child
          )

          // calculate total confirmed_qty from children
          const totalOrderedQty = parent.children.reduce(
            (sum, child) => sum + (child.confirmed_qty || child.qty),
            0
          )

          // Update ordered_qty parent
          updated[parentIndex] = {
            ...parent,
            ordered_qty: totalOrderedQty,
          }
        }

        return updated
      })
    },
    []
  )

  const toggleConfirmOrderDialog = useCallback(
    () => setDialogOpen((prev) => !prev),
    []
  )

  const handleError = (error) => {
    setDialogOpen(false)
    showError(getErrorMessage(error, t))
  }

  const getItemProperties = (
    mode: 'confirm' | 'review' | 'validate',
    itemData: OrderItemData
  ) => {
    const {
      qty,
      ordered_qty,
      material,
      reason_id,
      other_reason_text,
      children,
    } = itemData
    const hasChildren = children?.length
    const isOtherReason = reason_id === OTHER_REASON_ID

    if (mode === 'confirm') {
      return {
        confirmed_qty: hasChildren ? Number(ordered_qty) : Number(qty),
        ...(hasChildren && {
          children: children.map(({ id, confirmed_qty: cq, qty }) => ({
            id,
            confirmed_qty: cq || qty,
          })),
        }),
      }
    }

    if (mode === 'validate') {
      return {
        validated_qty: hasChildren ? Number(ordered_qty) : Number(qty),
        ...(hasChildren && {
          children: children.map(({ id, confirmed_qty: cq, qty }) => ({
            id,
            validated_qty: cq || qty,
          })),
        }),
      }
    }

    // mode === 'review'
    return {
      material_id: material?.id,
      ordered_qty: hasChildren ? Number(ordered_qty) : Number(qty),
      material_name: material?.name,
      order_reason_id: typeof reason_id === 'number' ? reason_id : null,
      ...(isOtherReason && {
        other_reason: other_reason_text,
      }),
      ...(hasChildren && {
        children: children.map(({ id, confirmed_qty: cq, qty, material }) => ({
          id,
          ordered_qty: cq || qty,
          material_name: material?.name,
        })),
      }),
    }
  }

  const mapOrderItems = useCallback(
    (orderItems, mode: 'confirm' | 'review' | 'validate') => {
      return orderItems.map(
        ({
          id,
          qty,
          ordered_qty,
          material,
          reason_id,
          other_reason_text,
          children,
        }) => {
          const itemProperties = getItemProperties(mode, {
            id,
            qty,
            ordered_qty,
            material,
            reason_id,
            other_reason_text,
            children,
          })
          return {
            id: id as number,
            ...itemProperties,
          }
        }
      )
    },
    []
  )

  const onPressConfirmOrder = async () => {
    try {
      setDialogOpen(false)
      const items = mapOrderItems(orderItems, 'confirm')

      const payload = { id: orderId, order_items: items, comment }

      const response = await confirmOrder(payload)

      if (response?.error) {
        showFormattedError(response?.error)
        return
      }

      showSuccess(
        t('order.success_confirm_order'),
        'snackbar-success-confirm-order'
      )

      navigateAndReset(
        [
          { name: 'Workspace' },
          { name: 'Home' },
          { name: 'ViewOrder' },
          { name: 'OrderDetail', params: { id: orderId } },
        ],
        1
      )
    } catch (error) {
      handleError(error)
    }
  }

  const onPressValidateOrder = async () => {
    try {
      setDialogOpen(false)

      const items = mapOrderItems(orderItems, 'validate')

      const payload = {
        id: orderId,
        order_items: items,
        letter_number,
        comment,
      }

      const response = await validateOrder(payload)

      if (response?.error) {
        showFormattedError(response?.error)
        return
      }

      showSuccess(
        t('order.success_validate_order'),
        'snackbar-success-validate-order'
      )

      navigateAndReset(
        [
          { name: 'Workspace' },
          { name: 'Home' },
          { name: 'ViewOrder' },
          { name: 'OrderDetail', params: { id: orderId } },
        ],
        1
      )
    } catch (error) {
      handleError(error)
    }
  }

  const onPressReviewOrder = useCallback(() => {
    const items = mapOrderItems(orderItems, 'review')

    const datas = { order_items: items, vendor: data.vendor }

    navigation.navigate('EditOrderReview', {
      datas,
      date,
      comment,
      orderId: data.id,
      orderType: data.type,
      activityName: data.activity?.name,
    })
  }, [
    mapOrderItems,
    orderItems,
    data.vendor,
    data.id,
    data.type,
    data.activity?.name,
    navigation,
    date,
    comment,
  ])

  return {
    control,
    errors,
    comment,
    orderItems,
    dialogOpen,
    isLoading,
    isLoadingValidate,
    updateItem,
    updateChildrenQty,
    toggleConfirmOrderDialog,
    onPressConfirmOrder,
    onPressReviewOrder,
    onPressValidateOrder,
    handleDateChange,
    formattedDate,
  }
}
