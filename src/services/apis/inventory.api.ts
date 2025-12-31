import {
  GetStockDetailParams,
  GetStockParams,
  GetStockResponse,
  StockDetail,
} from '@/models/shared/Material'
import { checkParamsChange } from '@/screens/inventory/helpers/TransactionHelpers'
import api from '../api'

export const inventoryApi = api.injectEndpoints({
  endpoints: (build) => ({
    getStocks: build.query<GetStockResponse, GetStockParams>({
      query: (params) => ({
        url: 'main/stocks/entities',
        params,
      }),
      serializeQueryArgs: ({ queryArgs }) => {
        const { keyword } = queryArgs
        return { keyword }
      },
      merge: ({ data: currentData }, newItems, { arg }) => {
        return arg.page === 1
          ? newItems
          : { ...newItems, data: [...currentData, ...newItems.data] }
      },
      forceRefetch({ currentArg, previousArg }) {
        return checkParamsChange(currentArg, previousArg)
      },
    }),
    getStockDetail: build.query<StockDetail[], GetStockDetailParams>({
      query: (params) => ({
        url: 'main/stocks/details',
        params: { onlyhave_qty: 1, ...params },
      }),
      transformResponse: (response: { data: StockDetail[] }) => {
        return response.data
      },
      forceRefetch: ({ currentArg, previousArg }) => {
        return JSON.stringify(currentArg) !== JSON.stringify(previousArg)
      },
    }),
  }),
})

export const { useGetStocksQuery, useGetStockDetailQuery } = inventoryApi
