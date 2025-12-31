import { useMemo } from 'react'
import { useLanguage } from '@/i18n/useLanguage'
import { orderStatusLabel } from '@/utils/Constants'
import { calculateTotalQty } from '@/utils/helpers/material/commonHelper'

export const useOrderItemDetail = (data, orderDetail, selectedWorkspace) => {
  const { t } = useLanguage()

  const isTradeMarkMaterial = data?.children?.length > 0
  const isHierarchy = !!selectedWorkspace?.config.material.is_hierarchy_enabled
  const showSectionHeader = isTradeMarkMaterial && isHierarchy

  const labelText = useMemo(() => {
    return t(orderStatusLabel[orderDetail.status] || '').replace(/^label\./, '')
  }, [orderDetail.status, t])

  const quantities = useMemo(() => {
    const allocatedQty = calculateTotalQty(data.order_stocks, 'allocated_qty', {
      isTradeMarkMaterial: true,
      children: data.children,
    })

    const receivedQty = calculateTotalQty(data.order_stocks, 'received_qty', {
      isTradeMarkMaterial: true,
      children: data.children,
    })

    return {
      orderedQty: data.ordered_qty,
      confirmedQty: data.confirmed_qty,
      allocatedQty,
      shippedQty: orderDetail.shipped_at ? allocatedQty : 0,
      receivedQty,
    }
  }, [
    data.order_stocks,
    data.children,
    data.ordered_qty,
    data.confirmed_qty,
    orderDetail.shipped_at,
  ])

  const entityInfo = useMemo(() => {
    const isVendor = selectedWorkspace?.entity_id === orderDetail.vendor_id
    return {
      entityName: isVendor
        ? orderDetail.customer.name
        : orderDetail.vendor.name,
      entityLabel: isVendor ? t('label.customer') : t('label.vendor'),
    }
  }, [orderDetail, selectedWorkspace?.entity_id, t])

  return {
    t,
    isHierarchy,
    showSectionHeader,
    labelText,
    quantities,
    entityInfo,
  }
}
