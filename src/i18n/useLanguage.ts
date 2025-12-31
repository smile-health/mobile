import { useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useTranslation } from 'react-i18next'
import { resetApiState } from '@/services/api'
import { setLanguage } from '@/services/features'
import { useAppDispatch } from '@/services/store'
import { removeMultipleLocalData } from '@/storage'
import { StorageKey } from '@/storage/types'
import { TxCode } from '.'

export type LanguageOption = { code: TxCode; name: string }

export const languageOptions: LanguageOption[] = [
  { code: 'id', name: 'Indonesia' },
  { code: 'en', name: 'English' },
]

export const useLanguage = () => {
  const dispatch = useAppDispatch()
  const { t, i18n } = useTranslation()
  const [currentLang, setCurrentLang] = useState(
    languageOptions.find((lang) => lang.code === i18n.language)
  )

  const changeLanguage = async (code: TxCode) => {
    if (code === currentLang?.code) return
    const storageKeys = await AsyncStorage.getAllKeys()
    const trxTypeKeys = storageKeys.filter((key) =>
      key.includes('transactionType-')
    )
    await removeMultipleLocalData(trxTypeKeys as StorageKey[])
    dispatch(resetApiState())
    i18n.changeLanguage(code)
    dispatch(setLanguage(code))
    setCurrentLang(languageOptions.find((lang) => lang.code === code))
  }

  return { t, i18n, currentLang, changeLanguage, options: languageOptions }
}
