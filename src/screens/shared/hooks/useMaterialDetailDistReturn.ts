import { useEffect, useMemo, useCallback, useState } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm, useWatch } from 'react-hook-form'
import i18n from '@/i18n'
import { Activity } from '@/models'
import { StockDetail } from '@/models/shared/Material'
import { materialDetailDistReturnBaseSchema } from '@/screens/order/schema/MaterialDetailDistReturnBaseSchema'
import { QuantityByStockForm } from '@/screens/order/types/order'
import { useGetStocksDetailsOrderQuery } from '@/services/apis'
import { getActivities, setOrder, setOrderMaterials } from '@/services/features'
import {
  useAppDispatch,
  useAppSelector,
  ordersState,
  workspaceState,
  activityState,
} from '@/services/store'
import { showError } from '@/utils/CommonUtils'
import { ORDER_TYPE } from '@/utils/Constants'
import { rehydrateDraftFromStorage } from './useSetOrder'
import { MaterialData } from '../types/MaterialDetail'

export const useMaterialDetailDistReturn = (
  data: MaterialData,
  consumptionUnit: number,
  addedStocks: MaterialData['stocks'],
  baseSectionData,
  navigation
) => {
  const dispatch = useAppDispatch()
  const { selectedWorkspace } = useAppSelector(workspaceState)
  const { activeActivity } = useAppSelector(activityState)
  const { orders } = useAppSelector(ordersState)

  const groupBy = 'activity'
  const onlyHaveQty = '1'

  const { data: stockByActivity } = useGetStocksDetailsOrderQuery({
    entity_id: String(selectedWorkspace?.entity_id),
    group_by: groupBy,
    material_id: String(data.id),
    only_have_qty: onlyHaveQty,
  })

  const shouldRehydrate = (orders, materialId) =>
    !orders.some((o) => o.material_id === materialId)

  useEffect(() => {
    if (shouldRehydrate(orders, data.id)) {
      rehydrateDraftFromStorage(data.program_id, dispatch)
    }
  }, [data.id, data.program_id, dispatch, orders])

  const draftItem = useMemo(() => {
    return orders.find((item) => item.material_id === data.id)
  }, [orders, data.id])

  const getFormatBatch = (stock, draftItem) => {
    const matchedDraft = draftItem?.data?.find(
      (d) => d.stock_id === stock.stock_id
    )
    return {
      quantity: matchedDraft?.allocated?.toString() ?? '',
      stock_quality_id: matchedDraft?.stock_quality_id ?? null,
    }
  }

  const stocks = useMemo(
    () =>
      data.stocks.map((s) => s.stock_id).filter(Boolean) as unknown as string[],
    [data.stocks]
  )

  const defaultValues: QuantityByStockForm = {
    quantityByStock: Object.fromEntries(
      data.stocks.map((s) => [s.stock_id, { ...getFormatBatch(s, draftItem) }])
    ),
    resultPayload: [],
  }
  const schema = useMemo(
    () => materialDetailDistReturnBaseSchema(stocks, consumptionUnit),
    [stocks, consumptionUnit]
  )

  const methods = useForm<QuantityByStockForm>({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues,
  })

  const { control, setValue, clearErrors } = methods
  const quantityByStock = useWatch({ control, name: 'quantityByStock' })
  const [selectedStockId, setSelectedStockId] = useState<string | null>(null)
  const [transformed, setTransformed] = useState<
    QuantityByStockForm['resultPayload']
  >([])
  const [orderDraft, setOrderDraft] = useState<{
    data: Array<{ activity_id: number }>
  } | null>(null)
  const [activityIds, setActivityIds] = useState<number[]>([
    activeActivity?.id ?? 0,
  ])
  const [isOpenActivityBottomSheet, setIsOpenActivityBottomSheet] =
    useState(false)

  const handleToggleBatch = useCallback((stockId: string) => {
    setSelectedStockId((prev) => (prev === stockId ? null : stockId))
  }, [])

  const activities = useAppSelector((state) =>
    getActivities(state, 'origin_activities')
  )

  const filteredSelectedStock = data.stocks.find(
    (item) => item.activity_id === activeActivity?.id
  )

  const findActivityById = (activities: Activity[], activityId: number) => {
    return activities.find((activity) => activity.id === activityId)
  }

  const enrichedStocks = data.stocks
    .filter((stock) => {
      const isInAddedStocks = addedStocks.some(
        (s) => s.stock_id === stock.stock_id
      )
      const isFilteredSelected =
        stock.activity_id === filteredSelectedStock?.activity_id
      return !isInAddedStocks && !isFilteredSelected
    })
    .map((stock) => {
      const matchedActivity = findActivityById(activities, stock.activity_id)
      return {
        ...stock,
        activity_name: matchedActivity?.name ?? '',
      }
    })

  useEffect(() => {
    if (orderDraft?.data?.length) {
      const _activityIds = orderDraft.data
        .map((item) => item.activity_id)
        .filter(Boolean)
      if (_activityIds.length > 0) {
        setActivityIds(_activityIds)
      }
    }
  }, [orderDraft])

  useEffect(() => {
    if (!quantityByStock) return

    const allStockIds = new Set([
      ...data.stocks.map((s) => s.stock_id),
      ...Object.keys(quantityByStock).map(Number),
    ])

    const transformedResult = [...allStockIds]
      .map((stockId) => {
        const stock = data.stocks.find((s) => s.stock_id === stockId) || {
          stock_id: stockId,
          material_id: data.id,
          activity_id: 0,
          qty: 0,
          allocated: 0,
          stock_quality_id: null,
          in_transit: 0,
          available: 0,
          open_vial: 0,
          year: null,
          price: 0,
          total_price: 0,
          budget_source_id: null,
          created_by: null,
          updated_by: null,
          created_at: '',
          updated_at: '',
          batch: {},
          budget_source: {},
          is_temperature_sensitive: 0,
        }
        return stock
      })
      .filter((stock) => {
        const stockId = stock.stock_id
        const qty = quantityByStock[stockId].quantity
        const numericQty = Number(qty)
        return stockId && qty !== '' && qty !== '0' && numericQty > 0
      })
      .map((stock) => {
        const matchedActivity = activities.find(
          (activity) => activity.id === stock.activity_id
        )
        const rawQty = quantityByStock[stock.stock_id].quantity
        const rawStockQualityId =
          quantityByStock[stock.stock_id].stock_quality_id

        const allocated = Number(rawQty)
        return {
          ...stock,
          activity_name: matchedActivity?.name ?? '',
          allocated,
          stock_quality_id: rawStockQualityId,
          material_companion: data.material_companion,
        }
      })

    const totalOrderedQty = transformedResult.reduce((sum, item) => {
      return sum + item.allocated
    }, 0)

    const draftData = {
      material_id: data.id,
      material_name: data.name,
      ordered_qty: totalOrderedQty,
      reason_id: data.reason_id,
      material_companion: data.material_companion,
      is_managed_in_batch: data.is_managed_in_batch,
      data: transformedResult ?? [],
    }

    setOrderDraft(draftData)
    setTransformed(transformedResult)
  }, [quantityByStock, data, activities])

  const sectionData = useMemo(() => {
    return baseSectionData.map((section) => ({
      ...(section.title ? { title: section.title } : {}),
      data: section.data
        .filter((stock) => activityIds.includes(stock.activity_id))
        .map((stock) => {
          const matchedActivity = findActivityById(
            activities,
            stock.activity_id
          )
          const key = String(stock.stock_id)
          const orderCount = quantityByStock[key]?.quantity ?? ''

          return {
            ...stock,
            activity_name: matchedActivity?.name ?? '',
            orderCount,
          }
        }),
    }))
  }, [baseSectionData, activityIds, activities, quantityByStock])

  const handleSubmit = () => {
    if (transformed.length > 0) {
      dispatch(
        setOrder({
          programId: selectedWorkspace?.id ?? 1,
          orderTypeId: ORDER_TYPE.DISTRIBUTION,
          orders: orderDraft,
        })
      )
      dispatch(setOrderMaterials(sectionData))
      navigation.goBack()
    } else {
      showError(i18n.t('error.complete_data'))
    }
  }

  const isAnyQtyExceedStock = useMemo(() => {
    return Object.entries(quantityByStock).some(([stockId, qty]) => {
      const stock = data.stocks.find(
        (s) => String(s.stock_id) === String(stockId)
      )
      if (!stock) return false
      return Number(qty) > Number(stock.available)
    })
  }, [quantityByStock, data.stocks])

  const stockOtherActivity = stockByActivity?.data?.filter(
    (stock: StockDetail) => !activityIds.includes(stock.activity.id)
  )

  const handleSelectOtherActivtyStock = (item: StockDetail) => {
    setActivityIds([...activityIds, item.activity.id])
    setIsOpenActivityBottomSheet(false)
  }

  return {
    methods,
    selectedStockId,
    handleToggleBatch,
    transformed,
    setValue,
    clearErrors,
    quantityByStock,
    enrichedStocks,
    orderDraft,
    sectionData,
    handleSubmit,
    isAnyQtyExceedStock,
    stockOtherActivity,
    handleSelectOtherActivtyStock,
    isOpenActivityBottomSheet,
    setIsOpenActivityBottomSheet,
  }
}
