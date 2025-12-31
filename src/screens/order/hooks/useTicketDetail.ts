import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Linking } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { UpdateEventReportRequest } from '@/models/order/EventReportDetail'
import { TicketMaterial, TicketBatch } from '@/models/order/Ticket'
import { API_TIMEOUT_MS } from '@/services/api.constant'
import {
  useGetEventReportDetailQuery,
  useUpdateEventReportMutation,
} from '@/services/apis/event-report-detail.api'
import { showError } from '@/utils/CommonUtils'

function createBatchFromItem(item: any): TicketBatch | null {
  if (!item.batch_code) return null

  return {
    batch_code: item.batch_code,
    expired_date: item.expired_date,
    qty: item.qty,
    reason: item.reason,
    detail_reason: item.detail_reason ?? item.child_reason ?? '',
  }
}

function createMaterialKey(item: any): string {
  return item.material_name || `custom-${item.custom_material || item.id}`
}

function createMaterialObject(
  item: any,
  hasBatch: boolean,
  batch: TicketBatch | null
): TicketMaterial {
  return {
    id: item.material_id ?? item.id,
    material_name: item.material_name ?? null,
    custom_material: item.custom_material ?? null,
    name: item.material_name ?? item.custom_material ?? '-',
    is_managed_in_batch: hasBatch,
    qty: item.qty,
    batches: hasBatch && batch ? [batch] : [],
    doNumber: item.do_number,
    arrivalDate: item.arrived_date,
    isSubmitted: item.has_order ?? 0,
    updatedAt: item.updated_at,
    batch_code: item.batch_code,
    reason: hasBatch ? undefined : item.reason,
    detail_reason: hasBatch
      ? undefined
      : (item.detail_reason ?? item.child_reason ?? ''),
    child_reason: hasBatch ? undefined : item.child_reason,
  }
}

function updateMaterialWithBatch(
  material: TicketMaterial,
  batch: TicketBatch
): void {
  material.batches = material.batches || []
  material.batches.push(batch)

  material.qty = material.batches.reduce((sum, b) => sum + (b.qty || 0), 0)
}

export function mapItemsToTicketMaterials(items: any[]): TicketMaterial[] {
  const materialMap = new Map<string, TicketMaterial>()

  for (const item of items) {
    const key = createMaterialKey(item)
    const hasBatch = !!item.batch_code
    const batch = createBatchFromItem(item)

    if (materialMap.has(key)) {
      const material = materialMap.get(key)!

      if (hasBatch && batch) {
        updateMaterialWithBatch(material, batch)
      }
    } else {
      materialMap.set(key, createMaterialObject(item, hasBatch, batch))
    }
  }

  return [...materialMap.values()]
}

export function useTicketDetail(id: number) {
  const navigation = useNavigation()
  const [isLoadingState, setIsLoadingState] = useState(false)
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null)

  const {
    data: ticketDetail,
    isLoading: isLoadingQuery,
    error,
    refetch: originalRefetch,
  } = useGetEventReportDetailQuery(id)

  const [updateEventReport, { isLoading: isUpdatingQuery }] =
    useUpdateEventReportMutation()

  const isLoading = isLoadingState || isLoadingQuery
  const isUpdating = isLoadingState || isUpdatingQuery

  const handleViewOrderDetail = useCallback(() => {
    if (ticketDetail?.order_id) {
      navigation.navigate('OrderDetail', {
        id: ticketDetail.order_id,
        preview: true,
      })
    }
  }, [navigation, ticketDetail?.order_id])

  const handleViewPackingSlip = useCallback(() => {
    if (ticketDetail?.slip_link) {
      Linking.openURL(ticketDetail.slip_link)
    }
  }, [ticketDetail?.slip_link])

  const ensureLoadingTimeout = useCallback(() => {
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current)
    }

    timeoutIdRef.current = setTimeout(() => {
      setIsLoadingState(false)
    }, API_TIMEOUT_MS)

    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current)
        timeoutIdRef.current = null
      }
    }
  }, [setIsLoadingState])

  const refetch = useCallback(async () => {
    try {
      setIsLoadingState(true)
      const cleanupTimeout = ensureLoadingTimeout()

      const result = await originalRefetch()

      setIsLoadingState(false)
      cleanupTimeout()
      return result
    } catch (error) {
      setIsLoadingState(false)
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current)
        timeoutIdRef.current = null
      }
      throw error
    }
  }, [originalRefetch, ensureLoadingTimeout, setIsLoadingState])

  const handleUpdateEventReport = useCallback(
    async (data: UpdateEventReportRequest) => {
      try {
        setIsLoadingState(true)
        const cleanupTimeout = ensureLoadingTimeout()

        const result = await updateEventReport({ id, data }).unwrap()
        await refetch()

        setIsLoadingState(false)
        cleanupTimeout()
        return result
      } catch (error) {
        setIsLoadingState(false)
        if (timeoutIdRef.current) {
          clearTimeout(timeoutIdRef.current)
          timeoutIdRef.current = null
        }
        showError(error)
        return error
      }
    },
    [id, updateEventReport, refetch, ensureLoadingTimeout, setIsLoadingState]
  )

  const handleChangeStatus = useCallback(
    async (statusId: number) => {
      try {
        setIsLoadingState(true)
        const cleanupTimeout = ensureLoadingTimeout()

        await handleUpdateEventReport({
          update_status_id: statusId,
        })

        await refetch()

        setIsLoadingState(false)
        cleanupTimeout()
      } catch (error) {
        setIsLoadingState(false)
        if (timeoutIdRef.current) {
          clearTimeout(timeoutIdRef.current)
          timeoutIdRef.current = null
        }
        showError(error)
      }
    },
    [handleUpdateEventReport, refetch, ensureLoadingTimeout, setIsLoadingState]
  )

  const buttonVisibility = useMemo(() => {
    if (!ticketDetail) {
      return {
        showCancel: false,
        showComplete: false,
      }
    }

    const { status_id } = ticketDetail

    const result = {
      showCancel: status_id === 1 || status_id === 5,
      showComplete: status_id === 5,
    }

    return result
  }, [ticketDetail])

  useEffect(() => {
    if (!isLoadingQuery && isLoadingState) {
      setIsLoadingState(false)
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current)
        timeoutIdRef.current = null
      }
    }
  }, [isLoadingQuery, isLoadingState])

  useEffect(() => {
    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current)
        timeoutIdRef.current = null
      }
    }
  }, [])

  return {
    ticketDetail,
    isLoading,
    error,
    refetch,
    handleViewOrderDetail,
    handleViewPackingSlip,
    handleUpdateEventReport,
    handleChangeStatus,
    buttonVisibility,
    isUpdating,
  }
}
