import { StatusBarStyle } from 'react-native'
import clsx, { ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import Config from '@/config'

export type ThemeStyle = { barStyle: StatusBarStyle; color: string }
export type ThemeVariant = Record<string, ThemeStyle>

export const themeVariant: ThemeVariant = {
  app: {
    barStyle: 'light-content',
    color: Config.APP_COLOR,
  },
  immunization: {
    barStyle: 'light-content',
    color: '#004990',
  },
  logistic: {
    barStyle: 'light-content',
    color: '#680771',
  },
  'waste-management': {
    barStyle: 'light-content',
    color: '#047856',
  },
  rabies: {
    barStyle: 'light-content',
    color: '#E9D5FF',
  },
  malaria: {
    barStyle: 'light-content',
    color: '#DC2626',
  },
  hiv: {
    barStyle: 'light-content',
    color: '#DB2777',
  },
  tb: {
    barStyle: 'light-content',
    color: '#166534',
  },
  'anti-venom': {
    barStyle: 'light-content',
    color: '#334155',
  },
  obat: {
    barStyle: 'light-content',
    color: '#680771',
  },
  diare: {
    barStyle: 'light-content',
    color: '#FED7AA',
  },
  filariaris: {
    barStyle: 'light-content',
    color: '#6EE7B7',
  },
  gizi: {
    barStyle: 'light-content',
    color: '#D9F99D',
  },
  hepatitis: {
    barStyle: 'light-content',
    color: '#06B6D4',
  },
  keswa: {
    barStyle: 'light-content',
    color: '#06B6D4',
  },
  kia: {
    barStyle: 'light-content',
    color: '#06B6D4',
  },
  kusta: {
    barStyle: 'light-content',
    color: '#BFDBFE',
  },
}

export function cn(...input: ClassValue[]) {
  return twMerge(clsx(input))
}
