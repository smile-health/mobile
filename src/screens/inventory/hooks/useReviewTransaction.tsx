import { useEffect, useState } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import { useNavigation } from '@react-navigation/native'
import { SubmitHandler, useForm } from 'react-hook-form'
import { useLanguage } from '@/i18n/useLanguage'
import { ErrorResponse } from '@/models'
import { ValidationErrorSequence } from '@/models/transaction/Consumption'
import { ReviewTransactionStock } from '@/models/transaction/TransactionCreate'
import { TransactionTypeUseCase } from '@/models/transaction/TransactionSubmit'
import { useLazyGetMaterialsQuery } from '@/services/apis'
import {
  clearTransaction,
  deleteTransaction,
  getReviewTrxItems,
} from '@/services/features/transaction.slice'
import {
  homeState,
  trxState,
  useAppDispatch,
  useAppSelector,
  workspaceState,
} from '@/services/store'
import { formatErrorMessage, showError, showSuccess } from '@/utils/CommonUtils'
import { TRANSACTION_TYPE } from '@/utils/Constants'
import useSubmitAddStock from './transactionSubmission/useSubmitAddStock'
import useSubmitCancelDiscard from './transactionSubmission/useSubmitCancelDiscard'
import useSubmitConsumption from './transactionSubmission/useSubmitConsumption'
import useSubmitDiscard from './transactionSubmission/useSubmitDiscard'
import useSubmitReduceStock from './transactionSubmission/useSubmitReduceStock'
import useSubmitReturnHF from './transactionSubmission/useSubmitReturnHF'
import {
  convertValidationError,
  mergePayloadWithOtherSequence,
} from '../helpers/ReviewTransactionHelpers'
import {
  CompletedSequenceForm,
  CompletedSequenceSchema,
} from '../schema/CompletedSequenceSchema'

