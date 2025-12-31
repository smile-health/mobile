import { CreateDisposalShipmentPayload } from '@/models/disposal/CreateDisposalShipment'
import { CreateSelfDisposalRequest } from '@/models/disposal/CreateSelfDisposal'
import {
  DisposalMaterialParams,
  DisposalMaterialResponse,
} from '@/models/disposal/DisposalMaterial'
import {
  DisposalMethod,
  DisposalMethodResponse,
} from '@/models/disposal/DisposalMethod'
import {
  IDisposalShipmentListResponse,
  IDisposalShipmentFilter,
  IDisposalShipmentDetail,
} from '@/models/disposal/DisposalShipmentList'
import {
  CancelDisposalShipmentPayload,
  DisposalShipmentStatusCount,
  ReceiveDisposalShipmentPayload,
  UpdateDisposalShipmentResponse,
} from '@/models/disposal/DisposalShipmentStatus'
import {
  DisposalStockResponse,
  DisposalStockQueryParams,
} from '@/models/disposal/DisposalStock'
import {
  SelfDisposalListParams,
  SelfDisposalListResponse,
} from '@/models/disposal/SelfDisposalList'
import { PaginateParam } from '@/models/Paginate'
import api from '../api'
import { initialPageParam } from '../api.constant'
import { getNextPageParam } from '../helper/api-helper'

export const disposalApi = api.injectEndpoints({
  endpoints: (build) => ({
    getDisposalStock: build.query<
      DisposalStockResponse,
      DisposalStockQueryParams
    >({
      query: (params) => ({
        url: 'main/disposal/stocks/detail',
        method: 'GET',
        params,
      }),
      serializeQueryArgs: ({ queryArgs }) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { page, ...rest } = queryArgs
        return rest
      },
      merge: (currentCache, newItems, { arg }) => {
        if (arg.page === 1) {
          return newItems
        }

        return { ...newItems, data: [...currentCache.data, ...newItems.data] }
      },

      //prevention for duplication, can be removed if performance issued found
      transformResponse: (response: DisposalStockResponse) => {
        const uniqueData = response.data.filter(
          (item, index, self) =>
            index ===
            self.findIndex(
              (t) =>
                t.material_id === item.material_id &&
                t.entity_id === item.entity_id &&
                t.updated_at === item.updated_at
            )
        )

        return { ...response, data: uniqueData }
      },
    }),
    getDisposalMethods: build.query<DisposalMethod[], void>({
      query: () => ({
        url: 'main/disposal/methods',
        method: 'GET',
      }),
      transformResponse: (response: DisposalMethodResponse) => response.data,
    }),
    getDisposalMaterials: build.infiniteQuery<
      DisposalMaterialResponse,
      DisposalMaterialParams,
      PaginateParam
    >({
      infiniteQueryOptions: { initialPageParam, getNextPageParam },
      query: (params) => ({
        url: 'main/disposal/stock',
        method: 'GET',
        params: {
          ...params.pageParam,
          ...params.queryArg,
        },
      }),
    }),
    getSelfDisposalList: build.infiniteQuery<
      SelfDisposalListResponse,
      SelfDisposalListParams,
      PaginateParam
    >({
      infiniteQueryOptions: { initialPageParam, getNextPageParam },
      query: (params) => ({
        url: 'main/disposal/self-disposal',
        method: 'GET',
        params: {
          ...params.pageParam,
          ...params.queryArg,
        },
      }),
    }),
    createSelfDisposal: build.mutation<void, CreateSelfDisposalRequest>({
      query: (data) => ({
        url: 'main/disposal/self-disposal',
        method: 'POST',
        data,
      }),
    }),
    createDisposalShipment: build.mutation<
      { id: number },
      CreateDisposalShipmentPayload
    >({
      query: (data) => ({
        url: 'main/disposal/shipment',
        method: 'POST',
        data,
      }),
    }),
    getDisposalShipmentList: build.infiniteQuery<
      IDisposalShipmentListResponse,
      IDisposalShipmentFilter,
      PaginateParam
    >({
      infiniteQueryOptions: { initialPageParam, getNextPageParam },
      query: (params) => ({
        url: 'main/disposal/shipment',
        method: 'GET',
        params: {
          ...params.pageParam,
          ...params.queryArg,
        },
      }),
    }),
    getDisposalShipmentDetail: build.query<IDisposalShipmentDetail, number>({
      query: (disposalId) => ({
        url: `main/disposal/shipment/${disposalId}`,
      }),
    }),
    getDisposalShipmentCount: build.query<
      DisposalShipmentStatusCount[],
      IDisposalShipmentFilter
    >({
      query: (params) => ({
        url: `main/disposal/shipment/counts`,
        params,
      }),
    }),
    cancelDisposalShipment: build.mutation<
      UpdateDisposalShipmentResponse,
      CancelDisposalShipmentPayload
    >({
      query: ({ id, comment }) => ({
        url: `main/disposal/shipment/${id}/cancel`,
        method: 'PUT',
        data: { comment: comment ?? undefined },
      }),
    }),
    receiveDisposalShipment: build.mutation<
      UpdateDisposalShipmentResponse,
      ReceiveDisposalShipmentPayload
    >({
      query: ({ id, ...data }) => ({
        url: `main/disposal/shipment/${id}/accept`,
        method: 'PUT',
        data,
      }),
    }),
  }),
})

export const {
  useGetDisposalStockQuery,
  useGetDisposalMethodsQuery,
  useGetDisposalMaterialsInfiniteQuery,
  useGetSelfDisposalListInfiniteQuery,
  useGetDisposalShipmentListInfiniteQuery,
  useCreateSelfDisposalMutation,
  useCreateDisposalShipmentMutation,
  useGetDisposalShipmentDetailQuery,
  useGetDisposalShipmentCountQuery,
  useCancelDisposalShipmentMutation,
  useReceiveDisposalShipmentMutation,
} = disposalApi
