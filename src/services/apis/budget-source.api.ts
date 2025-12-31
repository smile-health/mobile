import { CommonObject, IOptions } from '@/models/Common'
import api from '../api'

export const budgetSourceApi = api.injectEndpoints({
  endpoints: (build) => ({
    getBudgetSource: build.query<IOptions[], void>({
      query: () => ({
        url: 'main/budget-sources',
        method: 'GET',
        params: { status: 1 },
      }),
      transformResponse: (response: { data: CommonObject[] }) => {
        return response.data.map((bs) => ({
          label: bs.name,
          value: bs.id,
        }))
      },
    }),
  }),
})

export const { useGetBudgetSourceQuery } = budgetSourceApi
