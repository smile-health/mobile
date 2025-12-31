import React from 'react'
import { View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Icons } from '@/assets/icons'
import AppStyles from '@/theme/AppStyles'
import colors from '@/theme/colors'
import { cn } from '@/theme/theme-config'
import { getTestID } from '@/utils/CommonUtils'
import { ImageButton } from '../buttons'
import { TextField, TextFieldProps } from '../forms'

export interface SearchBarProps extends TextFieldProps {
  onResetField?: () => void
  onPressBack?: () => void
}

export function SearchBar(props: Readonly<SearchBarProps>) {
  const { onResetField, onPressBack, testID, ...rest } = props

  const renderSearchIcon = () => {
    return <Icons.IcSearchSolid height={21} width={21} fill={colors.whiteTwo} />
  }

  const renderResetButton = () => {
    return (
      <ImageButton
        size={24}
        Icon={Icons.IcClearFilter}
        onPress={onResetField}
        {...getTestID('btn-reset-searchbar')}
      />
    )
  }
  return (
    <SafeAreaView edges={['top']} className='bg-main'>
      <View className={cn(AppStyles.rowCenter, 'px-4 py-1.5')}>
        <ImageButton
          size={24}
          Icon={Icons.IcBack}
          color={colors.mainText()}
          onPress={onPressBack}
          className='mr-2'
          {...getTestID('btn-back-searchbar')}
        />
        <TextField
          preset='base'
          returnKeyType='search'
          LeftAccessory={renderSearchIcon}
          RightAccessory={renderResetButton}
          containerClassName='bg-white p-2 rounded w-0 flex-1'
          inputClassName={cn(AppStyles.textRegularLarge, 'py-0 mx-2 h-6')}
          {...getTestID(testID)}
          {...rest}
        />
      </View>
    </SafeAreaView>
  )
}
