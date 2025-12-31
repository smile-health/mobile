import { TransactionAddStockPayload } from '@/models/transaction/AddStock'
import { TransactionCancelDiscardPayload } from '@/models/transaction/CancelDiscard'
import { TransactionConsumptionPayload } from '@/models/transaction/Consumption'
import { TransactionDiscardPayload } from '@/models/transaction/Discard'
import { TransactionReduceStockPayload } from '@/models/transaction/ReduceStock'
import { TransactionReturnHFPayload } from '@/models/transaction/ReturnHealthFacility'
import {
  TransactionConsumptionParams,
  TransactionConsumptionResponse,
  TransactionDiscardParams,
  TransactionDiscardsResponse,
  TransactionListParams,
  TransactionListResponse,
} from '@/models/transaction/Transaction'
import { TransactionSubmitResponse } from '@/models/transaction/TransactionSubmit'
import { checkParamsChange } from '@/screens/inventory/helpers/TransactionHelpers'
import api from '../api'

export const transactionApi = api.injectEndpoints({
  endpoints: (build) => ({
    getTransactionList: build.query<
      TransactionListResponse,
      TransactionListParams
    >({
      query: (params) => ({
        url: 'main/transactions',
        params,
      }),
      serializeQueryArgs: ({ queryArgs }) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { page, ...restTrxListParams } = queryArgs
        return restTrxListParams
      },
      merge: (currentCache, newItems, { arg: trxListParams }) => {
        return trxListParams.page === 1
          ? newItems
          : { ...newItems, data: [...currentCache.data, ...newItems.data] }
      },
      forceRefetch: ({ currentArg, previousArg }) => {
        return checkParamsChange(currentArg, previousArg)
      },
    }),
    getTransactionDiscards: build.query<
      TransactionDiscardsResponse,
      TransactionDiscardParams
    >({
      query: (params) => ({
        url: 'main/transactions/discard',
        params,
      }),
      serializeQueryArgs: ({ queryArgs }) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { page, ...restTrxDiscardListParams } = queryArgs
        return restTrxDiscardListParams
      },
      merge: (currentCache, newItems, { arg }) => {
        return arg.page === 1
          ? newItems
          : { ...newItems, data: [...currentCache.data, ...newItems.data] }
      },
      forceRefetch: ({ currentArg, previousArg }) => {
        return checkParamsChange(currentArg, previousArg)
      },
    }),
    getTransactionConsumption: build.query<
      TransactionConsumptionResponse,
      TransactionConsumptionParams
    >({
      query: (params) => ({
        url: 'main/transactions/consumptions',
        params,
      }),
      merge: (currentCache, newItems, { arg }) => {
        return arg.page === 1
          ? newItems
          : { ...newItems, data: [...currentCache.data, ...newItems.data] }
      },
      serializeQueryArgs: ({ queryArgs }) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { page, ...restTrxConsumptionListParams } = queryArgs
        return restTrxConsumptionListParams
      },
      forceRefetch: ({ currentArg, previousArg }) => {
        return checkParamsChange(currentArg, previousArg)
      },
    }),
    createTrxAddStock: build.mutation<
      TransactionSubmitResponse,
      TransactionAddStockPayload
    >({
      query: (data) => ({
        url: 'main/transactions/add-stock',
        method: 'POST',
        data,
      }),
    }),
    createTrxReduceStock: build.mutation<
      TransactionSubmitResponse,
      TransactionReduceStockPayload
    >({
      query: (data) => ({
        url: 'main/transactions/remove-stock',
        method: 'POST',
        data,
      }),
    }),
    createTrxDiscard: build.mutation<
      TransactionSubmitResponse,
      TransactionDiscardPayload
    >({
      query: (data) => ({
        url: 'main/transactions/discard-stock',
        method: 'POST',
        data,
      }),
    }),
    createTrxConsumption: build.mutation<
      TransactionSubmitResponse,
      TransactionConsumptionPayload
    >({
      query: (data) => ({
        url: 'main/transactions/consumption',
        method: 'POST',
        data,
      }),
    }),
    createTrxReturnHF: build.mutation<
      TransactionSubmitResponse,
      TransactionReturnHFPayload
    >({
      query: (data) => ({
        url: 'main/transactions/return-of-health-facitilies',
        method: 'POST',
        data,
      }),
    }),
    createTrxCancelDiscard: build.mutation<
      TransactionSubmitResponse,
      TransactionCancelDiscardPayload
    >({
      query: (data) => ({
        url: 'main/transactions/cancelation-discard',
        method: 'POST',
        data,
      }),
    }),
  }),
})

export const {
  useGetTransactionListQuery,
  useGetTransactionDiscardsQuery,
  useGetTransactionConsumptionQuery,
  useCreateTrxAddStockMutation,
  useCreateTrxReduceStockMutation,
  useCreateTrxDiscardMutation,
  useCreateTrxConsumptionMutation,
  useCreateTrxReturnHFMutation,
  useCreateTrxCancelDiscardMutation,
} = transactionApi
