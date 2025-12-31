import React, { useMemo } from 'react'
import {
  FlatList,
  ListRenderItem,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { useForm } from 'react-hook-form'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Icons } from '@/assets/icons'
import { useLanguage } from '@/i18n/useLanguage'
import { IOptions } from '@/models/Common'
import AppStyles from '@/theme/AppStyles'
import colors from '@/theme/colors'
import { cn } from '@/theme/theme-config'
import { getTestID } from '@/utils/CommonUtils'
import { BottomSheet, BottomSheetProps } from './BottomSheet'
import { Button, ButtonProps, ImageButton } from '../buttons'
import { CheckBox } from '../buttons/CheckBox'
import { SearchField } from '../forms'

export interface MultiSelectBottomSheetProps extends BottomSheetProps {
  data: IOptions[]
  value: number[]
  onApply: (item: number[]) => void
  color?: string
  confirmButtonProps?: ButtonProps
  resetButtonProps?: ButtonProps
  title?: string
  defaultLabel?: string
  search?: boolean
  searchPlaceholder?: string
  itemTestID?: string
}

const className = {
  itemContainer:
    'flex-row items-center px-2 py-3 border-b border-quillGrey gap-x-4',
  itemLabel: cn(AppStyles.textMedium, 'flex-1'),
}

const CheckBoxAll = ({
  isEmpty,
  isSelectedAll,
  color,
}: {
  isEmpty: boolean
  isSelectedAll: boolean
  color: string
}) => {
  if (isEmpty) return <Icons.IcCheckBox />
  return isSelectedAll ? (
    <Icons.IcChecked color={color} />
  ) : (
    <Icons.IcPartialChecked height={16} width={16} color={color} />
  )
}

function MultiSelectBottomSheet({
  data,
  value,
  title,
  defaultLabel,
  search,
  searchPlaceholder,
  itemTestID = 'MultiSelectItem',
  onApply,
  toggleSheet,
  color = colors.bluePrimary,
  confirmButtonProps,
  resetButtonProps,
  ...bottomSheetProps
}: Readonly<MultiSelectBottomSheetProps>) {
  const { t } = useLanguage()
  const insets = useSafeAreaInsets()

  const { watch, control, setValue } = useForm({
    defaultValues: { label: '', selected: value },
  })
  const { label: searchLabel, selected } = watch()

  const isEmpty = selected.length === 0
  const isSelectedAll = selected.length === data.length && !isEmpty

  const filteredData = useMemo(() => {
    return data.filter((d) =>
      d.label.toLowerCase().includes(searchLabel.toLowerCase())
    )
  }, [searchLabel, data])

  const handleSelectItem = (item: IOptions) => {
    let copySelected = selected
    const index = copySelected.indexOf(item.value)
    if (index === -1) {
      copySelected.push(item.value)
    } else {
      copySelected = copySelected.filter((value) => value !== item.value)
    }
    setValue('selected', copySelected)
  }

  const handleSelectAll = () => {
    setValue('selected', isEmpty ? data.map((d) => d.value) : [])
  }

  const handleReset = () => {
    setValue(
      'selected',
      data.map((d) => d.value)
    )
  }

  const handleApplySelection = () => {
    onApply(selected)
    toggleSheet()
  }

  const renderHeader = () => {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        className={className.itemContainer}
        onPress={handleSelectAll}
        {...getTestID(`${itemTestID}-all`)}>
        <Text className={className.itemLabel}>
          {defaultLabel ?? t('label.all')}
        </Text>
        <CheckBoxAll
          isEmpty={isEmpty}
          isSelectedAll={isSelectedAll}
          color={color}
        />
      </TouchableOpacity>
    )
  }

  const renderItem: ListRenderItem<IOptions> = ({ item, index }) => {
    const checked = selected.includes(item.value)
    const selectItem = () => handleSelectItem(item)
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        className={className.itemContainer}
        onPress={selectItem}
        {...getTestID(`${itemTestID}-${index}`)}>
        <Text className={className.itemLabel}>{item.label}</Text>
        <CheckBox
          leftIconColor={color}
          checked={checked}
          containerClassName='gap-x-0'
          onPress={selectItem}
        />
      </TouchableOpacity>
    )
  }

  return (
    <BottomSheet
      toggleSheet={toggleSheet}
      containerClassName='max-h-full'
      containerStyle={{ top: insets.top }}
      {...bottomSheetProps}>
      <View className='bg-white flex-1'>
        <View className='flex-row items-center px-4 py-3 gap-x-4'>
          <ImageButton
            Icon={Icons.IcBack}
            color={colors.marine}
            size={24}
            onPress={toggleSheet}
            {...getTestID('btn-close-multiselect-bottomsheet')}
          />
          <Text className={AppStyles.textBoldLarge}>
            {title ?? t('label.select_item')}
          </Text>
        </View>
        {search && (
          <SearchField
            control={control}
            placeholder={searchPlaceholder ?? t('label.search')}
            name='label'
            containerClassName='px-4 py-2 border-b border-quillGrey'
            testID='multiselect-search'
          />
        )}
        <FlatList
          data={filteredData}
          renderItem={renderItem}
          ListHeaderComponent={renderHeader}
          ListHeaderComponentClassName='pt-4'
          contentContainerClassName='px-4 gap-y-4 flex-grow'
        />
        <View className='flex-row justify-between border-t border-quillGrey items-center p-4 gap-x-2'>
          <Button
            preset='outlined-primary'
            containerClassName='flex-1'
            text={t('button.reset')}
            onPress={handleReset}
            {...getTestID('btn-reset-filter')}
            {...resetButtonProps}
          />
          <Button
            preset='filled'
            containerClassName='flex-1'
            text={t('button.apply')}
            onPress={handleApplySelection}
            {...getTestID('btn-apply-filter')}
            {...confirmButtonProps}
          />
        </View>
      </View>
    </BottomSheet>
  )
}

export default React.memo(MultiSelectBottomSheet)
