import React, { useMemo, useRef } from 'react'
import {
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
  TouchableOpacity,
} from 'react-native'
import { Control, useController } from 'react-hook-form'
import { Dropdown as BaseDropdown } from 'react-native-element-dropdown'
import { DropdownProps as BaseDropdownProps } from 'react-native-element-dropdown/lib/typescript/components/Dropdown/model'
import { Icons } from '@/assets/icons'
import AppStyles from '@/theme/AppStyles'
import colors from '@/theme/colors'
import fonts from '@/theme/fonts'
import { cn } from '@/theme/theme-config'
import { getTestID } from '@/utils/CommonUtils'
import { ImageButton } from '../buttons'

export interface DropdownProps<T>
  extends Omit<BaseDropdownProps<T>, 'onChange' | 'labelField' | 'valueField'> {
  name: string
  control?: Control<any>
  preset?: keyof typeof dropdownPresets
  label?: string
  helper?: string
  errors?: string
  valueField?: keyof T
  labelField?: keyof T
  labelTestID?: string
  helperTestID?: string
  errorTestID?: string
  labelClassName?: string
  containerClassName?: string
  isMandatory?: boolean
  withReset?: boolean
  onChangeValue?: (item: T) => void
  onResetField?: () => void
}

const haveValue = (value) => ![undefined, null, ''].includes(value)

export default function Dropdown<T>(props: Readonly<DropdownProps<T>>) {
  const {
    data,
    control,
    name,
    preset = 'default',
    label,
    valueField = 'value' as keyof T,
    labelField = 'label' as keyof T,
    helper,
    errors,
    labelTestID = `label-dropdown-${name}`,
    helperTestID = `helper-dropdown-${name}`,
    errorTestID = `error-dropdown-${name}`,
    labelClassName,
    containerClassName,
    style,
    containerStyle,
    placeholderStyle,
    itemTextStyle,
    itemContainerStyle,
    selectedTextStyle,
    inputSearchStyle,
    disable,
    withReset,
    onChangeValue,
    onResetField,
    isMandatory,
    placeholder,
    ...rest
  } = props

  const { field } = useController({
    control,
    name,
  })

  const labelDisableColor = disable ? 'text-lightSkyBlue' : 'text-lightBlueGray'
  const labelColor = haveValue(field.value)
    ? 'text-mediumGray'
    : labelDisableColor

  const className = useMemo(
    () => ({
      container: cn(baseContainerClassName, containerClassName),
      label: cn(
        AppStyles.textRegularSmall,
        'pt-2 bg-lightBlueGray px-1',
        labelColor,
        labelClassName,
        !!disable && 'bg-lightSkyBlue'
      ),
    }),
    [containerClassName, labelColor, labelClassName, disable]
  )

  const styles = useMemo(
    () => ({
      container: [
        dropdownPresets[preset].container,
        style,
        disable ? { backgroundColor: colors.lightSkyBlue } : {},
      ],
      listContainer: [baseStyles.listContainer, containerStyle],
      itemContainer: [baseStyles.itemContainer, itemContainerStyle],
      itemText: [baseStyles.itemText, itemTextStyle],
      placeholder: [
        dropdownPresets[preset].placeholder,
        placeholderStyle,
        disable && { color: colors.santaGrey },
      ],
      inputSearch: [baseStyles.inputSearch, inputSearchStyle],
      selectedText: [dropdownPresets[preset].selectedText, selectedTextStyle],
    }),
    [
      preset,
      style,
      containerStyle,
      itemContainerStyle,
      itemTextStyle,
      placeholderStyle,
      selectedTextStyle,
      inputSearchStyle,
      disable,
    ]
  )

  const defaultValue = useMemo(() => {
    return data.find((d) => d[valueField] === field.value)
  }, [data, field.value, valueField])

  const showReset = !!defaultValue && withReset

  const onChange = (item: T) => {
    if (onChangeValue) {
      onChangeValue(item)
    }
    field.onChange(item[valueField])
  }

  const resetField = () => {
    if (onResetField) {
      onResetField()
      return
    }
    field.onChange()
  }

  const renderRightIcon = () => {
    return (
      <View className='flex-row items-center gap-x-2'>
        {showReset && (
          <ImageButton
            Icon={Icons.IcDelete}
            onPress={resetField}
            size={16}
            color={colors.mediumGray}
            {...getTestID(`reset-dropdown-${name}`)}
          />
        )}
        <Icons.IcExpandMore height={20} width={20} fill={colors.mediumGray} />
      </View>
    )
  }

  const shouldShowAsterisk = haveValue(field.value) && isMandatory

  const conditionalPlaceholder = useMemo(() => {
    return isMandatory ? '' : placeholder
  }, [isMandatory, placeholder])

  const dropdownRef = useRef<any>(null)

  const openDropdown = () => {
    if (dropdownRef.current) {
      dropdownRef.current.open()
    }
  }

  return (
    <View className={className.container}>
      {!!label && (
        <Text className={className.label} {...getTestID(labelTestID)}>
          {label}
          {shouldShowAsterisk && <Text className='text-lavaRed'>*</Text>}
        </Text>
      )}
      <BaseDropdown
        ref={dropdownRef}
        style={styles.container}
        containerStyle={styles.listContainer}
        itemContainerStyle={styles.itemContainer}
        itemTextStyle={styles.itemText}
        placeholderStyle={styles.placeholder}
        selectedTextStyle={styles.selectedText}
        inputSearchStyle={styles.inputSearch}
        valueField={valueField}
        labelField={labelField}
        renderRightIcon={renderRightIcon}
        disable={disable}
        onChange={onChange}
        value={defaultValue}
        data={data}
        placeholder={conditionalPlaceholder}
        {...rest}
      />
      {isMandatory && !defaultValue && (
        <TouchableOpacity onPress={openDropdown} activeOpacity={0.7}>
          <Text
            className={
              (className.label,
              'absolute text-gray-500 text-sm left-1 mt-[-35] py-2')
            }
            {...getTestID(labelTestID)}>
            {label}
            <Text className='text-lavaRed'>*</Text>
          </Text>
        </TouchableOpacity>
      )}
      {!!errors && (
        <Text
          className={cn(AppStyles.textRegularSmall, 'text-warmPink')}
          {...getTestID(errorTestID)}>
          {errors}
        </Text>
      )}
      {!!helper && (
        <Text
          className={cn(AppStyles.textRegularSmall, 'text-warmGrey')}
          {...getTestID(helperTestID)}>
          {helper}
        </Text>
      )}
    </View>
  )
}

