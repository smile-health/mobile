import { useMemo } from 'react'
import { OrderDetailResponse } from '@/models/order/OrderDetail'
import { DetailOrderSection } from '@/models/order/OrderDetailSection'
import { ORDER_STATUS } from '@/utils/Constants'

export const useOrderSections = (
  orderDetailData: OrderDetailResponse | undefined
): DetailOrderSection[] => {
  return useMemo(() => {
    if (!orderDetailData) return []

    const sections: DetailOrderSection[] = [
      {
        key: 'items',
        title: 'label.item',
        data: orderDetailData?.order_items || [],
      },
    ]

    if (
      [
        ORDER_STATUS.SHIPPED,
        ORDER_STATUS.FULFILLED,
        ORDER_STATUS.CANCELLED,
      ].includes(orderDetailData?.status)
    ) {
      sections.push({
        key: 'shipment',
        title: 'label.shipment',
        data: [
          {
            id: orderDetailData?.id,
            status: orderDetailData?.status,
            shippedAt: orderDetailData?.shipped_at,
            fulfilledAt: orderDetailData?.fulfilled_at,
          },
        ],
      })
    }

    if (orderDetailData?.order_comments) {
      sections.push({
        key: 'comment',
        title: 'label.comment',
        data: orderDetailData?.order_comments,
      })
    }

    return sections
  }, [orderDetailData])
}
