import { useLanguage } from '@/i18n/useLanguage'
import { IOptions } from '@/models/Common'
import {
  EntityVendorOptionParams,
  useGetAssetCalibrationScheduleQuery,
  useGetAssetElectricityQuery,
  useGetAssetMaintenanceScheduleQuery,
  useGetAssetVendorQuery,
  useGetAssetWorkingStatusQuery,
  useGetEntityVendorQuery,
} from '@/services/apis/asset.api'
import { authState, useAppSelector } from '@/services/store'

export const useAssetOptions = () => {
  const { t } = useLanguage()

  const { user } = useAppSelector(authState)
  const provinceId = user?.entity?.province_id
  const regencyId = user?.entity?.regency_id
  const subDistrictId = user?.entity?.sub_district_id

  const { data: workingStatusData, isFetching: isLoadingWorkingStatus } =
    useGetAssetWorkingStatusQuery()
  const { data: electricityData } = useGetAssetElectricityQuery()
  const { data: calibrationScheduleData } =
    useGetAssetCalibrationScheduleQuery()
  const { data: maintenanceScheduleData } =
    useGetAssetMaintenanceScheduleQuery()
  const { data: vendorData } = useGetAssetVendorQuery()

  // Entity vendor params
  const entityVendorParams: EntityVendorOptionParams = {
    is_vendor: 1,
    is_asset: 1,
  }
  if (provinceId) entityVendorParams.province_id = provinceId
  if (regencyId) entityVendorParams.regency_id = regencyId
  if (subDistrictId) entityVendorParams.sub_district_id = subDistrictId
  const { data: borrowedFromData } = useGetEntityVendorQuery(entityVendorParams)

  const anotherOption: IOptions = {
    value: 0,
    label: t('asset.add_another_option'),
  }

  // Generate year options from 1990 to current year
  const yearOptions: IOptions[] = []
  const currentYear = new Date().getFullYear()
  for (let year = 1990; year <= currentYear; year++) {
    yearOptions.push({ label: year.toString(), value: year })
  }
  yearOptions.sort((a, b) => b.value - a.value)

  const workingStatusOptions: IOptions[] = workingStatusData
    ? workingStatusData.data.map((status) => ({
        label: status.name,
        value: status.id,
      }))
    : []

  const workingStatusFilterOptions: IOptions[] = workingStatusData
    ? [
        { label: t('asset.all_working_status'), value: 0 },
        ...workingStatusOptions,
      ]
    : []

  const calibrationScheduleOptions: IOptions[] = calibrationScheduleData
    ? calibrationScheduleData.data.map((item) => ({
        label: item.name,
        value: item.id,
      }))
    : []

  const maintenanceScheduleOptions: IOptions[] = maintenanceScheduleData
    ? maintenanceScheduleData.data.map((item) => ({
        label: item.name,
        value: item.id,
      }))
    : []

  // Vendor options
  const vendorOptions: IOptions[] = vendorData
    ? vendorData.data.map((item) => ({
        label: item.name,
        value: item.id,
      }))
    : []

  // Electricity options
  const electricityAvailabilityOptions: IOptions[] = electricityData
    ? electricityData.data.map((item) => ({
        label: item.name,
        value: item.id,
      }))
    : []

  // Ownership options
  const borrowedFromOptions: IOptions[] = borrowedFromData
    ? [
        anotherOption,
        ...borrowedFromData.data.map((item) => ({
          label: item.name,
          value: Number(item.id),
        })),
      ]
    : []

  return {
    // Asset Specification
    yearOptions,
    workingStatusOptions,
    workingStatusFilterOptions,
    // Schedule & Vendor
    calibrationScheduleOptions,
    maintenanceScheduleOptions,
    vendorOptions,
    // Electricity
    electricityAvailabilityOptions,
    // Ownership
    borrowedFromOptions,
    shouldShowLoading: isLoadingWorkingStatus,
  }
}
