import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import {
  getLocalizedProgramName,
  getLocalizedRoleName,
} from '@/utils/LocalizedNameUtils'

type ProgramInput = Parameters<typeof getLocalizedProgramName>[0]

/**
 * Nama program/role versi bahasa aktif, hanya untuk tampilan.
 * Lihat `@/utils/LocalizedNameUtils`.
 */
export const useLocalizedName = () => {
  const { i18n } = useTranslation()
  const language = i18n?.language

  const programName = useCallback(
    (program: ProgramInput) => getLocalizedProgramName(program, language),
    [language]
  )
  const roleName = useCallback(
    (roleLabel: string | null | undefined) =>
      getLocalizedRoleName(roleLabel, language),
    [language]
  )

  return { language, programName, roleName }
}
