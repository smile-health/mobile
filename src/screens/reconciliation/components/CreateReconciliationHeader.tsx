import React, { useMemo, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { Icons } from '@/assets/icons'
import { useLanguage } from '@/i18n/useLanguage'
import AppStyles from '@/theme/AppStyles'
import colors from '@/theme/colors'
import { cn } from '@/theme/theme-config'
import { getDateRangeText } from '@/utils/DateFormatUtils'
import ReconciliationPeriodBottomSheet from './ReconciliationPeriodBottomSheet'

interface Props {
  materialName: string
  startDate?: string
  endDate?: string
  onSelectDate: (start: string, end: string) => void
}

export function SelectPeriodLabel({ label, value }) {
  if (!value) {
    return (
      <Text className={cn(AppStyles.labelRegular, 'text-sm')}>{label}</Text>
    )
  }

  return (
    <View className='flex-row px-2 py-1 gap-x-1 rounded-3xl bg-catskillWhite border border-quillGrey'>
      <Text className={cn(AppStyles.textMediumSmall, 'uppercase')}>
        {value}
      </Text>
      <Icons.IcExpandMore width={16} height={16} />
    </View>
  )
}

function CreateReconciliationHeader({
  materialName,
  startDate,
  endDate,
  onSelectDate,
}: Readonly<Props>) {
  const { t } = useLanguage()
  const [isOpenPeriodBottomSheet, setIsOpenPeriodBottomSheet] = useState(false)

  const dateValue = useMemo(() => {
    if (!startDate || !endDate) return
    return getDateRangeText(startDate, endDate)
  }, [endDate, startDate])

  const toggleSheet = () => setIsOpenPeriodBottomSheet((prev) => !prev)

  return (
    <React.Fragment>
      <View className='bg-lightGrey p-4 gap-y-2'>
        <Text className={AppStyles.textBold}>{t('label.material')}</Text>
        <View className='bg-white p-2 border border-lightGreyMinimal rounded-sm'>
          <Text className={AppStyles.textMedium}>{materialName}</Text>
        </View>
      </View>
      <Pressable
        className='flex-row items-center px-4 py-3 border border-quillGrey'
        onPress={toggleSheet}>
        <View className='flex-1 items-start'>
          <SelectPeriodLabel
            label={t('label.select_period')}
            value={getDateRangeText(startDate, endDate)}
          />
        </View>
        <View
          className={cn(
            'border-[0.5px] border-mediumGray h-5 w-5 rounded items-center justify-center',
            dateValue ? 'bg-main' : 'bg-white'
          )}>
          <Icons.IcDate
            height={16}
            width={16}
            color={dateValue ? colors.white : colors.mediumGray}
          />
        </View>
      </Pressable>
      <ReconciliationPeriodBottomSheet
        isOpen={isOpenPeriodBottomSheet}
        startDate={startDate}
        endDate={endDate}
        toggleSheet={toggleSheet}
        onSelectDate={onSelectDate}
      />
    </React.Fragment>
  )
}

export default React.memo(CreateReconciliationHeader)
