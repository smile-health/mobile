import {
  CreateOrderRequest,
  CreateOrderResponse,
  CreateRelocationRequest,
  GetOrderFilters,
  OrderAllResponse,
  OrderReasonOptionResponse,
  OrderStatusCountParams,
  OrderStatusResponse,
  OrderWithEntityParams,
  OrderWithEntityResponse,
} from '@/models'
import {
  CreateDistributionPayload,
  CreateDistributionResponse,
} from '@/models/order/Distribution'
import {
  AllocateOrderPayload,
  CancelOrderPayload,
  ConfirmOrderPayload,
  FulFilledOrderPayload,
  ReasonOrderParams,
  ShipOrderPayload,
  ValidateOrderPayload,
} from '@/models/order/OrderActions'
import {
  OrderDetailParams,
  OrderDetailResponse,
  OrderStocksDetailsParams,
} from '@/models/order/OrderDetail'
import { OrderItemStocksRequest } from '@/models/order/OrderItem'
import {
  OrderCancelReasonsResponse,
  TransformCancelReason,
} from '@/models/order/Reason'
import { PaginateParam } from '@/models/Paginate'
import { ORDER_REASON_TYPE, ORDER_STATUS, ORDER_TYPE } from '@/utils/Constants'
import api from '../api'

const buildOrderListQuery = (params: GetOrderFilters) => ({
  url: 'main/orders',
  params,
})

export const orderApi = api.injectEndpoints({
  overrideExisting: true,
  endpoints: (build) => ({
    getOrderList: build.query<OrderAllResponse, GetOrderFilters>({
      query: buildOrderListQuery,
      merge: (currentCache, newItems, { arg }) => {
        if (arg.page === 1) {
          return newItems
        }

        return { ...newItems, data: [...currentCache.data, ...newItems.data] }
      },
      transformResponse: (response: OrderAllResponse) => {
        const uniqueData = response.data.filter(
          (item, index, self) =>
            index === self.findIndex((t) => t.id === item.id)
        )

        return { ...response, data: uniqueData }
      },
    }),
    getOrderListWithEntity: build.query<
      OrderWithEntityResponse,
      OrderWithEntityParams
    >({
      query: (params) => ({
        url: 'main/orders',
        params: {
          ...params,
          purpose: 'purchase',
          status_ids: `${ORDER_STATUS.SHIPPED},${ORDER_STATUS.FULFILLED}`,
          type_ids: `${ORDER_TYPE.REQUEST},${ORDER_TYPE.DISTRIBUTION},${ORDER_TYPE.CENTRAL_DISTRIBUTION}`,
        },
      }),
    }),
    getOrderStatusCount: build.query<
      OrderStatusResponse,
      OrderStatusCountParams
    >({
      query: (params) => ({
        url: 'main/orders/counts',
        params,
      }),
    }),
    getOrderDetail: build.query<OrderDetailResponse, OrderDetailParams>({
      query: ({ id, ...params }) => ({
        url: `main/orders/${id}`,
        params,
      }),
    }),
    getStocksDetailsOrder: build.query<any, OrderStocksDetailsParams>({
      query: (params) => ({
        url: 'main/stocks/details',
        params,
      }),
    }),
    getOrderCancelReasons: build.query<TransformCancelReason[], PaginateParam>({
      query: (params) => ({
        url: 'main/order-cancel-reasons',
        params,
      }),
      transformResponse: (response: OrderCancelReasonsResponse) =>
        response.data.map((item) => ({
          reason_id: item.id,
          value: item.name,
        })),
    }),
    createOrder: build.mutation<CreateOrderResponse, CreateOrderRequest>({
      query: (data) => ({
        url: 'main/orders/request',
        method: 'POST',
        data,
      }),
    }),
    editOrderItemStocks: build.mutation<any, OrderItemStocksRequest>({
      query: ({ id, ...data }) => ({
        url: `main/orders/${id}/order-item-stocks`,
        method: 'PUT',
        data,
      }),
    }),
    createOrderItemStocks: build.mutation<any, OrderItemStocksRequest>({
      query: ({ id, ...data }) => ({
        url: `main/orders/${id}/order-item-stocks`,
        method: 'POST',
        data,
      }),
    }),
    cancelOrder: build.mutation<any, CancelOrderPayload>({
      query: ({ id, ...data }) => ({
        url: `main/orders/${id}/cancel`,
        method: 'PUT',
        data,
      }),
    }),
    confirmOrder: build.mutation<any, ConfirmOrderPayload>({
      query: ({ id, ...data }) => ({
        url: `main/orders/${id}/confirm`,
        method: 'PUT',
        data,
      }),
    }),
    allocateOrder: build.mutation<any, AllocateOrderPayload>({
      query: ({ id, ...data }) => ({
        url: `main/orders/${id}/allocate`,
        method: 'PUT',
        data,
      }),
    }),
    shipOrder: build.mutation<any, ShipOrderPayload>({
      query: ({ id, ...data }) => ({
        url: `main/orders/${id}/ship`,
        method: 'PUT',
        data,
      }),
    }),
    receiveOrder: build.mutation<any, FulFilledOrderPayload>({
      query: ({ id, ...data }) => ({
        url: `main/orders/${id}/fulfilled`,
        method: 'PUT',
        data,
      }),
    }),
    validateOrder: build.mutation<any, ValidateOrderPayload>({
      query: ({ id, ...data }) => ({
        url: `main/orders/${id}/validate`,
        method: 'PUT',
        data,
      }),
    }),
    createDistribution: build.mutation<
      CreateDistributionResponse,
      CreateDistributionPayload
    >({
      query: (data) => ({
        url: 'main/orders/distribution',
        method: 'POST',
        data,
      }),
    }),
    createReturn: build.mutation<
      CreateDistributionResponse,
      CreateDistributionPayload
    >({
      query: (data) => ({
        url: 'main/orders/return',
        method: 'POST',
        data,
      }),
    }),
    createRelocation: build.mutation<
      CreateOrderResponse,
      CreateRelocationRequest
    >({
      query: (data) => ({
        url: 'main/orders/relocation',
        method: 'POST',
        data,
      }),
    }),
    getOrderReasons: build.query<OrderReasonOptionResponse, ReasonOrderParams>({
      query: (params) => ({
        url: 'main/order-reasons',
        params: {
          ...params,
          order_type: params.order_type || ORDER_REASON_TYPE.REQUEST,
        },
      }),
    }),
  }),
})

export const {
  useGetOrderListQuery,
  useGetOrderListWithEntityQuery,
  useGetOrderStatusCountQuery,
  useGetOrderDetailQuery,
  useGetStocksDetailsOrderQuery,
  useGetOrderCancelReasonsQuery,
  useCreateOrderMutation,
  useEditOrderItemStocksMutation,
  useCreateOrderItemStocksMutation,
  useCancelOrderMutation,
  useConfirmOrderMutation,
  useAllocateOrderMutation,
  useShipOrderMutation,
  useReceiveOrderMutation,
  useCreateDistributionMutation,
  useCreateReturnMutation,
  useCreateRelocationMutation,
  useGetOrderReasonsQuery,
  useValidateOrderMutation,
  useLazyGetOrderReasonsQuery,
} = orderApi
