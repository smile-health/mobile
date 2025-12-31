import React, { useCallback, useMemo, useState } from 'react'
import {
  TouchableOpacity,
  View,
  Text,
  FlatList,
  ListRenderItem,
} from 'react-native'
import { useForm } from 'react-hook-form'
import { Icons } from '@/assets/icons'
import { useLanguage } from '@/i18n/useLanguage'
import AppStyles from '@/theme/AppStyles'
import colors from '@/theme/colors'
import { cn } from '@/theme/theme-config'
import { getTestID } from '@/utils/CommonUtils'
import { Country, getCountryList } from './countries'
import CountryItem from './CountryItem'
import { BottomSheet } from '../bottomsheet/BottomSheet'
import { ImageButton } from '../buttons'
import { SearchField } from '../forms'

interface CountryPickerProps {
  country?: Country
  onChangeCountry: (country: Country) => void
}

function CountryPicker({
  country,
  onChangeCountry,
}: Readonly<CountryPickerProps>) {
  const [isOpen, setIsOpen] = useState(false)
  const { watch, control } = useForm({
    defaultValues: { search: '' },
  })

  const { t } = useLanguage()

  const searchValue = watch('search')

  const filteredCountries = useMemo(() => {
    return getCountryList().filter((c) =>
      c.name.toLowerCase().includes(searchValue.toLocaleLowerCase())
    )
  }, [searchValue])

  const openCountryPicker = () => {
    setIsOpen(true)
  }

  const closeCountryPicker = () => {
    setIsOpen(false)
  }

  const handleChangeCountry = useCallback(
    (item: Country) => {
      onChangeCountry(item)
      closeCountryPicker()
    },
    [onChangeCountry]
  )

  const renderItem: ListRenderItem<Country> = useCallback(
    ({ item }) => <CountryItem item={item} onSelect={handleChangeCountry} />,
    [handleChangeCountry]
  )

  return (
    <React.Fragment>
      <TouchableOpacity
        onPress={openCountryPicker}
        className='flex-row items-center px-1 gap-x-2'>
        <View className='flex-row items-center gap-x-1'>
          <Text>{country?.emoji}</Text>
          <Icons.IcExpandMore fill={colors.mediumGray} />
        </View>
        <View className='h-6 border-l border-quillGrey' />
        <Text className={cn(AppStyles.labelRegular, 'text-sm')}>
          +{country?.dialCode}
        </Text>
      </TouchableOpacity>
      <BottomSheet
        isOpen={isOpen}
        name='CountryPickerBottomSheet'
        toggleSheet={closeCountryPicker}
        containerClassName='h-3/4'>
        <View className='p-4'>
          <View className={AppStyles.rowBetween}>
            <Text className={AppStyles.textBold}>
              {t('section.select_a_country')}
            </Text>
            <ImageButton
              onPress={closeCountryPicker}
              Icon={Icons.IcDelete}
              color={colors.mediumGray}
              size={20}
              {...getTestID('btn-close-country-picker')}
            />
          </View>
          <SearchField
            name='search'
            control={control}
            placeholder={t('label.search')}
            containerClassName='bg-white py-3 border-b border-b-whiteTwo'
            testID='search-country'
          />
          <FlatList
            data={filteredCountries}
            renderItem={renderItem}
            keyExtractor={(item) => item.code}
            initialNumToRender={20}
            maxToRenderPerBatch={20}
            windowSize={21} // Render slightly more items
            removeClippedSubviews={true}
            showsVerticalScrollIndicator={false}
            contentContainerClassName='gap-y-1 py-1'
          />
        </View>
      </BottomSheet>
    </React.Fragment>
  )
}

export default React.memo(CountryPicker)
