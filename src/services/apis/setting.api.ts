import { ThemeVariant } from '@/theme/theme-config'
import api from '../api'

export const settingApi = api.injectEndpoints({
  endpoints: (build) => ({
    getColorSetting: build.query<ThemeVariant, void>({
      query: () => ({
        url: 'https://next-testing-sepia.vercel.app/api/color-setting',
        method: 'GET',
      }),
    }),
  }),
})

export const { useGetColorSettingQuery } = settingApi
