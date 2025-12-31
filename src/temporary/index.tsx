import React from 'react'
import { View, Button } from 'react-native'
import { useTranslation } from 'react-i18next'

export default function Temporary() {
  const { i18n } = useTranslation()

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang)
  }
  return (
    <View className='p-6 bg-white'>
      <View className='mt-4'>
        <Button
          title='Change to English'
          onPress={() => changeLanguage('en')}
        />
        <Button
          title='Change to Indonesian'
          onPress={() => changeLanguage('id')}
        />
      </View>
    </View>
  )
}
