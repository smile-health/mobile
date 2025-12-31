import React, { useCallback, useEffect, useState } from 'react'
import { TextInputProps, View, TextInput, Text } from 'react-native'
import { parsePhoneNumberWithError } from 'libphonenumber-js'
import { Control, useController } from 'react-hook-form'
import AppStyles from '@/theme/AppStyles'
import colors from '@/theme/colors'
import { cn } from '@/theme/theme-config'
import { getTestID } from '@/utils/CommonUtils'
import { Country, getCountryByCode } from './countries'
import CountryPicker from './CountryPicker'

interface PhoneInputProps
  extends Omit<TextInputProps, 'value' | 'onChangeText'> {
  name: string
  control: Control<any>
  defaultCountry?: string
  defaultValue?: string
  errors?: string
}

function PhoneInput(props: Readonly<PhoneInputProps>) {
  const { name, control, defaultValue, errors, ...rest } = props
  const [selectedCountry, setSelectedCountry] = useState<Country>({
    code: 'ID',
    name: 'Indonesia',
    dialCode: '62',
    emoji: '🇮🇩',
  })

  const {
    field: { onChange, value: fieldValue },
  } = useController({ name, control })

  const [localValue, setLocalValue] = useState(fieldValue)

  const handlePhoneChange = useCallback(
    (text: string) => {
      const sanitizedText = text.replaceAll(/\D/g, '')
      setLocalValue(sanitizedText)

      const combinedValue = sanitizedText
        ? `+${selectedCountry.dialCode}${sanitizedText}`
        : ''
      onChange(combinedValue)
    },
    [onChange, selectedCountry.dialCode]
  )

  const handleChangeCountry = useCallback((country: Country) => {
    setSelectedCountry(country)
    setLocalValue('')
  }, [])

  useEffect(() => {
    if (defaultValue) {
      try {
        const phoneNumber = parsePhoneNumberWithError(defaultValue)
        const country = getCountryByCode(phoneNumber.country)
        if (country) {
          setSelectedCountry(country)
        }
        setLocalValue(phoneNumber.nationalNumber)
      } catch {
        const sanitizedValue = defaultValue.replace(/^\+\d+\s?/, '')
        setLocalValue(sanitizedValue)
      }
    }
  }, [defaultValue])

  return (
    <View className='mt-2'>
      <View className='flex-row bg-lightBlueGray items-center border-b border-quillGrey py-3.5'>
        <CountryPicker
          country={selectedCountry}
          onChangeCountry={handleChangeCountry}
        />
        <TextInput
          returnKeyType='done'
          submitBehavior='blurAndSubmit'
          value={localValue}
          onChangeText={handlePhoneChange}
          keyboardType='number-pad'
          className={cn(AppStyles.textRegular, 'flex-1 p-1 self-center')}
          placeholderTextColor={colors.warmGrey}
          {...rest}
        />
      </View>
      {!!errors && (
        <Text
          className={cn(AppStyles.textRegularSmall, 'text-warmPink')}
          {...getTestID('error-phone-input')}>
          {errors}
        </Text>
      )}
    </View>
  )
}

export default React.memo(PhoneInput)
