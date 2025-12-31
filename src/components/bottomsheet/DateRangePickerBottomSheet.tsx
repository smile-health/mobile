import React, { useCallback, useEffect, useMemo } from 'react'
import { View, Text } from 'react-native'
import { Calendar, useDateRange } from '@marceloterreiro/flash-calendar'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Icons } from '@/assets/icons'
import { useLanguage } from '@/i18n/useLanguage'
import AppStyles from '@/theme/AppStyles'
import colors from '@/theme/colors'
import { getTestID } from '@/utils/CommonUtils'
import { CALENDAR_DATE_FORMAT } from '@/utils/Constants'
import { convertString } from '@/utils/DateFormatUtils'
import { BottomSheet, BottomSheetProps } from './BottomSheet'
import { dateRangePickerTheme } from './theme/date-range-theme'
import { Button, ButtonProps, ImageButton } from '../buttons'
import { FieldValue } from '../list/FieldValue'

interface DateRangeBottomSheetProps extends BottomSheetProps {
  onApply: (startDate: string, endDate: string) => void
  startDate?: string
  endDate?: string
  minDate?: string
  maxDate?: string
  themeColor?: string
  applyButtonProps?: ButtonProps
}

const selectedDateClassName = 'text-base font-mainBold'

function DateRangePickerBottomSheet({
  onApply,
  startDate: initialStartDate,
  endDate: initialEndDate,
  minDate,
  maxDate,
  themeColor = colors.main() ?? colors.bluePrimary,
  toggleSheet,
  applyButtonProps,
  ...bottomSheetProps
}: Readonly<DateRangeBottomSheetProps>) {
  const insets = useSafeAreaInsets()
  const { t, currentLang } = useLanguage()

  const { calendarActiveDateRanges, onCalendarDayPress, onClearDateRange } =
    useDateRange({
      startId: initialStartDate,
      endId: initialEndDate,
    })
  const { endId, startId } = calendarActiveDateRanges[0] ?? {}

  const disableApplyButton = !startId || !endId

  const theme = useMemo(() => dateRangePickerTheme(themeColor), [themeColor])

  const handleApply = useCallback(() => {
    if (startId && endId) {
      onApply(startId, endId)
    }
  }, [endId, onApply, startId])

  useEffect(() => {
    const initializeCalendar = () => {
      if (initialStartDate && initialEndDate) {
        onCalendarDayPress(initialStartDate)
        onCalendarDayPress(initialEndDate)
      } else {
        onClearDateRange()
      }
    }
    initializeCalendar()
  }, [initialEndDate, initialStartDate, onCalendarDayPress, onClearDateRange])

  return (
    <BottomSheet
      toggleSheet={toggleSheet}
      containerClassName='max-h-full'
      containerStyle={{ top: insets.top }}
      {...bottomSheetProps}>
      <View className='flex-row items-center px-4 py-3 gap-x-4 border-b border-quillGrey'>
        <ImageButton
          Icon={Icons.IcBack}
          color={colors.marine}
          size={24}
          onPress={toggleSheet}
          {...getTestID('btn-close-bottomsheet')}
        />
        <Text className={AppStyles.textBoldLarge}>
          {t('label.select_date')}
        </Text>
      </View>
      <Calendar.List
        calendarActiveDateRanges={calendarActiveDateRanges}
        onCalendarDayPress={onCalendarDayPress}
        calendarMinDateId={minDate}
        calendarMaxDateId={maxDate}
        calendarColorScheme='light'
        calendarPastScrollRangeInMonths={1200}
        calendarInitialMonthId={initialStartDate}
        calendarFormatLocale={currentLang?.code}
        calendarDayHeight={48}
        theme={theme}
      />
      <View className='bg-white border-t border-quillGrey items-center p-4 gap-y-2'>
        <Button
          preset='filled'
          containerClassName='w-full'
          disabled={disableApplyButton}
          text={t('button.apply')}
          onPress={handleApply}
          {...getTestID('btn-apply-filter')}
          {...applyButtonProps}
        />
        <View className='flex-row'>
          <FieldValue
            label={t('label.start_date')}
            value={convertString(startId, CALENDAR_DATE_FORMAT) || '-'}
            containerClassName='flex-1'
            labelClassName={selectedDateClassName}
            valueClassName={selectedDateClassName}
          />
          <FieldValue
            label={t('label.end_date')}
            value={convertString(endId, CALENDAR_DATE_FORMAT) || '-'}
            containerClassName='flex-1 items-end'
            labelClassName={selectedDateClassName}
            valueClassName={selectedDateClassName}
          />
        </View>
      </View>
    </BottomSheet>
  )
}

export default React.memo(DateRangePickerBottomSheet)
