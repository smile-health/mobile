import {
  AssetInventoryResponse,
  AssetInventoryQueryParams,
  AssetInventory,
  EditAssetInventoryPayload,
} from '@/models/asset-inventory/AssetInventory'
import { AssetFormData } from '@/screens/asset/schema/AssetInventorySchema'
import api from '../api'

export const assetInventoryApi = api.injectEndpoints({
  endpoints: (build) => ({
    getAssetInventoryList: build.query<
      AssetInventoryResponse,
      AssetInventoryQueryParams
    >({
      query: (params) => ({
        url: '/main/asset-inventories',
        method: 'GET',
        params,
      }),
      serializeQueryArgs: ({ queryArgs }) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { page, ...rest } = queryArgs
        return rest
      },
      merge: (currentCache, newItems, { arg }) => {
        if (arg.page === 1) {
          return newItems
        }

        return { ...newItems, data: [...currentCache.data, ...newItems.data] }
      },
      transformResponse: (response: AssetInventoryResponse) => {
        const uniqueData = response.data.filter(
          (item, index, self) =>
            index === self.findIndex((t) => t.id === item.id)
        )

        return { ...response, data: uniqueData }
      },
    }),
    getAssetInventoryDetail: build.query<
      AssetInventory,
      { id: string | number }
    >({
      query: ({ id }) => ({
        url: `/main/asset-inventories/${id}`,
        method: 'GET',
      }),
    }),
    createAssetInventory: build.mutation<AssetInventory, AssetFormData>({
      query: (data) => ({
        url: '/main/asset-inventories',
        method: 'POST',
        data,
      }),
    }),
    editAssetInventory: build.mutation<
      AssetInventory,
      EditAssetInventoryPayload
    >({
      query: ({ id, data }) => ({
        url: `/main/asset-inventories/${id}`,
        method: 'PUT',
        data,
      }),
    }),
  }),
})

export const {
  useGetAssetInventoryListQuery,
  useGetAssetInventoryDetailQuery,
  useCreateAssetInventoryMutation,
  useEditAssetInventoryMutation,
} = assetInventoryApi