export default function useReviewTransaction() {
  const dispatch = useAppDispatch()
  const { activity, customer, transactions } = useAppSelector(trxState)
  const { activeMenu } = useAppSelector(homeState)
  const { selectedWorkspace } = useAppSelector(workspaceState)
  const transactionItems = useAppSelector((state) =>
    getReviewTrxItems(state, activeMenu?.transactionType)
  )

  const [
    updateAppDataMaterial,
    { isLoading: isLoadingMaterial, isFetching: isFetchingMaterial },
  ] = useLazyGetMaterialsQuery()
  const { submitAddStock, isLoadingAddStock } = useSubmitAddStock()
  const { submitReduceStock, isLoadingReduceStock } = useSubmitReduceStock()
  const { submitDiscard, isLoadingDiscard } = useSubmitDiscard()
  const {
    submitConsumption,
    isLoadingConsumption,
    actualConsumptionDate,
    setActualConsumptionDate,
    consumptionPayload,
    createConsumptionTransaction,
  } = useSubmitConsumption()
  const {
    actualReturnDate,
    setActualReturnDate,
    submitReturnHF,
    isLoadingReturnHF,
  } = useSubmitReturnHF()
  const { submitCancelDiscard, isLoadingCancelDiscard } =
    useSubmitCancelDiscard()

  const navigation = useNavigation()
  const { t } = useLanguage()

  const transactionUseCases: TransactionTypeUseCase = {
    [TRANSACTION_TYPE.ADD_STOCK]: {
      submit: submitAddStock,
      isLoading: isLoadingAddStock,
    },
    [TRANSACTION_TYPE.REDUCE_STOCK]: {
      submit: submitReduceStock,
      isLoading: isLoadingReduceStock,
    },
    [TRANSACTION_TYPE.DISCARDS]: {
      submit: submitDiscard,
      isLoading: isLoadingDiscard,
    },
    [TRANSACTION_TYPE.CONSUMPTION]: {
      submit: submitConsumption,
      isLoading: isLoadingConsumption,
      additionalProps: {
        actualDateLabel: 'label.actual_date_consumption',
        actualDate: actualConsumptionDate,
        setActualDate: setActualConsumptionDate,
      },
    },
    [TRANSACTION_TYPE.RETURN]: {
      submit: submitReturnHF,
      isLoading: isLoadingReturnHF,
      additionalProps: {
        actualDateLabel: 'label.actual_date_return',
        actualDate: actualReturnDate,
        setActualDate: setActualReturnDate,
      },
    },
    [TRANSACTION_TYPE.CANCEL_DISCARDS]: {
      submit: submitCancelDiscard,
      isLoading: isLoadingCancelDiscard,
    },
  }

  const [isOpenCompletedSequence, setIsOpenCompletedSequence] = useState(false)
  const [sequenceError, setSequenceError] = useState<ValidationErrorSequence>()

  const methods = useForm<CompletedSequenceForm>({
    mode: 'onChange',
    resolver: yupResolver(CompletedSequenceSchema()),
    defaultValues: { patients: [] },
  })

  const { setValue, handleSubmit } = methods

  const openCompletedSequenceSheet = () => {
    setIsOpenCompletedSequence(true)
  }

  const closeCompletedSequenceSheet = () => {
    setIsOpenCompletedSequence(false)
    setSequenceError(undefined)
    setValue('patients', [])
  }

  const handleDeleteItem = (item: ReviewTransactionStock) => {
    if (!selectedWorkspace?.id) return
    if (transactions.length === 1) {
      handleClearTransaction()
      return
    }
    dispatch(
      deleteTransaction({ transaction: item, programId: selectedWorkspace.id })
    )
  }

  const handleClearTransaction = (callback?: () => void) => {
    if (!selectedWorkspace?.id) return
    dispatch(clearTransaction({ programId: selectedWorkspace.id }))
    if (callback) callback()
    navigation.goBack()
  }

  const handleError = (error: ErrorResponse) => {
    if (error.errors?.need_confirm) {
      setSequenceError(error.errors?.patients)
      showError(t('transaction.completed_sequence.error'))
      return
    }
    showError(formatErrorMessage(error))
  }

  const handleSuccessCreateTransaction = async (programId: number) => {
    await updateAppDataMaterial(programId)
    showSuccess(t('transaction.message.success_create'))
    dispatch(clearTransaction({ programId }))
    navigation.navigate('Home')
  }

  const handleSubmitOtherSequence: SubmitHandler<
    CompletedSequenceForm
  > = async (data) => {
    if (!consumptionPayload || !selectedWorkspace?.id || isLoading) return

    try {
      const payload = mergePayloadWithOtherSequence(consumptionPayload, data)
      await createConsumptionTransaction(payload).unwrap()
      await handleSuccessCreateTransaction(selectedWorkspace.id)
    } catch (error) {
      handleError(error as ErrorResponse)
    } finally {
      closeCompletedSequenceSheet()
    }
  }

  const handleSubmitTransaction = async () => {
    if (!selectedWorkspace || !activeMenu?.transactionType || isLoading) return

    const useCase = transactionUseCases[activeMenu.transactionType]

    try {
      await useCase.submit(selectedWorkspace, transactions, activity, customer)
      await handleSuccessCreateTransaction(selectedWorkspace.id)
    } catch (error) {
      handleError(error as ErrorResponse)
    }
  }

  const currentUseCase = activeMenu?.transactionType
    ? transactionUseCases[activeMenu.transactionType]
    : null

  const additionalProps = currentUseCase?.additionalProps

  const isLoading = [
    currentUseCase?.isLoading,
    isLoadingMaterial,
    isFetchingMaterial,
  ].some(Boolean)

  useEffect(() => {
    if (consumptionPayload && sequenceError && actualConsumptionDate) {
      const patients = convertValidationError(consumptionPayload, sequenceError)
      setValue('actual_consumption_date', actualConsumptionDate)
      setValue('patients', patients)
      openCompletedSequenceSheet()
    }
  }, [actualConsumptionDate, consumptionPayload, sequenceError, setValue])

  return {
    methods,
    activity,
    customer,
    transactionItems,
    isLoading,
    isOpenCompletedSequence,
    closeCompletedSequenceSheet,
    handleSubmitOtherSequence: handleSubmit(handleSubmitOtherSequence),
    handleDeleteItem,
    handleClearTransaction,
    handleSubmitTransaction,
    ...additionalProps,
  }
}
