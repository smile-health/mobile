import { useCallback, useMemo } from 'react'
import { useNavigation } from '@react-navigation/native'
import { useForm } from 'react-hook-form'
import { DATE_FILTER_FORMAT } from '@/utils/Constants'
import { dateToString, stringToDate } from '@/utils/DateFormatUtils'

function useRelocationReview() {
  const navigation = useNavigation()

  const { control, watch, setValue } = useForm({
    mode: 'onChange',
    defaultValues: {
      date: '',
      comment: '',
    },
  })

  const form = watch()
  const { date, comment } = form

  const dateString = useMemo(
    () => (date ? stringToDate(date) : undefined),
    [date]
  )

  const handleDateChange = useCallback(
    (val: Date) => setValue('date', dateToString(val, DATE_FILTER_FORMAT)),
    [setValue]
  )

  const onPressReviewRelocation = () => {
    navigation.navigate('RelocationFinalReview', form)
  }

  return {
    control,
    watch,
    setValue,
    dateString,
    handleDateChange,
    comment,
    onPressReviewRelocation,
  }
}

export default useRelocationReview
