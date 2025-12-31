import { AppDataMaterialResponse } from '@/models/app-data/Materials'
import api from '@/services/api'

export const materialsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getMaterials: build.query<AppDataMaterialResponse, number>({
      query: (programId) => ({
        url: 'main/app/data/materials',
        method: 'GET',
        headers: {
          'X-Program-Id': programId,
          'Device-Type': 'mobile',
        },
      }),
    }),
  }),
})

export const { useGetMaterialsQuery, useLazyGetMaterialsQuery } = materialsApi
