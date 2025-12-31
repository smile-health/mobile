import React, { useMemo, useCallback, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
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
import { ImageButton, Button } from '../buttons'
import RadioButton from '../buttons/RadioButton'
import { SearchField } from '../forms'

export interface PickerSelectBottomSheetProps extends BottomSheetProps {
  data: IOptions[]
  onSelect: (item: IOptions) => void
  value?: number | string | null
  title?: string
  search?: boolean
  radioButtonColor?: string
  searchPlaceholder?: string
  itemTestID?: string
  onEndReached?: () => void
  onSearch?: (text: string) => void
  useApiSearch?: boolean
  onRefresh?: () => void
  isLoading?: boolean
  isSearching?: boolean
}

const className = {
  itemContainer:
    'flex-row items-center px-2 py-3 border-b border-quillGrey gap-x-4',
  itemLabel: cn(AppStyles.textMedium, 'flex-1'),
}

function PickerSelectBottomSheet({
  data,
  value,
  title,
  search,
  searchPlaceholder,
  radioButtonColor,
  itemTestID,
  onSelect,
  toggleSheet,
  onEndReached,
  onSearch,
  useApiSearch = false,
  onRefresh,
  isLoading = false,
  isSearching = false,
  ...bottomSheetProps
}: Readonly<PickerSelectBottomSheetProps>) {
  const [localLoading, setLocalLoading] = useState(false)

  const { t } = useLanguage()
  const insets = useSafeAreaInsets()

  const { watch, control, setValue } = useForm({
    defaultValues: { label: '' },
  })
  const { label: searchLabel } = watch()

  // Handle search text change
  const handleSearchChange = useCallback(
    (text: string) => {
      setValue('label', text)
      // Call onSearch if using API search
      if (useApiSearch && onSearch) {
        onSearch(text)
      }
    },
    [onSearch, useApiSearch, setValue]
  )

  // Filter data locally if not using API search
  const filteredData = useMemo(() => {
    if (useApiSearch) return data

    return data.filter((d) =>
      d?.label?.toLowerCase().includes(searchLabel.toLowerCase())
    )
  }, [data, searchLabel, useApiSearch])

  const handleSelectItem = (item: IOptions) => {
    onSelect(item)
    toggleSheet()
  }

  const handleLocalRefresh = () => {
    if (!onRefresh) return

    setLocalLoading(true)

    try {
      onRefresh()
    } finally {
      setTimeout(() => {
        setLocalLoading(false)
      }, 500)
    }
  }

  const renderEmptyComponent = () => {
    if (isLoading || localLoading) {
      return (
        <View className='flex-1 items-center justify-center py-8'>
          <ActivityIndicator size='large' color={colors.marine} />
          <Text className='text-gray-500 text-sm mt-4'>{t('please_wait')}</Text>
        </View>
      )
    }

    const hasSearchText = searchLabel.trim().length > 0
    const shouldShowNotFound = isSearching || hasSearchText

    if (shouldShowNotFound) {
      return (
        <View className='flex-1 items-center justify-center py-8'>
          <View className='mb-3 w-8 h-8 rounded-full bg-gray-200 items-center justify-center'>
            <Text className='text-gray-500 text-lg'>🔍</Text>
          </View>
          <Text className='text-gray-700 font-medium text-center mb-1'>
            {t('error.not_found')}
          </Text>
          <Text className='text-gray-500 text-sm text-center mb-4'>
            {t('error.not_found_description')}
          </Text>
        </View>
      )
    }

    if (!onRefresh) return null

    return (
      <View className='flex-1 items-center justify-center py-8'>
        <View className='mb-3 w-8 h-8 rounded-full bg-gray-200 items-center justify-center'>
          <Text className='text-gray-500 text-lg'>⚠</Text>
        </View>
        <Text className='text-gray-700 font-medium text-center mb-1'>
          {t('error.failed_fetch_data')}
        </Text>
        <Text className='text-gray-500 text-sm text-center mb-4'>
          {t('error.failed_fetch_data_description')}
        </Text>
        <Button
          preset='filled'
          text={t('button.refresh')}
          onPress={handleLocalRefresh}
        />
      </View>
    )
  }

  const renderItem = ({ item, index }) => {
    const selected = item.value === value
    const isNewMaterial = item.label === t('ticket.new_material')
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        className={className.itemContainer}
        onPress={() => handleSelectItem(item)}
        {...getTestID(`${itemTestID}-${index}`)}>
        <Text className={cn(className.itemLabel, isNewMaterial && 'text-main')}>
          {item.label}
        </Text>
        <RadioButton
          selected={selected}
          accessible={false}
          color={radioButtonColor}
        />
      </TouchableOpacity>
    )
  }

  return (
    <BottomSheet
      containerClassName='h-full'
      containerStyle={{ top: insets.top }}
      toggleSheet={toggleSheet}
      {...bottomSheetProps}>
      <View
        className='bg-white flex-1'
        style={{ paddingBottom: insets.bottom + 8 }}>
        <View className='flex-row items-center px-4 py-3 gap-x-4'>
          <ImageButton
            Icon={Icons.IcBack}
            color={colors.marine}
            size={24}
            onPress={toggleSheet}
            {...getTestID('btn-close-bottomsheet')}
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
            testID='picker-search'
            onChangeText={handleSearchChange}
          />
        )}
        <FlatList
          data={filteredData}
          renderItem={renderItem}
          contentContainerClassName='p-4 gap-y-4 flex-grow'
          onEndReached={onEndReached}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={renderEmptyComponent}
        />
      </View>
    </BottomSheet>
  )
}

export default React.memo(PickerSelectBottomSheet)
