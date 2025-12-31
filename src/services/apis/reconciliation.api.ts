import {
  ActionReasonData,
  GenerateReconciliationParams,
  GenerateReconciliationResponse,
  GetActionReasonResponse,
  ReconciliationData,
  ReconciliationPayload,
} from '@/models/reconciliation/CreateReconciliation'
import {
  ReconciliationDetail,
  ReconciliationListParams,
  ReconciliationListResponse,
} from '@/models/reconciliation/ReconciliationList'
import api from '../api'

export const reconciliationApi = api.injectEndpoints({
  endpoints: (build) => ({
    generateReconciliation: build.query<
      ReconciliationData[],
      GenerateReconciliationParams
    >({
      query: (params) => ({
        url: 'main/reconciliation/generate',
        params,
      }),
      transformResponse: (response: GenerateReconciliationResponse) => {
        return response.data.map((data) => ({
          ...data,
          recorded_qty: Math.abs(data.recorded_qty),
        }))
      },
    }),
    getReconciliationReason: build.query<ActionReasonData[], void>({
      query: () => ({
        url: 'main/reconciliation/reasons',
      }),
      transformResponse: (response: GetActionReasonResponse) => {
        return response.data
      },
    }),
    getReconciliationActions: build.query<ActionReasonData[], void>({
      query: () => ({
        url: 'main/reconciliation/actions',
      }),
      transformResponse: (response: GetActionReasonResponse) => {
        return response.data
      },
    }),
    getReconciliationList: build.query<
      ReconciliationListResponse,
      ReconciliationListParams
    >({
      query: (params) => ({
        url: 'main/reconciliation',
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
    }),
    getReconciliationDetail: build.query<
      ReconciliationDetail,
      number | undefined
    >({
      query: (id) => ({
        url: `main/reconciliation/${id}`,
      }),
    }),
    createReconciliation: build.mutation<string, ReconciliationPayload>({
      query: (data) => ({
        url: 'main/reconciliation',
        method: 'POST',
        data,
      }),
    }),
  }),
})

export const {
  useCreateReconciliationMutation,
  useLazyGenerateReconciliationQuery,
  useGenerateReconciliationQuery,
  useGetReconciliationActionsQuery,
  useGetReconciliationReasonQuery,
  useGetReconciliationListQuery,
  useGetReconciliationDetailQuery,
} = reconciliationApi
