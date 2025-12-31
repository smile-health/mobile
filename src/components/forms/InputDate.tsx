import React, { useState } from 'react'
import { View, Text, TouchableOpacity, Platform } from 'react-native'
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker'
import { Icons } from '@/assets/icons'
import AppStyles from '@/theme/AppStyles'
import colors from '@/theme/colors'
import { cn } from '@/theme/theme-config'
import { getTestID } from '@/utils/CommonUtils'
import { SHORT_DATE_FORMAT } from '@/utils/Constants'
import { dateToString } from '@/utils/DateFormatUtils'
import DateTimeBottomSheet from '../bottomsheet/DateTimeBottomSheet'

interface InputDateProps {
  date?: Date | null
  label?: string
  placeholder?: string
  onDateChange: (date: Date) => void
  dateFormat?: string
  className?: string
  maximumDate?: Date
  minimumDate?: Date
  isMandatory?: boolean
  testID?: string
  helper?: string
  helperTestID?: string
  errors?: string
  errorTestID?: string
  disabled?: boolean
}

export default function InputDate(props: Readonly<InputDateProps>) {
  const {
    date,
    label,
    placeholder,
    onDateChange,
    dateFormat = SHORT_DATE_FORMAT,
    className,
    minimumDate,
    maximumDate,
    isMandatory,
    helper,
    errors,
    testID,
    helperTestID,
    errorTestID,
    disabled = false,
  } = props
  const [localDate, setLocalDate] = useState<Date>(date ?? new Date())
  const [show, setShow] = useState<boolean>(false)

  const shouldShowRequiredMark = isMandatory && date

  function onChange({ type }: DateTimePickerEvent, selectedDate?: Date) {
    if (type === 'set') {
      const currentDate = selectedDate || localDate
      setLocalDate(currentDate)

      if (Platform.OS === 'android') {
        onDateChange(currentDate)
      }
    }
    dismissDialog()
  }

  function openDatePicker() {
    setShow(true)
  }

  function dismissDialog() {
    setShow(false)
  }

  function onConfirm(selectedDate?: Date) {
    if (selectedDate) {
      setLocalDate(selectedDate)
      onDateChange(selectedDate)
    }
  }

  return (
    <View className={cn('w-full mt-2 flex-1', className)}>
      <View
        className={cn(
          AppStyles.borderBottom,
          'px-1 py-2',
          disabled ? 'bg-lightSkyBlue' : 'bg-lightBlueGray'
        )}>
        {!!label && (
          <Text
            className={cn(
              AppStyles.textMediumSmall,
              date ? 'text-mediumGray' : 'text-lightBlueGray'
            )}>
            {label}
            {shouldShowRequiredMark && <Text className='text-lavaRed'>*</Text>}
          </Text>
        )}
        <TouchableOpacity
          disabled={disabled}
          className={cn('flex-row items-center mt-0.5', label ? '' : 'py-2')}
          activeOpacity={0.7}
          onPress={openDatePicker}
          {...getTestID(testID)}>
          {date ? (
            <Text
              className={cn(
                AppStyles.textRegular,
                'flex-1 uppercase',
                disabled ? 'text-mediumGray' : ''
              )}>
              {dateToString(date, dateFormat)}
            </Text>
          ) : (
            <Text
              className={cn(AppStyles.textRegular, 'flex-1 text-mediumGray')}>
              {placeholder ?? label}
              {isMandatory && (
                <Text className={cn(AppStyles.textRegular, 'text-lavaRed')}>
                  *
                </Text>
              )}
            </Text>
          )}

          <Icons.IcDate height={16} width={16} color={colors.mediumGray} />
        </TouchableOpacity>
      </View>
      {!!errors && (
        <Text
          className={cn(AppStyles.textRegularSmall, 'text-warmPink')}
          {...getTestID(errorTestID)}>
          {errors}
        </Text>
      )}
      {!!helper && (
        <Text
          className={cn(AppStyles.textRegularSmall, 'text-mediumGray')}
          {...getTestID(helperTestID)}>
          {helper}
        </Text>
      )}
      {show && Platform.OS === 'android' && (
        <DateTimePicker
          value={localDate}
          mode='date'
          display='spinner'
          onChange={onChange}
          maximumDate={maximumDate}
          minimumDate={minimumDate}
          testID='datetimepicker-modal'
        />
      )}
      {Platform.OS === 'ios' && (
        <DateTimeBottomSheet
          maximumDate={maximumDate}
          minimumDate={minimumDate}
          date={localDate}
          modalVisible={show}
          dismissDialog={dismissDialog}
          onDateChange={onConfirm}
          testID='datetimepicker-modal'
        />
      )}
    </View>
  )
}
