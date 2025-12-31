import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm } from 'react-hook-form'
import { useToolbar } from '@/components/toolbar/hooks/useToolbar'
import { useLanguage } from '@/i18n/useLanguage'
import { useReceiveOrderMutation } from '@/services/apis'
import { useAppSelector, authState, workspaceState } from '@/services/store'
import { showSuccess, showError } from '@/utils/CommonUtils'
import { DATE_FILTER_FORMAT } from '@/utils/Constants'
import { dateToString, stringToDate } from '@/utils/DateFormatUtils'
import { showFormattedError } from '@/utils/helpers/ErrorHelpers'
import { ReceivedOrderSchema } from '../schema/ReceivedOrderSchema'

// Type definitions with proper union for hierarchy vs flat items
interface ReceiveItem {
  stock_id: number
  allocated_qty?: number
  received_qty?: number
  order_stock_status_id?: number | null
  material_status?: number | null
}

interface OrderItemChild {
  id: number
  receives?: ReceiveItem[]
}

interface HierarchyOrderItem {
  id: number
  children: OrderItemChild[]
  receives?: never
}

interface FlatOrderItem {
  id: number
  receives: ReceiveItem[]
  children?: never
}

// Helper functions extracted to reduce nesting
const mapOrderStock = (stock) => ({
  stock_id: stock.stock_id,
  allocated_qty: stock.allocated_qty ?? 0,
  received_qty: stock.received_qty ?? 0,
  order_stock_status_id: stock.order_stock_status_id ?? null,
})

const mapReceiveStock = (receive) => ({
  stock_id: receive.stock_id,
  allocated_qty: receive.allocated_qty ?? 0,
  received_qty: receive.received_qty,
  order_stock_status_id: receive.order_stock_status_id ?? null,
})

const mapChildren = (children) =>
  children?.map((child) => ({
    id: child.id,
    receives: child?.order_stocks?.map(mapOrderStock),
  }))

const mapOrderItemsHierarchy = (order_items) =>
  order_items?.map((item) => ({
    id: item.id,
    children: mapChildren(item.children),
  }))

const mapOrderItemsFlat = (order_items) =>
  order_items?.map((item) => ({
    id: item.id,
    receives: item.order_stocks.map((stock) => ({
      stock_id: stock.stock_id,
      allocated_qty: stock.allocated_qty ?? 0,
      received_qty: stock.received_qty ?? 0,
      material_status: stock.material_status ?? null,
    })),
  }))

// Simplified validation helpers to reduce cognitive complexity
const checkReceiveValidation = (
  receive: ReceiveItem,
  alloc: number,
  recv: number
) => {
  const isPartialOrOver =
    (recv > 0 && alloc > 0 && recv < alloc) || recv > alloc
  const isIncomplete =
    alloc > 0 &&
    (receive?.received_qty === undefined ||
      receive?.received_qty === null ||
      receive?.received_qty.toString() === '')
  const isNonZero = recv > 0

  return { isPartialOrOver, isIncomplete, isNonZero }
}

const validateReceives = (receives: ReceiveItem[]) => {
  let hasPartialOrOver = false
  let hasIncomplete = false
  const hasAnyReceives = receives.length > 0
  let allZero = receives.length > 0

  for (const receive of receives) {
    const alloc = Number(receive?.allocated_qty ?? 0)
    const recv = Number(receive?.received_qty ?? 0)

    const validation = checkReceiveValidation(receive, alloc, recv)

    if (validation.isPartialOrOver) hasPartialOrOver = true
    if (validation.isIncomplete) hasIncomplete = true
    if (validation.isNonZero) allZero = false
  }

  return {
    hasPartialOrOver,
    hasIncomplete,
    hasAllZero: allZero,
    hasAnyReceives,
  }
}

// Extracted validation functions to reduce nesting
const validateHierarchyItem = (item: HierarchyOrderItem) => {
  let hasPartialOrOver = false
  let hasIncomplete = false
  let hasAllZero = false
  let hasAnyReceives = false

  for (const child of item.children) {
    const receives = child.receives ?? []
    const validation = validateReceives(receives)

    if (validation.hasPartialOrOver) hasPartialOrOver = true
    if (validation.hasIncomplete) hasIncomplete = true
    if (validation.hasAllZero) hasAllZero = true
    if (validation.hasAnyReceives) hasAnyReceives = true
  }

  return { hasPartialOrOver, hasIncomplete, hasAllZero, hasAnyReceives }
}

const validateFlatItem = (item: FlatOrderItem) => {
  const receives = item.receives ?? []
  return validateReceives(receives)
}

// Simple aggregation function
const aggregateValidationResults = (results) => {
  return results.reduce(
    (acc, result) => ({
      hasPartialOrOver: acc.hasPartialOrOver || result.hasPartialOrOver,
      hasIncomplete: acc.hasIncomplete || result.hasIncomplete,
      hasAllZero: acc.hasAllZero || result.hasAllZero,
      hasAnyReceives: acc.hasAnyReceives || result.hasAnyReceives,
    }),
    {
      hasPartialOrOver: false,
      hasIncomplete: false,
      hasAllZero: false,
      hasAnyReceives: false,
    }
  )
}

