import { BaseEntity, CustomerVendorActivityResponse } from '@/models'
import api from '@/services/api'

export const cvaApi = api.injectEndpoints({
  endpoints: (build) => ({
    getCVA: build.query<CustomerVendorActivityResponse, number>({
      query: (programId) => ({
        url: 'main/app/data/cva',
        method: 'GET',
        headers: {
          'X-Program-Id': programId,
          'Device-Type': 'mobile',
        },
      }),
    }),
    getCVRelocation: build.query<BaseEntity[], void>({
      query: () => ({
        url: 'main/app/data/cv-relocation',
        method: 'GET',
      }),
    }),
  }),
})

export const { useGetCVAQuery, useLazyGetCVAQuery, useGetCVRelocationQuery } =
  cvaApi
