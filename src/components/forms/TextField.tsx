import React, {
  ComponentType,
  forwardRef,
  Ref,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  Text,
  TextInput,
  TextInputProps,
  View,
  Platform,
  StyleSheet,
} from 'react-native'
import { Control, useController } from 'react-hook-form'
import AppStyles from '@/theme/AppStyles'
import colors from '@/theme/colors'
import { cn } from '@/theme/theme-config'
import { getTestID } from '@/utils/CommonUtils'
export interface TextFieldAccessoryProps {
  status: TextFieldProps['status']
  multiline?: boolean
  editable: boolean
  accessoryClassName?: string
  name: string
}

export interface TextFieldProps
  extends Omit<TextInputProps, 'ref' | 'className'> {
  name: string
  preset?: keyof typeof textFieldPreset
  control?: Control<any>
  status?: 'error' | 'disabled'
  label?: string
  isMandatory?: boolean
  helper?: string
  errors?: string
  labelTestID?: string
  helperTestID?: string
  errorTestID?: string
  placeholder?: string
  inputClassName?: string
  containerClassName?: string
  inputWrapperClassName?: string
  labelClassName?: string
  RightAccessory?: ComponentType<TextFieldAccessoryProps>
  LeftAccessory?: ComponentType<TextFieldAccessoryProps>
  applyPlatformFix?: boolean // New prop to apply platform-specific fixes
}

