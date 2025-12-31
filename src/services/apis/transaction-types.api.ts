import { TransactionTypesResponse } from '@/models'
import api from '@/services/api'

export const transactionTypesApi = api.injectEndpoints({
  endpoints: (build) => ({
    getTransactionTypes: build.query<TransactionTypesResponse[], number>({
      query: (programId) => ({
        url: `main/app/data/trx-types`,
        method: 'GET',
        headers: {
          'X-Program-Id': programId,
          'Device-Type': 'mobile',
        },
      }),
    }),
  }),
})

export const { useGetTransactionTypesQuery, useLazyGetTransactionTypesQuery } =
  transactionTypesApi
