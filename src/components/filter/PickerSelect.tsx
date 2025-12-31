import React, { ComponentType, useMemo, useState } from 'react'
import { TouchableOpacity, Text, View } from 'react-native'
import { Icons } from '@/assets/icons'
import { IOptions } from '@/models/Common'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import { getTestID } from '@/utils/CommonUtils'
import PickerSelectBottomSheet from '../bottomsheet/PickerSelectBottomSheet'

export interface PickerComponentProps {
  valueText?: string
  openBottomSheet?: () => void
}

interface Props {
  name: string
  testID: string
  data: IOptions[]
  onSelect: (item: IOptions) => void
  value?: number | string | null
  title?: string
  search?: boolean
  label?: string
  searchPlaceholder?: string
  radioButtonColor?: string
  placeholder?: string
  className?: string
  disabled?: boolean
  errors?: string
  errorTestID?: string
  isMandatory?: boolean
  onEndReached?: () => void
  onSearch?: (text: string) => void
  useApiSearch?: boolean
  PickerComponent?: ComponentType<PickerComponentProps>
  onRefresh?: () => void
  isLoading?: boolean
  isSearching?: boolean
}

function PickerSelect({
  name,
  data,
  testID,
  onSelect,
  value,
  title,
  label,
  search,
  searchPlaceholder,
  radioButtonColor,
  placeholder,
  className,
  disabled,
  errors,
  errorTestID,
  PickerComponent,
  isMandatory,
  onEndReached,
  onSearch,
  useApiSearch,
  onRefresh,
  isLoading,
  isSearching,
}: Readonly<Props>) {
  const [isOpenPickerSelect, setIsOpenPickerSelect] = useState(false)

  const togglePickerSelect = () => {
    setIsOpenPickerSelect((prev) => !prev)
  }

  const valueText = useMemo(
    () => data.find((d) => d.value === value)?.label,
    [data, value]
  )

  const renderComponent = () => {
    return PickerComponent ? (
      <PickerComponent
        valueText={valueText}
        openBottomSheet={togglePickerSelect}
      />
    ) : (
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
                valueText ? 'text-mediumGray' : 'text-lightBlueGray'
              )}>
              {label}
            </Text>
          )}
          <TouchableOpacity
            disabled={disabled}
            className={cn('flex-row items-center mt-0.5', label ? '' : 'py-2')}
            activeOpacity={0.7}
            onPress={togglePickerSelect}
            {...getTestID(testID)}>
            {valueText ? (
              <Text
                className={cn(
                  AppStyles.textRegular,
                  'flex-1',
                  disabled ? 'text-mediumGray' : ''
                )}>
                {valueText}
              </Text>
            ) : (
              <Text
                className={cn(AppStyles.textRegular, 'flex-1 text-mediumGray')}>
                {placeholder ?? label}
                {isMandatory && <Text className='text-warmPink'>*</Text>}
              </Text>
            )}
            <Icons.IcExpandMore height={20} width={20} />
          </TouchableOpacity>
        </View>
        {!!errors && (
          <Text
            className={cn(AppStyles.textRegularSmall, 'text-warmPink')}
            {...getTestID(errorTestID)}>
            {errors}
          </Text>
        )}
      </View>
    )
  }

  return (
    <React.Fragment>
      {renderComponent()}
      <PickerSelectBottomSheet
        name={name}
        isOpen={isOpenPickerSelect}
        title={title}
        toggleSheet={togglePickerSelect}
        data={data}
        value={value}
        onSelect={onSelect}
        search={search}
        searchPlaceholder={searchPlaceholder}
        radioButtonColor={radioButtonColor}
        onEndReached={onEndReached}
        onSearch={onSearch}
        useApiSearch={useApiSearch}
        onRefresh={onRefresh}
        isLoading={isLoading}
        isSearching={isSearching}
      />
    </React.Fragment>
  )
}

export default React.memo(PickerSelect)
