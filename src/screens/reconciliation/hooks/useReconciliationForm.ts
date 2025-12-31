import { useCallback, useMemo } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import { useNavigation } from '@react-navigation/native'
import { SubmitHandler, useForm } from 'react-hook-form'
import { useLanguage } from '@/i18n/useLanguage'
import { useLazyGenerateReconciliationQuery } from '@/services/apis/reconciliation.api'
import {
  reconciliationState,
  useAppSelector,
  workspaceState,
} from '@/services/store'
import { showError } from '@/utils/CommonUtils'
import { DATE_CREATED_FORMAT } from '@/utils/Constants'
import { getStringUTC } from '@/utils/DateFormatUtils'
import { showNetworkError } from '@/utils/NetworkUtils'
import {
  ReconciliationForm,
  ReconciliationFormSchema,
} from '../schema/CreateReconciliationSchema'

export function useReconciliationForm() {
  const { t } = useLanguage()
  const navigation = useNavigation()
  const { selectedWorkspace } = useAppSelector(workspaceState)
  const { activity, material } = useAppSelector(reconciliationState)

  const [generateReconciliation, { isLoading, isFetching }] =
    useLazyGenerateReconciliationQuery()

  const methods = useForm<ReconciliationForm>({
    mode: 'onChange',
    resolver: yupResolver(ReconciliationFormSchema),
    defaultValues: {
      entity_id: selectedWorkspace?.entity_id,
      activity_id: activity.id,
      material_id: material.id,
      items: [],
    },
  })

  const {
    start_date,
    end_date,
    items: formItems,
    ...formData
  } = methods.watch()
  const sections = useMemo(() => {
    if (!start_date || !end_date) return []
    return [{ title: t('section.reconciliation'), data: formItems }]
  }, [end_date, formItems, start_date, t])

  const handleSelectPeriod = async (startDate: string, endDate: string) => {
    try {
      const response = await generateReconciliation({
        entity_id: selectedWorkspace?.entity_id,
        activity_id: activity.id,
        material_id: material.id,
        start_date: startDate,
        end_date: endDate,
      })
      methods.reset({
        ...formData,
        start_date: startDate,
        end_date: endDate,
        items: response.data ?? [],
      })
    } catch (error) {
      showNetworkError(error)
    }
  }

  const handleResetForm = useCallback(() => {
    methods.reset({
      ...formData,
      start_date: undefined,
      end_date: undefined,
      items: [],
    })
  }, [formData, methods])

  const handleViewHistory = () => {
    navigation.navigate('ReconciliationHistory')
  }

  const handleSaveReconciliation: SubmitHandler<ReconciliationForm> = (
    data
  ) => {
    navigation.navigate('ReviewReconciliation', {
      data,
      createdAt: getStringUTC(DATE_CREATED_FORMAT),
    })
  }

  const handleErrorSaveReconciliation = () => {
    showError(t('error.complete_data'))
  }

  return {
    t,
    sections,
    methods,
    activityName: activity.name,
    materialName: material.name,
    start_date,
    end_date,
    shouldShowData: start_date && end_date,
    shouldShowLoading: isLoading || isFetching,
    handleResetForm,
    handleViewHistory,
    handleSelectPeriod,
    handleSave: methods.handleSubmit(
      handleSaveReconciliation,
      handleErrorSaveReconciliation
    ),
  }
}
