import { CommonObject, IOptions } from '@/models/Common'
import { GetStockResponse } from '@/models/shared/Material'
import {
  GetActivitiesParams,
  GetProgramParams,
  GetTransferStockMaterialParams,
  TransferStockPayload,
  TransferStockProgram,
} from '@/models/transaction/TransferStock'
import api from '../api'

export const transferStockApi = api.injectEndpoints({
  endpoints: (build) => ({
    getPrograms: build.query<TransferStockProgram[], GetProgramParams>({
      query: (params) => ({
        url: 'main/transfer-stock/programs',
        params,
      }),
    }),
    getActivities: build.query<IOptions[], GetActivitiesParams>({
      query: (params) => ({
        url: 'main/transfer-stock/activities',
        params,
      }),
      transformResponse: (response: CommonObject[]) => {
        return response.map((ac) => ({
          label: ac.name,
          value: ac.id,
        }))
      },
    }),
    getTransferStockMaterial: build.query<
      GetStockResponse,
      GetTransferStockMaterialParams
    >({
      query: (params) => ({
        url: 'main/transfer-stock/stocks',
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
    }),
    createTransferStock: build.mutation<string, TransferStockPayload>({
      query: (data) => ({
        url: 'main/transactions/transfer-stock',
        method: 'POST',
        data,
      }),
    }),
  }),
})

export const {
  useGetProgramsQuery,
  useGetActivitiesQuery,
  useGetTransferStockMaterialQuery,
  useCreateTransferStockMutation,
} = transferStockApi
