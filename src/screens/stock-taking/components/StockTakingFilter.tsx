import React, { useMemo, useState } from 'react'
import { View, Text } from 'react-native'
import { Icons } from '@/assets/icons'
import { ImageButton } from '@/components/buttons'
import { CheckBox } from '@/components/buttons/CheckBox'
import { useLanguage } from '@/i18n/useLanguage'
import { StockTakingFilter } from '@/models/stock-taking/StockTakingList'
import AppStyles from '@/theme/AppStyles'
import colors from '@/theme/colors'
import { cn } from '@/theme/theme-config'
import { getTestID } from '@/utils/CommonUtils'
import { getDateRangeText } from '@/utils/DateFormatUtils'
import StockTakingFilterBottomSheet from './StockTakingFilterBottomSheet'

interface Props {
  filter: StockTakingFilter
  onApplyFilter: (filter: StockTakingFilter) => void
}

function StockTakingListHeader({ filter, onApplyFilter }: Readonly<Props>) {
  const { t } = useLanguage()
  const [isOpenFilter, setIsOpenFilter] = useState(false)

  const filterText = useMemo(() => {
    const { expired_start_date, expired_end_date, created_from, created_to } =
      filter
    return {
      createdDateRange: getDateRangeText(created_from, created_to),
      expiredDateRange: getDateRangeText(expired_start_date, expired_end_date),
    }
  }, [filter])

  const shouldShowFilter = Object.values(filterText).some(Boolean)

  const FilterIcon = filterText.expiredDateRange
    ? Icons.IcFilterFilled
    : Icons.IcFilterOutlined

  const handleToggleFilter = () => setIsOpenFilter((prev) => !prev)

  const handleToggleEmptybatch = () => {
    onApplyFilter({
      ...filter,
      only_have_qty: filter.only_have_qty ? 0 : 1,
    })
  }

  const handleDeleteFilter = () => {
    onApplyFilter({ only_have_qty: 1 })
  }

  return (
    <React.Fragment>
      <View className='flex-row items-center bg-white border-b border-whiteTwo px-4 py-3 gap-x-3'>
        <CheckBox
          checked={!filter.only_have_qty}
          text={t('label.show_empty_batch')}
          onPress={handleToggleEmptybatch}
          containerClassName='flex-1'
          leftIconColor={colors.main()}
        />
        <ImageButton
          Icon={FilterIcon}
          size={24}
          onPress={handleToggleFilter}
          {...getTestID('btn-open-filter')}
        />
      </View>
      {shouldShowFilter && (
        <View className='flex-row items-start bg-polynesianBlue px-4 py-1 gap-y-1'>
          <View className='gap-y-2 flex-1'>
            {filterText.createdDateRange && (
              <Text className={cn(AppStyles.textBoldSmall)}>
                {t('label.created')}:{' '}
                <Text className={AppStyles.textRegularSmall}>
                  {filterText.createdDateRange}
                </Text>
              </Text>
            )}
            {filterText.expiredDateRange && (
              <Text className={cn(AppStyles.textBoldSmall)}>
                {t('label.expired')}:{' '}
                <Text className={AppStyles.textRegularSmall}>
                  {filterText.expiredDateRange}
                </Text>
              </Text>
            )}
          </View>
          <ImageButton
            onPress={handleDeleteFilter}
            Icon={Icons.IcDelete}
            size={16}
            containerClassName='mt-1'
            {...getTestID('btn-reset-filters')}
          />
        </View>
      )}
      <StockTakingFilterBottomSheet
        toggleSheet={handleToggleFilter}
        isOpen={isOpenFilter}
        filter={filter}
        onApplyFilter={onApplyFilter}
      />
    </React.Fragment>
  )
}

export default React.memo(StockTakingListHeader)
