import {
  getLocalizedProgramName,
  getLocalizedRoleName,
  normalizeLabel,
} from '../LocalizedNameUtils'

describe('normalizeLabel', () => {
  it('lowercases and joins words with underscores', () => {
    expect(normalizeLabel('  Essential Medicines ')).toBe('essential_medicines')
    expect(normalizeLabel('Operator - Bank Sampah')).toBe(
      'operator_bank_sampah'
    )
  })
})

describe('getLocalizedProgramName', () => {
  it('translates by program key for ar', () => {
    expect(
      getLocalizedProgramName({ key: 'immunization', name: 'Imunisasi' }, 'ar')
    ).toBe('التحصين')
    expect(
      getLocalizedProgramName({ key: 'logistic', name: 'Logistik' }, 'ar')
    ).toBe('الأدوية الأساسية')
  })

  it('falls back to the normalized label when the key is unknown', () => {
    expect(
      getLocalizedProgramName({ key: 'unknown', name: 'Malaria' }, 'ar')
    ).toBe('الملاريا')
    expect(getLocalizedProgramName('Essential Medicines', 'ar')).toBe(
      'الأدوية الأساسية'
    )
    expect(getLocalizedProgramName({ name: 'Tuberkulosis' }, 'ar-SA')).toBe(
      'السل'
    )
  })

  it('returns the original name when there is no translation', () => {
    expect(
      getLocalizedProgramName({ key: 'kia', name: 'Kesehatan Ibu' }, 'ar')
    ).toBe('Kesehatan Ibu')
    expect(getLocalizedProgramName('Program Baru', 'ar')).toBe('Program Baru')
  })

  it('returns the original name for non-ar languages', () => {
    const program = { key: 'immunization', name: 'Imunisasi' }
    expect(getLocalizedProgramName(program, 'id')).toBe('Imunisasi')
    expect(getLocalizedProgramName(program, 'en')).toBe('Imunisasi')
    expect(getLocalizedProgramName(program)).toBe('Imunisasi')
  })

  it('returns an empty string for empty input', () => {
    expect(getLocalizedProgramName(null, 'ar')).toBe('')
    expect(getLocalizedProgramName(undefined, 'ar')).toBe('')
    expect(getLocalizedProgramName({ key: null, name: null }, 'ar')).toBe('')
  })
})

describe('getLocalizedRoleName', () => {
  it('translates role labels for ar', () => {
    expect(getLocalizedRoleName('Super Admin', 'ar')).toBe('المسؤول العام')
    expect(getLocalizedRoleName('Operator', 'ar')).toBe('مشغّل')
    expect(getLocalizedRoleName('Operator Bank Sampah', 'ar')).toBe(
      'مشغّل بنك النفايات'
    )
  })

  it('returns the original label when there is no translation', () => {
    expect(getLocalizedRoleName('Kepala Puskesmas', 'ar')).toBe(
      'Kepala Puskesmas'
    )
  })

  it('returns the original label for non-ar languages', () => {
    expect(getLocalizedRoleName('Manager', 'id')).toBe('Manager')
    expect(getLocalizedRoleName('Manager', 'en')).toBe('Manager')
  })

  it('returns an empty string for null input', () => {
    expect(getLocalizedRoleName(null, 'ar')).toBe('')
    expect(getLocalizedRoleName(undefined, 'ar')).toBe('')
  })
})
