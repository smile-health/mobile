import {
  GetOrderFilters,
  OrderResponse,
  OrderStatusCountParams,
  OrderStatusResponse,
} from '@/models'
import {
  OrderDetailParams,
  OrderDetailResponse,
} from '@/models/order/OrderDetail'
import api from '@/services/api'

export const orderMockApi = api.injectEndpoints({
  endpoints: (build) => ({
    getOrderListMock: build.query<OrderResponse[], GetOrderFilters>({
      query: (params) => ({
        url: 'main/orders',
        params,
      }),
      transformResponse: (response: { data: OrderResponse[] }) => response.data,
    }),
    getOrderStatusCountMock: build.query<
      OrderStatusResponse,
      OrderStatusCountParams
    >({
      query: (params) => ({
        url: 'https://mock.apidog.com/m1/661135-631964-default/orders/counts?apidogApiId=13284793',
        params,
      }),
    }),
    getOrderDetailMock: build.query<OrderDetailResponse, OrderDetailParams>({
      query: ({ id, ...params }) => ({
        url: `https://mock.apidog.com/m1/661135-631964-default/orders/${id}`,
        params,
      }),
    }),
  }),
})

export const {
  useGetOrderListMockQuery,
  useGetOrderStatusCountMockQuery,
  useGetOrderDetailMockQuery,
} = orderMockApi
