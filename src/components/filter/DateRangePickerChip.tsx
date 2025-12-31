import React, { useMemo, useState } from 'react'
import { Pressable, Text } from 'react-native'
import { Icons } from '@/assets/icons'
import { useLanguage } from '@/i18n/useLanguage'
import AppStyles from '@/theme/AppStyles'
import { getTestID } from '@/utils/CommonUtils'
import { DATE_FILTER_FORMAT, DATE_FORMAT } from '@/utils/Constants'
import { convertString, getDaysAfter } from '@/utils/DateFormatUtils'
import DateRangePickerBottomSheet from '../bottomsheet/DateRangePickerBottomSheet'

interface Props {
  name: string
  testID: string
  onApply: (startDate: string, enDate: string) => void
  startDate?: string
  endDate?: string
  minDate?: string
  maxDate?: string
}

const DEFAULT_DATE = convertString(getDaysAfter(1), DATE_FILTER_FORMAT) // 1 day after today

function DateRangePickerChip({
  name,
  startDate,
  endDate,
  maxDate = DEFAULT_DATE,
  minDate,
  testID,
  onApply,
}: Readonly<Props>) {
  const { t } = useLanguage()
  const [isOpenDateRange, setIsOpenDateRange] = useState(false)

  const toggleDateRangePicker = () => {
    setIsOpenDateRange((prev) => !prev)
  }

  const periodText = useMemo(() => {
    if (!startDate || !endDate) return t('label.select_date')
    const start = convertString(startDate, DATE_FORMAT)
    const end = convertString(endDate, DATE_FORMAT)
    return `${start} - ${end}`
  }, [endDate, startDate, t])

  const handleApplyDateRangeFilter = (
    newStartDate: string,
    newEndDate: string
  ) => {
    onApply(newStartDate, newEndDate)
    toggleDateRangePicker()
  }

  return (
    <React.Fragment>
      <Pressable
        onPress={toggleDateRangePicker}
        className='flex-row px-2 py-1 gap-x-1 rounded-3xl bg-catskillWhite border border-quillGrey'
        {...getTestID(testID)}>
        <Text className={AppStyles.textMediumSmall}>{periodText}</Text>
        <Icons.IcExpandMore width={16} height={16} />
      </Pressable>
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

export default React.memo(DateRangePickerChip)
