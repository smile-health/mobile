import { renderHook } from '@testing-library/react-native'
import { useTranslation } from 'react-i18next'
import { useLocalizedName } from '../useLocalizedName'

const mockUseTranslation = useTranslation as jest.Mock

const renderWithLanguage = async (language?: string) => {
  mockUseTranslation.mockReturnValue({
    t: (key: string) => key,
    i18n: language ? { language } : undefined,
  })
  const { result } = await renderHook(() => useLocalizedName())
  return result.current
}

describe('useLocalizedName', () => {
  it('localizes program and role names when the app language is ar', async () => {
    const { programName, roleName } = await renderWithLanguage('ar')
    expect(programName({ key: 'malaria', name: 'Malaria' })).toBe('الملاريا')
    expect(roleName('Admin')).toBe('مسؤول')
  })

  it('keeps the original names for other languages', async () => {
    const { programName, roleName } = await renderWithLanguage('id')
    expect(programName({ key: 'malaria', name: 'Malaria' })).toBe('Malaria')
    expect(roleName('Admin')).toBe('Admin')
  })

  it('keeps the original names when i18n is not available', async () => {
    const { programName, roleName } = await renderWithLanguage()
    expect(programName('Malaria')).toBe('Malaria')
    expect(roleName('Admin')).toBe('Admin')
  })
})
