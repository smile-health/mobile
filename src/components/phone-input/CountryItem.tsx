import React from 'react'
import { TouchableOpacity, View, Text } from 'react-native'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import { getTestID } from '@/utils/CommonUtils'
import { Country } from './countries'

interface CountryItemProps {
  item: Country
  onSelect: (country: Country) => void
}

const CountryItem = ({ item, onSelect }: CountryItemProps) => (
  <TouchableOpacity
    activeOpacity={0.7}
    className='flex-row items-center gap-x-2 py-2.5'
    onPress={() => onSelect(item)}
    {...getTestID(`country-${item.name}`)}>
    <View className='flex-row items-center gap-x-1 w-16'>
      <Text>{item.emoji}</Text>
      <Text className={cn(AppStyles.labelRegular, 'text-sm')}>
        +{item.dialCode}
      </Text>
    </View>
    <Text className={cn(AppStyles.textRegular, 'flex-1')}>{item.name}</Text>
  </TouchableOpacity>
)

export default React.memo(CountryItem)
