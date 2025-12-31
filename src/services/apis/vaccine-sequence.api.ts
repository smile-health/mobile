import { VaccineType } from '@/models/transaction/VaccineSequence'
import api from '../api'

export const vaccineSequenceApi = api.injectEndpoints({
  endpoints: (build) => ({
    getRabiesSequence: build.query<VaccineType[], void>({
      query: () => ({
        url: 'main/transactions/rabies-sequence',
      }),
    }),
  }),
})

export const { useGetRabiesSequenceQuery } = vaccineSequenceApi
