import type { CountryCode } from 'libphonenumber-js'
import { getCountries, getCountryCallingCode } from 'libphonenumber-js'
import { countryNames } from './countryNames'

export interface Country {
  code: CountryCode
  name: string
  dialCode: string
  emoji: string
}

const getFlagEmoji = (countryCode: string = '') => {
  const codePoints = [...countryCode.toUpperCase()].map(
    (char) => 127_397 + (char.codePointAt(0) ?? 0)
  )
  return String.fromCodePoint(...codePoints)
}

export function getCountryList(): Country[] {
  return getCountries()
    .map((countryCode) => ({
      code: countryCode,
      name: countryNames[countryCode],
      dialCode: getCountryCallingCode(countryCode),
      emoji: getFlagEmoji(countryCode),
    }))
    .filter((c) => c.dialCode)
    .sort((a, b) => a.name.localeCompare(b.name))
}

// Generate the list of countries
export function getCountryByCode(code?: CountryCode) {
  return getCountryList().find((c) => c.code === code)
}
