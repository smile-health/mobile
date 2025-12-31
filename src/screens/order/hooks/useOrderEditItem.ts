import { useMemo, useEffect } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { useAppSelector, workspaceState } from '@/services/store'
import { numberFormat, trimText } from '@/utils/CommonUtils'
import { OrderEditItemSchema } from '../schema/OrderEditItemSchema'

export interface ItemType {
  id: number
  qty: number
  recommended_stock: number
  confirmed_qty: number
  ordered_qty: number
  reason_id?: string
  reason?: { id: string; name: string }
  other_reason: string
  material?: {
    name: string
    consumption_unit_per_distribution_unit: number
  }
  stock_vendor?: {
    total_available_qty?: number
    min?: number
    max?: number
  }
  stock_customer?: {
    total_available_qty?: number
    min?: number
    max?: number
  }
  children?: {
    id: string
    qty?: number
  }[]
}

type OrderEditItemFormField = yup.InferType<
  ReturnType<typeof OrderEditItemSchema>
>

export const useOrderEditItem = (
  item: ItemType,
  index: number,
  updateQuantity?: (index: number, qty: number) => void,
  updateReason?: (index: number, reason: string) => void,
  updateOtherReasonText?: (index: number, reason: string) => void,
  showReasonDropdown: boolean = true,
  type: 'edit' | 'confirm' | 'validate' = 'confirm'
) => {
  const { selectedWorkspace } = useAppSelector(workspaceState)

  const isMaterialHierarchy =
    selectedWorkspace?.config.material.is_hierarchy_enabled
  const isEdit = type === 'edit'
  const isValidate = type === 'validate'

  const stockData = isEdit ? item.stock_customer : item.stock_vendor
  const availableQty = stockData?.total_available_qty ?? null
  const consumptionUnit =
    item.material?.consumption_unit_per_distribution_unit ?? 1

  const defaultValues = useMemo(
    () => ({
      qty: item.qty,
      reason: item?.reason_id ?? item?.reason?.id ?? '',
      other_reason_text: item?.other_reason,
      children:
        item?.children?.map((child) => ({
          id: child.id,
          confirmed_qty: child.qty ?? 0,
        })) || [],
    }),
    [item]
  )

  const {
    control,
    watch,
    formState: { errors },
    setValue,
  } = useForm<OrderEditItemFormField>({
    resolver: yupResolver(OrderEditItemSchema(availableQty, consumptionUnit)),
    mode: 'onChange',
    defaultValues,
  })

  const form = watch()
  const qty = watch('qty')
  const reason = watch('reason')
  const otherReasonText = watch('other_reason_text')

  const numericQty =
    typeof qty === 'string' && qty === '' ? null : Number(qty) || 0
  const recommendedStock = item.recommended_stock

  const min = stockData?.min ?? null
  const max = stockData?.max ?? null

  const isQtyDifferentFromRecommended =
    recommendedStock > 0 && recommendedStock !== numericQty

  const qtyHelperMessage = isQtyDifferentFromRecommended
    ? `Recommended: ${numberFormat(recommendedStock)}`
    : undefined

  const shouldShowReasonDropdown = useMemo(() => {
    return showReasonDropdown && numericQty !== recommendedStock
  }, [showReasonDropdown, numericQty, recommendedStock])

  useEffect(() => {
    updateQuantity?.(index, numericQty)
    updateReason?.(index, reason)
    if (otherReasonText) {
      updateOtherReasonText?.(index, trimText(otherReasonText))
    }

    if (numericQty === recommendedStock) {
      setValue('reason', '')
    }

    if (!reason && item?.reason_id) {
      setValue('reason', item?.reason_id ?? item?.reason?.id ?? '')
    }
  }, [
    numericQty,
    reason,
    index,
    updateQuantity,
    updateReason,
    recommendedStock,
    setValue,
    item?.reason_id,
    item?.reason?.id,
    otherReasonText,
    updateOtherReasonText,
  ])

  const updateChildrenQty = (childIndex: number, value: string) => {
    const children = form.children?.map((child, idx) =>
      idx === childIndex ? { ...child, confirmed_qty: Number(value) } : child
    )

    setValue('children', children, { shouldValidate: true })
  }

  return {
    control,
    watch,
    qty,
    errors,
    qtyHelperMessage,
    shouldShowReasonDropdown,
    availableQty,
    min,
    max,
    reason,
    otherReasonText,
    isMaterialHierarchy,
    updateChildrenQty,
    isEdit,
    isValidate,
  }
}
