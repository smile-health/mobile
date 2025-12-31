import { useCallback, useEffect, useMemo } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import { RouteProp, useRoute } from '@react-navigation/native'
import { SubmitHandler, useForm } from 'react-hook-form'
import { useLanguage } from '@/i18n/useLanguage'
import { AppStackParamList } from '@/navigators'
import {
  useGetReconciliationActionsQuery,
  useGetReconciliationReasonQuery,
} from '@/services/apis/reconciliation.api'
import { reconciliationState, useAppSelector } from '@/services/store'
import { showError } from '@/utils/CommonUtils'
import { navigate } from '@/utils/NavigationUtils'
import {
  ReconciliationFormItem,
  ReconciliationFormItemSchema,
} from '../schema/CreateReconciliationSchema'

type RouteType = RouteProp<AppStackParamList, 'AddReconciliationType'>

const getDefaultActionReasons = (data) => {
  if (data.action_reasons) {
    return data.action_reasons
  }

  const actualQty = data.actual_qty ?? 0
  const recordedQty = data.recorded_qty

  return actualQty === recordedQty ? [] : [{ reason_id: null, action_id: null }]
}
export default function useReconciliationTypeForm() {
  const { t } = useLanguage()
  const { activity, material } = useAppSelector(reconciliationState)
  const {
    params: { data, path },
  } = useRoute<RouteType>()

  const {
    data: reasons = [],
    isLoading: isLoadingReasons,
    isFetching: isFetchingReasons,
    error: errorReasons,
    refetch: refreshReasons,
  } = useGetReconciliationReasonQuery()
  const {
    data: actions = [],
    isLoading: isLoadingActions,
    isFetching: isFetchingActions,
    error: errorActions,
    refetch: refreshActions,
  } = useGetReconciliationActionsQuery()

  const shouldShowLoading = useMemo(
    () =>
      [
        isLoadingActions,
        isFetchingActions,
        isLoadingReasons,
        isFetchingReasons,
      ].some(Boolean),
    [isLoadingActions, isFetchingActions, isLoadingReasons, isFetchingReasons]
  )

  const methods = useForm<ReconciliationFormItem>({
    mode: 'onChange',
    resolver: yupResolver(ReconciliationFormItemSchema),
    defaultValues: {
      ...data,
      actual_qty: data.actual_qty ?? 0,
      action_reasons: getDefaultActionReasons(data),
    },
  })
  const {
    watch,
    setValue,
    trigger,
    handleSubmit,
    formState: { errors },
  } = methods

  const form = watch()

  const handleChangeActualQty = (value: string) => {
    setValue('actual_qty', value ? Number(value) : null, {
      shouldValidate: true,
    })

    if (Number(value) === form.recorded_qty) {
      setValue('action_reasons', [])
    } else {
      setValue('action_reasons', [{ reason_id: null, action_id: null }])
    }
  }

  const handleDeleteActionReason = useCallback(
    (index: number) => {
      const updatedActionReasons = [...(form.action_reasons ?? [])]
      updatedActionReasons.splice(index, 1)
      setValue('action_reasons', updatedActionReasons)
      trigger('action_reasons')
    },
    [form.action_reasons, setValue, trigger]
  )

  const handleAddActionReason = useCallback(() => {
    setValue('action_reasons', [
      ...(form.action_reasons ?? []),
      { action_id: null, reason_id: null },
    ])
  }, [form.action_reasons, setValue])

  const handleSaveData: SubmitHandler<ReconciliationFormItem> = (data) => {
    navigate('CreateReconciliation', {
      formUpdate: { values: data, path },
    })
  }

  const handleRefreshOptions = () => {
    refreshReasons()
    refreshActions()
  }

  useEffect(() => {
    if (errorActions || errorReasons) {
      showError(t('error.load_data'))
    }
  }, [errorActions, errorReasons, t])

  return {
    t,
    activityName: activity.name,
    materialName: material.name,
    methods,
    form,
    errors,
    reasons,
    actions,
    shouldShowLoading,
    handleChangeActualQty,
    handleDeleteActionReason,
    handleAddActionReason,
    handleRefreshOptions,
    handleSave: handleSubmit(handleSaveData),
  }
}