const baseContainerClassName = 'mt-2'

const dropdownPresets = {
  default: {
    container: {
      padding: 10,
      borderRadius: 4,
      backgroundColor: colors.white,
    } as ViewStyle,
    placeholder: {
      color: colors.mediumGray,
      fontFamily: fonts.mainRegular,
      fontSize: 14,
    } as TextStyle,
    selectedText: {
      fontFamily: fonts.mainRegular,
      fontSize: 14,
      color: colors.marine,
    } as TextStyle,
  },
  'bottom-border': {
    container: {
      borderBottomWidth: 1,
      borderBottomColor: colors.iron,
      paddingBottom: 8,
      backgroundColor: colors.lightBlueGray,
      paddingHorizontal: 4,
    } as ViewStyle,
    placeholder: {
      color: colors.mediumGray,
      fontFamily: fonts.mainRegular,
      fontSize: 14,
      paddingTop: 0,
    } as TextStyle,
    selectedText: {
      fontFamily: fonts.mainRegular,
      fontSize: 14,
      paddingTop: 0,
      color: colors.marine,
    } as TextStyle,
  },
}

const baseStyles = StyleSheet.create({
  inputSearch: {
    fontFamily: fonts.mainRegular,
  },
  itemContainer: {},
  itemText: {
    color: colors.marine,
    fontFamily: fonts.mainRegular,
    fontSize: 14,
  },
  listContainer: {},
})
