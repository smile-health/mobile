import {
  StockTakingCreateResponse,
  StockTakingPayload,
} from '@/models/stock-taking/CreateStockTaking'
import {
  StockTakingListParam,
  StockTakingListResponse,
} from '@/models/stock-taking/StockTakingList'
import {
  Period,
  PeriodListParams,
  PeriodListResponse,
} from '@/models/stock-taking/StockTakingPeriod'
import { checkParamsChange } from '@/screens/inventory/helpers/TransactionHelpers'
import api from '../api'

export const stockTakingApi = api.injectEndpoints({
  endpoints: (build) => ({
    getPeriod: build.query<Period[], PeriodListParams>({
      query: (params) => ({
        url: 'main/stock-opname-periods',
        params,
      }),
      transformResponse: (response: PeriodListResponse) => {
        return response.data
      },
    }),
    getStockTakingList: build.query<
      StockTakingListResponse,
      StockTakingListParam
    >({
      query: (params) => ({
        url: 'main/stock-opnames',
        params,
      }),
      serializeQueryArgs: ({ queryArgs }) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { page, ...restParams } = queryArgs
        return restParams
      },
      merge: (currentCache, newItems, { arg: params }) => {
        return params.page === 1
          ? newItems
          : { ...newItems, data: [...currentCache.data, ...newItems.data] }
      },
      forceRefetch: ({ currentArg, previousArg }) => {
        return checkParamsChange(currentArg, previousArg)
      },
    }),
    createStockTaking: build.mutation<
      StockTakingCreateResponse,
      StockTakingPayload
    >({
      query: (data) => ({
        url: 'main/stock-opnames',
        method: 'POST',
        data,
      }),
    }),
  }),
})

export const {
  useGetPeriodQuery,
  useCreateStockTakingMutation,
  useGetStockTakingListQuery,
} = stockTakingApi