const isHierarchyItem = (item) => {
  return (
    'children' in item &&
    Array.isArray(item.children) &&
    item.children.length > 0
  )
}

const buildHierarchyOrderItem = (item) => ({
  id: item.id,
  children: item?.children?.map((child) => ({
    id: child.id,
    receives: child?.receives?.map(mapReceiveStock),
  })),
})

const buildNonHierarchyOrderItem = (item) => ({
  id: item.id,
  receives: item?.receives?.map(mapReceiveStock),
})

const buildPayload = (form, isChildren, orderId) => {
  const base = {
    id: orderId,
    fulfilled_at: form.fulfilled_at,
    comment: form.comment,
  }

  const order_items = isChildren
    ? form.order_items.map((element) => buildHierarchyOrderItem(element))
    : form.order_items.map((element) => buildNonHierarchyOrderItem(element))

  return { ...base, order_items }
}

export function useReceiveOrder({ navigation, route }) {
  const { data, orderId } = route.params
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const { user } = useAppSelector(authState)
  const { selectedWorkspace } = useAppSelector(workspaceState)

  const isHierarchy =
    selectedWorkspace?.config?.material?.is_hierarchy_enabled ?? false

  const isChildren = useMemo(() => {
    if (!data?.order_items) return false
    return data.order_items.some(
      (item: any) => Array.isArray(item.children) && item.children.length > 0
    )
  }, [data?.order_items])

  const { t } = useLanguage()
  const flatListRef = useRef(null)
  const commentInputRef = useRef(null)

  const [receiveOrder, { isLoading }] = useReceiveOrderMutation()

  useToolbar({ title: `${t('button.received_order')}: ${orderId}` })

  const {
    control,
    setValue,
    watch,
    formState: { errors },
    setError,
    reset,
  } = useForm({
    mode: 'onSubmit',
    resolver: yupResolver(ReceivedOrderSchema()),
    defaultValues: { fulfilled_at: '', comment: '', order_items: [] },
  })

  const form = watch()

  const actualReceiptDate = useMemo(
    () => (form.fulfilled_at ? stringToDate(form.fulfilled_at) : undefined),
    [form.fulfilled_at]
  )

  // Simplified validation with minimal cognitive complexity
  const validationResults = (() => {
    const currentItems = form?.order_items ?? []

    const results = currentItems.map((item) => {
      return isHierarchyItem(item)
        ? validateHierarchyItem(item as unknown as HierarchyOrderItem)
        : validateFlatItem(item as FlatOrderItem)
    })

    const aggregated = aggregateValidationResults(results)

    return {
      ...aggregated,
      hasAllZero: aggregated.hasAnyReceives && aggregated.hasAllZero,
    }
  })()

  const hasPartialOrOver = validationResults.hasPartialOrOver
  const hasIncompleteEntries = validationResults.hasIncomplete
  const hasAllZeroQuantities = validationResults.hasAllZero

  const hasUnfilledQuantities =
    hasPartialOrOver || hasAllZeroQuantities || hasIncompleteEntries
  const isReceiveDisabled =
    !actualReceiptDate || hasUnfilledQuantities || isLoading

  const seedHierarchyValues = (data, form) => ({
    fulfilled_at: form.fulfilled_at || '',
    comment: form.comment || '',
    order_items: mapOrderItemsHierarchy(data.order_items),
  })

  const seedFlatValues = (data, form) => ({
    fulfilled_at: form.fulfilled_at || '',
    comment: form.comment || '',
    order_items: mapOrderItemsFlat(data.order_items),
  })

  useEffect(() => {
    if (!data) return

    const initialForm = { fulfilled_at: '', comment: '' }
    const seededValues = isChildren
      ? seedHierarchyValues(data, initialForm)
      : seedFlatValues(data, initialForm)

    reset(seededValues)
  }, [data, isChildren, reset])

  const toggleDialog = useCallback(() => setIsDialogOpen((prev) => !prev), [])

  const handleSubmit = useCallback(async () => {
    toggleDialog()

    if (!form.fulfilled_at) {
      setError('fulfilled_at', {
        type: 'required',
        message: t('validation.required'),
      })
      return
    }

    if (isLoading) return

    try {
      const payload = buildPayload(form, isChildren, orderId)
      const response = await receiveOrder(payload)

      if (response.error) {
        showError(showFormattedError(response.error))
        return
      }

      showSuccess(
        t('order.success_receive_order'),
        'snackbar-success-receive-order'
      )
      navigation.goBack()
    } catch (error) {
      showError(showFormattedError(error))
    }
  }, [
    form,
    isChildren,
    orderId,
    isLoading,
    t,
    navigation,
    receiveOrder,
    setError,
    toggleDialog,
  ])

  const handleDateChange = useCallback(
    (field) => (value) => {
      setValue(field, dateToString(value, DATE_FILTER_FORMAT))
    },
    [setValue]
  )

  return {
    data,
    orderId,
    user,
    control,
    errors,
    form,
    isDialogOpen,
    toggleDialog,
    onConfirmReceiveOrder: handleSubmit,
    isLoading,
    flatListRef,
    commentInputRef,
    actualReceiptDate,
    handleDateChange,
    t,
    setValue,
    isHierarchy,
    isReceiveDisabled,
  }
}
