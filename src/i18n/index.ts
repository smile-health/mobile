import 'intl-pluralrules'
import * as Localization from 'expo-localization'
import i18n from 'i18next'
import ChainedBackend from 'i18next-chained-backend'
import Backend from 'i18next-http-backend'
import resourceTobackend from 'i18next-resources-to-backend'
import { initReactI18next } from 'react-i18next'
import LangEn from './locales/en.json'
import LangId from './locales/id.json'

export type TxCode = keyof typeof resources

export const resources = {
  id: { translation: LangId },
  en: { translation: LangEn },
}

i18n
  .use(ChainedBackend)
  .use(initReactI18next)
  .init({
    lng: Localization.getLocales()[0].languageCode || 'id',
    ns: 'translation',
    fallbackLng: 'id',
    resources,
    backend: {
      backends: [Backend, resourceTobackend(resources)],
    },
  })

// eslint-disable-next-line unicorn/prefer-export-from
export default i18n
