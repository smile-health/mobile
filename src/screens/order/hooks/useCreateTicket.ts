import { useState, useMemo } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import { useNavigation } from '@react-navigation/native'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { getTicketMaterials, setTicketFormData } from '@/services/features'
import { useAppSelector, useAppDispatch } from '@/services/store'
import { dateToString } from '@/utils/DateFormatUtils'
import { createTicketSchema } from '../schema/CreateTicketSchema'

export type CreateTicketForm = yup.InferType<typeof createTicketSchema>

export function useCreateTicket({ t }) {
  const navigation = useNavigation()
  const dispatch = useAppDispatch()

  const [step, setStep] = useState(1)

  const {
    control,
    watch,
    trigger,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm<CreateTicketForm>({
    resolver: yupResolver(createTicketSchema),
    mode: 'onChange',
    defaultValues: {
      doNumber: '',
      arrivalDate: undefined,
      isSubmitted: 0,
    },
  })

  const ticketMaterials = useAppSelector(getTicketMaterials)

  const formValues = watch()

  const isFormInvalid = useMemo(() => {
    return (
      Object.keys(errors).length > 0 ||
      !formValues.doNumber ||
      !formValues.arrivalDate ||
      (formValues.isSubmitted !== 0 && formValues.isSubmitted !== 1)
    )
  }, [errors, formValues])

  const isReviewDisabled = useMemo(() => {
    return step === 2 && (!ticketMaterials || ticketMaterials.length === 0)
  }, [ticketMaterials, step])

  const handleNext = async () => {
    const valid = await trigger()
    if (valid) setStep(2)
  }

  const handlePrevious = () => {
    setStep(1)
  }

  const handleReview = () => {
    const formValues = watch()
    dispatch(
      setTicketFormData({
        doNumber: formValues.doNumber,
        arrivalDate: dateToString(formValues.arrivalDate, 'YYYY-MM-DD'),
        isSubmitted: formValues.isSubmitted,
      })
    )
    navigation.navigate('ReviewTicket')
  }

  const mainButtonLabel = step === 1 ? t('button.next') : t('button.review')
  const handleMainButton = step === 1 ? handleNext : handleReview
  const mainButtonDisabled = step === 1 ? isFormInvalid : isReviewDisabled

  return {
    step,
    setStep,
    mainButtonLabel,
    handleMainButton,
    mainButtonDisabled,
    control,
    errors,
    watch,
    setValue,
    handlePrevious,
    clearErrors,
  }
}
