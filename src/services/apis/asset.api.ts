/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  AssetOptionResponse,
  AssetUserOptionResponse,
  EntityVendorOptionResponse,
} from '@/models/asset-inventory/AssetInventory'
import { PaginateParam } from '@/models/Paginate'
import api from '../api'

type AssetOptionParams = {
  keyword?: string
  status?: number
} & PaginateParam

export type EntityVendorOptionParams = {
  is_vendor: number
  is_asset: number
  province_id?: number
  regency_id?: number
  sub_district_id?: number
}

const serializeQueryArgsWithoutPage = ({
  queryArgs,
}: {
  queryArgs: AssetOptionParams
}) => {
  const { page, ...rest } = queryArgs
  return rest
}

const mergeWithPagination = (
  currentCache: AssetOptionResponse,
  newItems: AssetOptionResponse,
  { arg }: { arg: AssetOptionParams }
) => {
  if (arg.page === 1) {
    return newItems
  }

  return { ...newItems, data: [...currentCache.data, ...newItems.data] }
}

export const assetApi = api.injectEndpoints({
  endpoints: (build) => ({
    getAssetType: build.query<AssetOptionResponse, AssetOptionParams>({
      query: (params) => ({
        url: 'main/asset-types',
        method: 'GET',
        params,
      }),
      serializeQueryArgs: serializeQueryArgsWithoutPage,
      merge: mergeWithPagination,
    }),
    getAssetModel: build.query<AssetOptionResponse, AssetOptionParams>({
      query: (params) => ({
        url: 'main/asset-models',
        method: 'GET',
        params,
      }),
      serializeQueryArgs: serializeQueryArgsWithoutPage,
      merge: mergeWithPagination,
    }),
    getAssetManufacture: build.query<AssetOptionResponse, AssetOptionParams>({
      query: (params) => ({
        url: 'main/manufactures',
        method: 'GET',
        params,
      }),
      serializeQueryArgs: serializeQueryArgsWithoutPage,
      merge: mergeWithPagination,
    }),
    getAssetVendor: build.query<AssetOptionResponse, void>({
      query: () => ({
        url: 'main/asset-vendors',
        method: 'GET',
        params: { status: 1 },
      }),
    }),
    getAssetWorkingStatus: build.query<AssetOptionResponse, void>({
      query: () => ({
        url: 'main/asset-working-statuses',
        method: 'GET',
      }),
    }),
    getAssetElectricity: build.query<AssetOptionResponse, void>({
      query: () => ({
        url: 'main/asset-electricities',
        method: 'GET',
      }),
    }),
    getAssetCalibrationSchedule: build.query<AssetOptionResponse, void>({
      query: () => ({
        url: 'main/asset-calibration-schedules',
        method: 'GET',
      }),
    }),
    getAssetMaintenanceSchedule: build.query<AssetOptionResponse, void>({
      query: () => ({
        url: 'main/asset-maintenance-schedules',
        method: 'GET',
      }),
    }),
    getAssetBudgetSource: build.query<AssetOptionResponse, AssetOptionParams>({
      query: (params) => ({
        url: 'main/budget-sources',
        method: 'GET',
        params,
      }),
      serializeQueryArgs: serializeQueryArgsWithoutPage,
      merge: mergeWithPagination,
    }),
    // Get asset user by entity id
    getAssetUser: build.query<AssetUserOptionResponse, { entity_id: number }>({
      query: ({ entity_id }) => ({
        url: 'main/users',
        method: 'GET',
        params: { entity_id },
      }),
    }),
    // Get entity vendor by is_vendor
    getEntityVendor: build.query<
      EntityVendorOptionResponse,
      EntityVendorOptionParams
    >({
      query: (params) => ({
        url: `main/entities`,
        method: 'GET',
        params,
      }),
    }),
  }),
})

export const {
  useGetAssetTypeQuery,
  useGetAssetModelQuery,
  useGetAssetManufactureQuery,
  useGetAssetVendorQuery,
  useGetAssetWorkingStatusQuery,
  useGetAssetElectricityQuery,
  useGetAssetCalibrationScheduleQuery,
  useGetAssetMaintenanceScheduleQuery,
  useGetAssetBudgetSourceQuery,
  useGetAssetUserQuery,
  useGetEntityVendorQuery,
} = assetApi
