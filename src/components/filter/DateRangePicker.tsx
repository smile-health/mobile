import React, { useMemo, useState } from 'react'
import { TouchableOpacity, Text, View } from 'react-native'
import { Icons } from '@/assets/icons'
import AppStyles from '@/theme/AppStyles'
import colors from '@/theme/colors'
import { cn } from '@/theme/theme-config'
import { getTestID } from '@/utils/CommonUtils'
import { DATE_FILTER_FORMAT, SHORT_DATE_FORMAT } from '@/utils/Constants'
import { convertString, getDaysAfter } from '@/utils/DateFormatUtils'
import DateRangePickerBottomSheet from '../bottomsheet/DateRangePickerBottomSheet'

interface Props {
  name: string
  testID: string
  onApply: (startDate: string, enDate: string) => void
  label?: string
  placeholder?: string
  startDate?: string
  endDate?: string
  minDate?: string
  maxDate?: string
  className?: string
  disabled?: boolean
}

const DEFAULT_DATE = convertString(getDaysAfter(1), DATE_FILTER_FORMAT) // 1 day after today

function DateRangePicker({
  name,
  startDate,
  endDate,
  minDate,
  maxDate = DEFAULT_DATE,
  testID,
  label,
  placeholder,
  className,
  disabled,
  onApply,
}: Readonly<Props>) {
  const [isOpenDateRange, setIsOpenDateRange] = useState(false)

  const periodText = useMemo(() => {
    if (!startDate || !endDate) return
    const start = convertString(startDate, SHORT_DATE_FORMAT)
    const end = convertString(endDate, SHORT_DATE_FORMAT)
    return `${start} - ${end}`
  }, [endDate, startDate])

  const toggleDateRangePicker = () => {
    setIsOpenDateRange((prev) => !prev)
  }

  const handleApplyDateRangeFilter = (
    newStartDate: string,
    newEndDate: string
  ) => {
    onApply(newStartDate, newEndDate)
    toggleDateRangePicker()
  }

  return (
    <React.Fragment>
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
                periodText ? 'text-mediumGray' : 'text-lightBlueGray'
              )}>
              {label}
            </Text>
          )}
          <TouchableOpacity
            disabled={disabled}
            className={cn('flex-row items-center mt-0.5', label ? '' : 'py-2')}
            activeOpacity={0.7}
            onPress={toggleDateRangePicker}
            {...getTestID(testID)}>
            {periodText ? (
              <Text
                className={cn(
                  AppStyles.textRegular,
                  'flex-1 uppercase',
                  disabled ? 'text-mediumGray' : ''
                )}>
                {periodText}
              </Text>
            ) : (
              <Text
                className={cn(AppStyles.textRegular, 'flex-1 text-mediumGray')}>
                {placeholder ?? label}
              </Text>
            )}
            <Icons.IcDate height={16} width={16} color={colors.mediumGray} />
          </TouchableOpacity>
        </View>
      </View>
      <DateRangePickerBottomSheet
        name={name}
        toggleSheet={toggleDateRangePicker}
        startDate={startDate}
        endDate={endDate}
        minDate={minDate}
        maxDate={maxDate}
        isOpen={isOpenDateRange}
        onApply={handleApplyDateRangeFilter}
      />
    </React.Fragment>
  )
}

export default React.memo(DateRangePicker)
