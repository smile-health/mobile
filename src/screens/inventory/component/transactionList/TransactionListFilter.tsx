import React, { useMemo } from 'react'
import { View, Text } from 'react-native'
import { Icons } from '@/assets/icons'
import { ImageButton } from '@/components/buttons'
import DateRangePickerChip from '@/components/filter/DateRangePickerChip'
import PickerSelect, {
  PickerComponentProps,
} from '@/components/filter/PickerSelect'
import { useLanguage } from '@/i18n/useLanguage'
import { IOptions } from '@/models/Common'
import { TransactionListFilter as ListFilter } from '@/models/transaction/Transaction'
import { getMaterialOption } from '@/services/features'
import { useAppSelector } from '@/services/store'
import AppStyles from '@/theme/AppStyles'
import colors from '@/theme/colors'
import { cn } from '@/theme/theme-config'
import { getOptionWithDefaultValue, getTestID } from '@/utils/CommonUtils'

interface FilterText {
  material?: string
  activity?: string
  trxType?: string
}
interface TransactionFilterProp {
  filter: ListFilter | null
  filterText: FilterText
  onApply: (data: ListFilter) => void
  onResetFilter: () => void
  onOpenFilter: () => void
}

function SearchMaterial({ openBottomSheet }: Readonly<PickerComponentProps>) {
  return (
    <ImageButton
      Icon={Icons.IcSearch}
      color={colors.marine}
      size={20}
      onPress={openBottomSheet}
      {...getTestID('btn-open-filter')}
    />
  )
}

function TransactionListFilter(props: Readonly<TransactionFilterProp>) {
  const { filterText, filter, onApply, onOpenFilter, onResetFilter } = props
  const materialList = useAppSelector(getMaterialOption)
  const { t } = useLanguage()

  const shouldShowAppliedFilter = Object.values(filterText).some(
    (value) => !!value
  )

  const shouldShowActivityTransaction =
    filterText.activity ?? filterText.trxType

  const FilterIcon = shouldShowAppliedFilter
    ? Icons.IcFilterFilled
    : Icons.IcFilterOutlined

  const materialOptions = useMemo(
    () => getOptionWithDefaultValue(materialList, t, 'label.all_material'),
    [t, materialList]
  )

  const handleSelectMaterial = (material: IOptions) => {
    onApply({ ...filter, material_id: material.value ?? undefined })
  }

  const handleApplyDateRangeFilter = (startDate: string, endDate: string) => {
    onApply({
      ...filter,
      start_date: startDate,
      end_date: endDate,
    })
  }

  return (
    <React.Fragment>
      <View className='flex-row items-center bg-white border-b border-whiteTwo px-4 py-3 gap-x-3'>
        <View className='flex-1 items-start'>
          <DateRangePickerChip
            name='TransactionDateFilter'
            startDate={filter?.start_date}
            endDate={filter?.end_date}
            onApply={handleApplyDateRangeFilter}
            testID='daterangepicker-transaction'
          />
        </View>
        <PickerSelect
          value={filter?.material_id}
          name='TransactionMaterialFilter'
          data={materialOptions}
          title={t('label.select_material')}
          onSelect={handleSelectMaterial}
          radioButtonColor={colors.main()}
          PickerComponent={SearchMaterial}
          searchPlaceholder={t('label.type_material_name')}
          search
          testID='pickerselect-material'
        />
        <ImageButton
          Icon={FilterIcon}
          size={24}
          onPress={onOpenFilter}
          {...getTestID('btn-open-filter')}
        />
      </View>
      {shouldShowAppliedFilter && (
        <View className='bg-polynesianBlue px-4 py-1 gap-y-1'>
          <View className='flex-row items-start gap-x-1'>
            <Text className={AppStyles.labelRegular}>
              {t('label.search_result_for')}
            </Text>
            <Text
              className={cn(AppStyles.labelRegular, 'flex-1 text-scienceBlue')}>
              {filterText.material}
            </Text>
            <ImageButton
              onPress={onResetFilter}
              Icon={Icons.IcDelete}
              size={16}
              {...getTestID('btn-reset-filters')}
            />
          </View>
          {shouldShowActivityTransaction && (
            <View className='flex-row items-center gap-x-2'>
              <Text className={AppStyles.textBoldSmall}>
                {t('label.activity')}:{' '}
                <Text className={AppStyles.textRegularSmall}>
                  {filterText.activity ?? t('label.all')}
                </Text>
              </Text>
              <Text className={AppStyles.textBoldSmall}>
                {t('label.transaction_type')}:{' '}
                <Text className={AppStyles.textRegularSmall}>
                  {filterText.trxType ?? t('label.all')}
                </Text>
              </Text>
            </View>
          )}
        </View>
      )}
    </React.Fragment>
  )
}

export default React.memo(TransactionListFilter)
