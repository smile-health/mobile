import { useCallback } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import { useNavigation } from '@react-navigation/native'
import { useForm } from 'react-hook-form'
import { useLanguage } from '@/i18n/useLanguage'
import { AssetInventory } from '@/models/asset-inventory/AssetInventory'
import { IOptions } from '@/models/Common'
import { UseNavigationScreen } from '@/navigators'
import {
  AssetFormData,
  AssetInventorySchema,
} from '@/screens/asset/schema/AssetInventorySchema'
import {
  useCreateAssetInventoryMutation,
  useEditAssetInventoryMutation,
} from '@/services/apis/asset-inventory.api'
import { authState, useAppSelector } from '@/services/store'
import { formatErrorMessage, showError, showSuccess } from '@/utils/CommonUtils'
import { DATE_FILTER_FORMAT } from '@/utils/Constants'
import { convertString } from '@/utils/DateFormatUtils'
import useProgramId from '@/utils/hooks/useProgramId'

type Props = {
  data?: AssetInventory
  isEdit?: boolean
}

export const useAddInventoryAsset = ({ data, isEdit }: Props) => {
  const navigation = useNavigation<UseNavigationScreen>()

  const { t } = useLanguage()

  const programId = useProgramId()
  const { user } = useAppSelector(authState)
  const entityName = user?.entity?.name
  const entityId = user?.programs?.find(
    (item) => item.id === programId
  )?.entity_id

  const [createAssetInventory, { isLoading }] =
    useCreateAssetInventoryMutation()
  const [editAssetInventory, { isLoading: isLoadingEdit }] =
    useEditAssetInventoryMutation()

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors, isValid },
  } = useForm<AssetFormData>({
    defaultValues: {
      asset_type_id: data?.other_asset_type_name ? 0 : data?.asset_type?.id,
      serial_number: data?.serial_number,
      asset_model_id: data?.other_asset_model_name ? 0 : data?.asset_model?.id,
      manufacture_id: data?.other_manufacture_name ? 0 : data?.manufacture?.id,
      production_year: data?.production_year,
      asset_working_status_id: data?.working_status?.id,
      // Ownership section
      ownership_qty: data?.ownership?.qty ?? 1,
      ownership_status: data?.ownership?.id ?? 1,
      borrowed_from_entity_id: data?.other_borrowed_from_entity_name
        ? 0
        : data?.borrowed_from?.id,
      // Budget section
      budget_year: data?.budget_source?.year,
      budget_source_id: data?.other_budget_source_name
        ? 0
        : data?.budget_source?.id,
      // Electricity section
      asset_electricity_id: data?.electricity?.id,
      // Warranty section
      warranty_start_date: data?.warranty?.start_date
        ? new Date(data.warranty.start_date)
        : null,
      warranty_end_date: data?.warranty?.end_date
        ? new Date(data.warranty.end_date)
        : null,
      warranty_asset_vendor_id: data?.warranty?.asset_vendor_id ?? null,
      // Calibration section
      calibration_last_date: data?.calibration?.last_date
        ? new Date(data.calibration.last_date)
        : null,
      calibration_schedule_id: data?.calibration?.schedule_id ?? null,
      calibration_asset_vendor_id: data?.calibration?.asset_vendor_id ?? null,
      // Maintenance section
      maintenance_last_date: data?.maintenance?.last_date
        ? new Date(data.maintenance.last_date)
        : null,
      maintenance_schedule_id: data?.maintenance?.schedule_id ?? null,
      maintenance_asset_vendor_id: data?.maintenance?.asset_vendor_id ?? null,
      // Entity section
      entity_id: entityId,
      entity_name: entityName,
      contact_person_user_1_name: data?.contact_person?.first?.name ?? '',
      contact_person_user_1_number: data?.contact_person?.first?.number ?? '',
      contact_person_user_2_name: data?.contact_person?.second?.name ?? null,
      contact_person_user_2_number:
        data?.contact_person?.second?.number ?? null,
      contact_person_user_3_name: data?.contact_person?.third?.name ?? null,
      contact_person_user_3_number: data?.contact_person?.third?.number ?? null,
      // other
      other_asset_type_name: data?.other_asset_type_name ?? null,
      other_min_temperature: data?.other_min_temperature ?? null,
      other_max_temperature: data?.other_max_temperature ?? null,
      other_asset_model_name: data?.other_asset_model_name ?? null,
      other_net_capacity: data?.other_net_capacity ?? null,
      other_gross_capacity: data?.other_gross_capacity ?? null,
      other_manufacture_name: data?.other_manufacture_name ?? null,
      other_budget_source_name: data?.other_budget_source_name ?? null,
      other_borrowed_from_entity_name:
        data?.other_borrowed_from_entity_name ?? null,
    },
    resolver: yupResolver(AssetInventorySchema()),
    mode: 'onChange',
  })

  const form = watch()

  // handler for all dropdown selects
  const handleSelect = useCallback(
    (fieldName: keyof AssetFormData) => (item: IOptions) => {
      setValue(fieldName, item.value, { shouldValidate: true })
    },
    [setValue]
  )

  // handler for date pickers
  const handleDateChange = useCallback(
    (fieldName: keyof AssetFormData) => (date: Date) => {
      setValue(fieldName, date, { shouldValidate: true })
    },
    [setValue]
  )

  const onSubmit = async (data: AssetFormData) => {
    const payload = {
      ...data,
      warranty_start_date: data.warranty_start_date
        ? convertString(data.warranty_start_date, DATE_FILTER_FORMAT)
        : null,
      warranty_end_date: data.warranty_end_date
        ? convertString(data.warranty_end_date, DATE_FILTER_FORMAT)
        : null,
      calibration_last_date: data.calibration_last_date
        ? convertString(data.calibration_last_date, DATE_FILTER_FORMAT)
        : null,
      maintenance_last_date: data.maintenance_last_date
        ? convertString(data.maintenance_last_date, DATE_FILTER_FORMAT)
        : null,
      asset_type_id: data.asset_type_id === 0 ? null : data.asset_type_id,
      asset_model_id: data.asset_model_id === 0 ? null : data.asset_model_id,
      manufacture_id: data.manufacture_id === 0 ? null : data.manufacture_id,
      budget_source_id:
        data.budget_source_id === 0 ? null : data.budget_source_id,
      borrowed_from_entity_id:
        data.borrowed_from_entity_id === 0
          ? null
          : data.borrowed_from_entity_id,
    }

    if (!isEdit) {
      await handleCreateAsset(payload as AssetFormData)
      return
    }

    await handleEditAsset(payload as AssetFormData)
  }

  const handleCreateAsset = async (payload: AssetFormData) => {
    if (isLoading) return

    try {
      const res = await createAssetInventory(payload).unwrap()
      navigation.replace('AssetInventoryDetail', { id: res.id })

      showSuccess(
        t('asset.success_add_asset_inventory'),
        'snackbar-success-created-asset-inventory'
      )
    } catch (error) {
      showError(formatErrorMessage(error))
    }
  }

  const handleEditAsset = async (payload: AssetFormData) => {
    if (isLoadingEdit) return

    try {
      if (payload.asset_type_id !== null && payload.asset_type_id !== 0) {
        payload.other_asset_type_name = null
        payload.other_min_temperature = null
        payload.other_max_temperature = null
      }

      if (payload.asset_model_id !== null && payload.asset_model_id !== 0) {
        payload.other_asset_model_name = null
        payload.other_net_capacity = null
        payload.other_gross_capacity = null
      }

      if (payload.manufacture_id !== null && payload.manufacture_id !== 0) {
        payload.other_manufacture_name = null
      }

      if (payload.budget_source_id !== null && payload.budget_source_id !== 0) {
        payload.other_budget_source_name = null
      }

      if (payload.ownership_status === 1) {
        payload.borrowed_from_entity_id = null
        payload.other_borrowed_from_entity_name = null
      }

      if (
        payload.borrowed_from_entity_id !== null &&
        payload.borrowed_from_entity_id !== 0
      ) {
        payload.other_borrowed_from_entity_name = null
      }

      await editAssetInventory({ id: data?.id ?? 0, data: payload }).unwrap()
      navigation.goBack()

      showSuccess(
        t('asset.success_edit_asset_inventory'),
        'snackbar-success-edit-asset-inventory'
      )
    } catch (error) {
      showError(formatErrorMessage(error))
    }
  }

  return {
    control,
    handleSubmit,
    trigger,
    errors,
    isValid,
    form,
    handleSelect,
    handleDateChange,
    onSubmit,
    isLoading: isLoading || isLoadingEdit,
  }
}