export const TextField = forwardRef(function TextField(
  props: TextFieldProps,
  ref: Ref<TextInput | null>
) {
  const [isFocus, setIsFocus] = useState(false)
  const {
    preset = 'default',
    name,
    control,
    label,
    isMandatory = false,
    placeholder,
    helper,
    errors,
    labelTestID = `label-textfield-${name}`,
    helperTestID = `helper-textfield-${name}`,
    errorTestID = `error-textfield-${name}`,
    status,
    RightAccessory,
    LeftAccessory,
    inputClassName,
    containerClassName,
    inputWrapperClassName,
    labelClassName,
    editable,
    applyPlatformFix = true,
    onChangeText,
    ...TextInputProps
  } = props

  const { field } = useController({
    control,
    name,
  })

  const input = useRef<TextInput>(null)

  const disabled = editable === false || status === 'disabled'
  const getDynamicColor = (
    isFocus: boolean,
    value: string,
    options: {
      focusColor: string
      emptyColor: string
      filledColor: string
    }
  ) => {
    if (isFocus) return options.focusColor
    return [null, undefined, ''].includes(value)
      ? options.emptyColor
      : options.filledColor
  }

  const labelColor = useMemo(
    () =>
      getDynamicColor(isFocus, field.value, {
        focusColor: 'text-main',
        emptyColor: 'text-lightBlueGray',
        filledColor: 'text-mediumGray',
      }),
    [isFocus, field.value]
  )

  const asteriskColor = useMemo(
    () =>
      getDynamicColor(isFocus, field.value, {
        focusColor: 'text-lavaRed',
        emptyColor: 'text-lightBlueGray',
        filledColor: 'text-lavaRed',
      }),
    [isFocus, field.value]
  )

  const className = useMemo(
    () => ({
      container: cn(textFieldPreset[preset].container, containerClassName),
      label: cn(
        textFieldPreset[preset].label,
        preset === 'default' ? labelColor : '',
        labelClassName,
        { 'bg-lightSkyBlue': disabled }
      ),
      asterisk: cn(
        textFieldPreset[preset].label,
        preset === 'default' ? asteriskColor : '',
        { 'bg-lightSkyBlue': disabled }
      ),
      inputWrapper: cn(
        textFieldPreset[preset].inputWrapper,
        inputWrapperClassName,
        isFocus && preset === 'default' ? 'border-main' : 'border-quillGrey',
        { 'bg-lightSkyBlue': disabled }
      ),
      input: cn(textFieldPreset[preset].input, inputClassName),
    }),
    [
      preset,
      containerClassName,
      labelColor,
      labelClassName,
      asteriskColor,
      inputWrapperClassName,
      isFocus,
      inputClassName,
      disabled,
    ]
  )

  const onFocus = useCallback(() => setIsFocus(true), [])
  const onBlur = useCallback(() => {
    setIsFocus(false)
    field.onBlur()
  }, [field])

  let additionalTextInputStyle:
    | typeof customStyles.iosTextInput
    | typeof customStyles.androidTextInput
    | null = null
  if (applyPlatformFix) {
    additionalTextInputStyle =
      Platform.OS === 'ios'
        ? customStyles.iosTextInput
        : customStyles.androidTextInput
  }

  useImperativeHandle(ref, () => input.current as TextInput)

  const showAsterisk = useMemo(() => {
    return isMandatory && !field.value && !props.value && placeholder
  }, [isMandatory, field.value, props.value, placeholder])

  return (
    <View className={className.container} accessibilityState={{ disabled }}>
      {!!label && (
        <Text className={className.label} {...getTestID(labelTestID)}>
          {label}
          {isMandatory && <Text className={className.asterisk}>*</Text>}
        </Text>
      )}
      <View className={className.inputWrapper}>
        {!!LeftAccessory && (
          <LeftAccessory
            accessoryClassName={leftAccessoryClassName}
            status={status}
            editable={disabled}
            multiline={TextInputProps.multiline}
            name={name}
          />
        )}

        <TextInput
          ref={input}
          placeholder={showAsterisk ? '' : placeholder}
          placeholderTextColor={colors.warmGrey}
          value={field.value?.toString() || ''}
          onChangeText={(text) => {
            field.onChange(text)
            // Active the onChangeText function if provided
            if (onChangeText) {
              onChangeText(text)
            }
          }}
          onFocus={onFocus}
          onBlur={onBlur}
          editable={!disabled}
          className={className.input}
          style={additionalTextInputStyle}
          {...TextInputProps}
        />
        {showAsterisk && (
          <Text
            className={
              (className.label, 'absolute text-gray-500 text-sm left-1')
            }
            {...getTestID(labelTestID)}
            onPress={() => input.current?.focus()}>
            {label}
            <Text className='text-warmPink text-sm'>*</Text>
          </Text>
        )}

        {!!RightAccessory && (
          <RightAccessory
            accessoryClassName={rightAccessoryClassName}
            status={status}
            editable={!disabled}
            multiline={TextInputProps.multiline}
            name={name}
          />
        )}
      </View>
      {!!errors && (
        <Text
          className={cn(AppStyles.textRegularSmall, 'text-warmPink')}
          {...getTestID(errorTestID)}>
          {errors}
        </Text>
      )}
      {!!helper && (
        <Text
          className={cn(AppStyles.textRegularSmall, 'text-mediumGray')}
          {...getTestID(helperTestID)}>
          {helper}
        </Text>
      )}
    </View>
  )
})

const baseInputStyle = cn(AppStyles.textRegular, 'flex-1 self-center')

const textFieldPreset = {
  default: {
    container: 'w-full mt-2',
    label: cn(
      AppStyles.textRegularSmall,
      'text-white bg-lightBlueGray px-1 pt-2'
    ),
    inputWrapper:
      'flex-row justify-center items-center bg-lightBlueGray border-b px-0.5 pb-2 pt-1',
    input: baseInputStyle,
  },
  outlined: {
    container: 'w-full',
    label: cn(AppStyles.textRegularSmall, 'text-warmGrey mt-2.5'),
    inputWrapper: 'flex-row items-center border rounded mt-2 py-2.5 px-4',
    input: baseInputStyle,
  },
  base: {
    container: 'w-full',
    label: cn(AppStyles.textRegularSmall, 'text-warmGrey mt-2.5'),
    inputWrapper: 'flex-row items-center',
    input: baseInputStyle,
  },
}

const leftAccessoryClassName = 'ms-2 w-6 h-6 justify-center items-center'

const rightAccessoryClassName = 'me-2 w-6 h-6 justify-center items-center'

const customStyles = StyleSheet.create({
  androidTextInput: {
    height: 20,
    paddingVertical: 0,
    textAlignVertical: 'center',
  },
  iosTextInput: {
    height: 22,
    paddingVertical: 0,
  },
})
