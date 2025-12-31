import { useEffect, useMemo, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { useLanguage } from '@/i18n/useLanguage'
import { OrderStocksDetailsParams } from '@/models/order/OrderDetail'
import { useGetStocksDetailsOrderQuery } from '@/services/apis'
import { useGetStocksQuery } from '@/services/apis/inventory.api'
import { setAllocatedDraft, setAllocatedOrderItem } from '@/services/features'
import {
  allocateState,
  useAppDispatch,
  useAppSelector,
  workspaceState,
} from '@/services/store'
import { showError } from '@/utils/CommonUtils'
import { useAllocatedOrder } from './useAllocatedOrder'

export function useAllocatedDetailOrder(detail: any, data: any) {
  const [isOpenInfoModal, setIsOpenInfoModal] = useState(false)
  const [isActivitySheetOpen, setIsActivitySheetOpen] = useState(false)
  const [stockListData, setStockListData] = useState<any[]>([])
  const [activityStockData, setActivityStockData] = useState<any[]>([])
  const [additionalStockDetails, setAdditionalStockDetails] = useState<any[]>(
    []
  )
  const { t } = useLanguage()

  const { selectedWorkspace } = useAppSelector(workspaceState)
  const { allocatedDraft, allocatedOrderItem } = useAppSelector(allocateState)
  const specificAllocatedOrderItem =
    allocatedOrderItem[detail.id]?.[data.material.id]

  const navigation = useNavigation()
  const dispatch = useAppDispatch()

  const { control, setValue, form, watch } = useAllocatedOrder(detail, data)

  const isMaterialSensitive = data?.material?.is_temperature_sensitive === 1
  const isBatch = data?.material?.is_managed_in_batch === 1
  const isHierarchy = !!selectedWorkspace?.config.material.is_hierarchy_enabled

  const queryParamsDetails = useMemo<OrderStocksDetailsParams>(
    () => ({
      entity_id: String(selectedWorkspace?.entity_id ?? 1),
      group_by: 'activity_material',
      only_have_qty: '1',
      activity_id: String(detail.activity.id),
      ...(isHierarchy
        ? { parent_material_id: String(data.material.id) }
        : { material_id: String(data.material.id) }),
    }),
    [
      selectedWorkspace?.entity_id,
      detail.activity.id,
      isHierarchy,
      data.material.id,
    ]
  )

  const materialIds = detail.order_items
    .map((item: any) => item.material.id)
    .join(',')

  const { data: stockCustomerData, isLoading } =
    useGetStocksDetailsOrderQuery(queryParamsDetails)

  const queryParamsEntities = useMemo(
    () => ({
      entity_id: selectedWorkspace?.entity_id,
      activity_id: detail.activity.id,
      material_level_id: isHierarchy ? 2 : 3,
      material_id: materialIds,
      with_details: 1,
    }),
    [selectedWorkspace?.entity_id, detail.activity.id, isHierarchy, materialIds]
  )

  const {
    data: materialList,
    isLoading: isLoadingMaterial,
    isFetching: isFetchingMaterial,
  } = useGetStocksQuery(queryParamsEntities)

  const filteredStockCustomer = useMemo(() => {
    return stockCustomerData?.data?.find(
      (item: any) => item.activity.id === detail.activity.id
    )
  }, [stockCustomerData?.data, detail.activity.id])

  const filteredActivityStocks = useMemo(() => {
    return (
      stockCustomerData?.data?.filter(
        (item: any) => item.activity.id !== detail.activity.id
      ) || []
    )
  }, [stockCustomerData?.data, detail.activity.id])

  const mergedStocksWithDraft = useMemo(() => {
    const existingAllocations = data.orderAllocations?.[0]?.allocations || []

    return (filteredStockCustomer?.stocks || []).map((stock: any) => {
      const matched = existingAllocations.find(
        (a: any) => a.stock_id === stock.id
      )
      return matched
        ? {
            ...stock,
            draft_allocated_qty: matched.allocated_qty,
            draft_material_status: matched.material_status,
          }
        : stock
    })
  }, [filteredStockCustomer?.stocks, data.orderAllocations])

  useEffect(() => {
    setStockListData(mergedStocksWithDraft)
    setActivityStockData(filteredActivityStocks)
  }, [mergedStocksWithDraft, filteredActivityStocks])

  const handleSelectStockFromOtherActivity = (item: any) => {
    if (item.details && item.details.length > 0) {
      const filteredDetails =
        isHierarchy && data?.children?.length > 0
          ? item.details.filter((detail: any) =>
              data.children.some(
                (child: any) => child.material?.id === detail.material?.id
              )
            )
          : item.details

      const detailsWithActivity = filteredDetails.map((detail: any) => ({
        ...detail,
        activity: item.activity,
      }))
      setAdditionalStockDetails((prevDetails) => {
        return [...prevDetails, ...detailsWithActivity]
      })

      // Remove the item that has been selected from activityStockData
      setActivityStockData((prevActivityStockData) => {
        return prevActivityStockData.filter(
          (activityStock) => activityStock?.activity?.id !== item.activity.id
        )
      })
    }
    setIsActivitySheetOpen(false)
  }

  const isValidQty = (qty: any) => {
    return qty !== undefined && qty !== null && qty !== ''
  }

  const isValidStatus = (status: any) => {
    return status !== undefined && status !== null && status !== ''
  }

  const isAllocationValid = (allocation: any) => {
    if (!isValidQty(allocation.draft_allocated_qty)) return false
    if (!isMaterialSensitive) return true
    return isValidStatus(allocation.draft_order_stock_status)
  }

  const hasChildWithValidAllocation = (child: any) => {
    return (child.allocations || []).some((element: any) =>
      isAllocationValid(element)
    )
  }

  const hasValidAllocation = (orderItems: any[]) => {
    if (!orderItems?.length) return false
    return orderItems.some((item: any) =>
      (item.children || []).some((element: any) =>
        hasChildWithValidAllocation(element)
      )
    )
  }

  // Helper function to merge child allocations
  const mergeChildAllocations = (
    formChild: any,
    childIndex: number,
    storedChildren: any[]
  ) => {
    const formAllocations = formChild.allocations || []
    const storedAllocations = storedChildren[childIndex]?.allocations || []

    // Ambil semua stock_id yang sudah ada di form
    const formStockIds = new Set(formAllocations.map((a: any) => a.stock_id))

    // Ambil alokasi dari stored yang belum ada di form
    const mergedAllocations = [
      ...formAllocations,
      ...storedAllocations.filter(
        (storedAlloc: any) =>
          storedAlloc.stock_id && !formStockIds.has(storedAlloc.stock_id)
      ),
    ]

    return {
      ...formChild,
      allocations: mergedAllocations,
    }
  }

  // Helper function to process child allocations
  const processChildAllocations = (child: any, materialMap: Map<any, any>) => {
    const childAllocations = child?.allocations || []

    const totalQty = childAllocations.reduce(
      (total: number, allocation: any) => {
        return total + (Number(allocation.draft_allocated_qty) || 0)
      },
      0
    )

    const validChildAllocations = childAllocations.filter(
      (allocation: any) =>
        allocation.draft_allocated_qty &&
        allocation.draft_order_stock_status_id &&
        allocation.stock_id &&
        allocation.material_child_id &&
        allocation.material_parent_id
    )

    for (const allocation of validChildAllocations) {
      addAllocationToMaterialMap(allocation, materialMap)
    }

    return totalQty
  }

  const addAllocationToMaterialMap = (
    allocation: any,
    materialMap: Map<any, any>
  ) => {
    const materialId = allocation.material_child_id
    const material = allocation.material
    const draftOrderStockStatus = allocation.draft_order_stock_status

    if (!materialMap.has(materialId)) {
      materialMap.set(materialId, {
        total_allocated_qty: 0,
        material: material,
        stock: [],
      })
    }

    const materialData = materialMap.get(materialId)
    materialData.total_allocated_qty +=
      Number(allocation.draft_allocated_qty) || 0
    materialData.stock.push({
      draft_allocated_qty: allocation.draft_allocated_qty,
      draft_order_stock_status_id: allocation.draft_order_stock_status_id,
      stock_id: allocation.stock_id,
      material_child_id: allocation.material_child_id,
      material_parent_id: allocation.material_parent_id,
      draft_order_stock_status: draftOrderStockStatus,
      stock: allocation.stock,
    })
  }

  const mergeOrderItems = (formItems: any[] = [], storedItems: any[] = []) => {
    return formItems.map((formItem: any, index: number) => {
      const formChildren = formItem.children || []
      const storedChildren = storedItems[index]?.children || []

      const mergedChildren = formChildren.map(
        (formChild: any, childIndex: number) => {
          return mergeChildAllocations(formChild, childIndex, storedChildren)
        }
      )

      return {
        ...formItem,
        children: mergedChildren,
      }
    })
  }

  const orderItemsToProcess = mergeOrderItems(
    form.order_items || [],
    specificAllocatedOrderItem || []
  )

  const handleSaveAllocateStock = () => {
    if (hasValidAllocation(orderItemsToProcess)) {
      const transformOrderItems = (orderItems: any[]) => {
        if (!orderItems || orderItems.length === 0) return null

        let total_draft_allocated_qty = 0
        const materialMap = new Map()

        for (const item of orderItems) {
          if (!item) continue

          for (const child of item.children || []) {
            total_draft_allocated_qty += processChildAllocations(
              child,
              materialMap
            )
          }
        }

        if (materialMap.size === 0) return null
        const orderId = detail.id
        return {
          // parent data
          order_id: orderId,
          material_id: data.material.id,
          material_name: data.material.name,
          is_managed_in_batch: data.material.is_managed_in_batch,
          total_draft_allocated_qty,

          // children data
          qty: data.qty,
          recommended_stock: data.recommended_stock,
          children: [...materialMap.values()],
        }
      }

      const transformedData = transformOrderItems(orderItemsToProcess)
      if (transformedData) {
        dispatch(
          setAllocatedOrderItem({
            orderId: detail.id,
            materialId: data.material.id,
            data: orderItemsToProcess,
          })
        )

        dispatch(setAllocatedDraft(transformedData))
        navigation.navigate('AllocatedOrder', { data: detail })
      }
    } else {
      showError(t('error.complete_data'))
    }
  }

  return {
    formControl: {
      control,
      setValue,
      form,
      watch,
    },
    uiState: {
      isOpenInfoModal,
      isActivitySheetOpen,
      stockListData,
      activityStockData,
      setIsActivitySheetOpen,
    },
    actions: {
      handleOpenInfoModal: () => setIsOpenInfoModal(true),
      handleCloseInfoModal: () => setIsOpenInfoModal(false),
      handleSelectStockFromOtherActivity,
      handleSaveAllocateStock,
    },
    datas: {
      draftData: allocatedDraft,
      mergedStocksWithDraft,
      filteredStockCustomer,
      filteredActivityStocks,
      materialList: materialList?.data || [],
      additionalStockDetails,
    },
    status: {
      isMaterialSensitive,
      isBatch,
      isHierarchy,
      isLoading,
      isLoadingMaterial,
      isFetchingMaterial,
    },
    t,
  }
}
