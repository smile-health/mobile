jest.mock('@/components/bottomsheet/BottomSheet', () => ({
  BottomSheet: ({ children }: any) => require('react').createElement(require('react-native').View, null, children),
}))
jest.mock('@/i18n/useLanguage', () => ({ useLanguage: () => ({ t: (k: string, o?: any) => (o ? `${k}:${JSON.stringify(o)}` : k) }) }))

import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react-native'
import ChangeHistoryBottomSheet from '../component/ChangeHistoryBottomSheet'

const history = (nv: any): any => ({ id: 1, new_value: nv, updated_at: '2025-01-01T00:00:00Z', updated_by: 'admin' })

describe('ChangeHistoryBottomSheet', () => {
  it('tanpa data tidak merender apa pun', () => {
    const { toJSON } = render(<ChangeHistoryBottomSheet toggleSheet={jest.fn()} isOpen data={undefined} {...({} as any)} />)
    expect(toJSON()).toBeNull()
  })

  it('menampilkan hanya field yang berubah dan menutup sheet', () => {
    const toggle = jest.fn()
    render(
      <ChangeHistoryBottomSheet
        {...({ toggleSheet: toggle, isOpen: true } as any)}
        data={history({ firstname: 'Ann', lastname: '', gender: 2, mobile_phone: '081', email: 'a@b.c', password: 1 })}
      />
    )
    expect(screen.getByText('label.firstname')).toBeTruthy()
    expect(screen.getByText('label.gender')).toBeTruthy()
    expect(screen.getByText('common.yes')).toBeTruthy()
    expect(screen.getByText('label.lastname')).toBeTruthy() // string kosong tetap tampil
    expect(screen.getByText('common.change_history')).toBeTruthy()
    fireEvent.press(screen.getByText('button.close'))
    expect(toggle).toHaveBeenCalled()
  })

  it('password 0 => no, gender tidak dikenal/kosong disembunyikan', () => {
    render(
      <ChangeHistoryBottomSheet
        {...({ toggleSheet: jest.fn(), isOpen: true } as any)}
        data={history({ password: 0, gender: 0 })}
      />
    )
    expect(screen.getByText('common.no')).toBeTruthy()
    expect(screen.queryByText('label.gender')).toBeNull()
    expect(screen.queryByText('label.email')).toBeNull()
  })

  it('password bukan angka disembunyikan', () => {
    render(
      <ChangeHistoryBottomSheet
        {...({ toggleSheet: jest.fn(), isOpen: true } as any)}
        data={history({ email: 'x@y.z', password: undefined })}
      />
    )
    expect(screen.queryByText('label.password')).toBeNull()
  })
})
