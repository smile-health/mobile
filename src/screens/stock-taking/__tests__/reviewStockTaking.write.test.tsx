jest.mock(
  '@react-navigation/native',
  () => require('@/test-utils/misc-nav').navModule
)
jest.mock(
  'react-native-safe-area-context',
  () => require('react-native-safe-area-context/jest/mock').default
)
jest.mock('@/components/portals/Portal', () => ({
  __esModule: true,
  default: ({ children }: any) => children,
}))
const mockReview = jest.fn()
jest.mock('../hooks/useReviewStockTaking', () => ({
  __esModule: true,
  default: (...a: any[]) => mockReview(...a),
}))
jest.mock('../components/ReviewStockTakingStockItem', () => ({
  __esModule: true,
  default: ({ item }: any) => {
    const { Text } = require('react-native')
    return <Text>{`stock-${item.id}`}</Text>
  },
}))

import React from 'react'
import { fireEvent, render, screen, act } from '@testing-library/react-native'
import ReviewStockTakingItem from '../components/ReviewStockTakingItem'
import ReviewStockTakingScreen from '../ReviewStockTakingScreen'

describe('ReviewStockTakingItem', () => {
  it('material hirarki menampilkan induk dan label merek tanpa waktu', async () => {
    await render(
      <ReviewStockTakingItem
        parentMaterialName='Induk'
        materialName='Merek A'
        totalActualQty={7}
        createdAt='2025-01-01 10:00:00'
        items={[{ id: 1 }, { id: 2 }] as any}
      />
    )
    expect(screen.getByText('Induk')).toBeTruthy()
    expect(screen.getByText('label.trademark_material')).toBeTruthy()
    expect(screen.getByText('stock-1')).toBeTruthy()
    expect(screen.getByText('stock-2')).toBeTruthy()
  })

  it('material biasa menampilkan waktu dan tanpa induk', async () => {
    await render(
      <ReviewStockTakingItem
        materialName='Biasa'
        totalActualQty={0}
        createdAt='2025-01-01 10:00:00'
        items={[]}
      />
    )
    expect(screen.queryByText('label.trademark_material')).toBeNull()
    expect(screen.queryByText('label.active_ingredient_material')).toBeNull()
  })
})

describe('ReviewStockTakingScreen', () => {
  const nav = { navigate: jest.fn() }
  const hook = (over: any = {}) => ({
    t: (k: string) => k,
    detail: {},
    periodName: 'Q1',
    isLoading: false,
    reviewItems: [
      {
        materialId: 5,
        materialName: 'M',
        createdAt: 'c',
        totalActualQty: 1,
        items: [{ id: 9 }],
      },
      { materialName: 'N', createdAt: 'c', totalActualQty: 1, items: [] },
    ],
    handleSubmitStockTaking: jest.fn().mockResolvedValue(undefined),
    ...over,
  })
  const renderScreen = async () =>
    await render(
      <ReviewStockTakingScreen
        {...({
          route: { params: { data: { items: [] }, createdAt: 'x' } },
          navigation: nav,
        } as any)}
      />
    )
  beforeEach(() => jest.clearAllMocks())

  it('langsung mengirim jika belum ada stock opname sebelumnya', async () => {
    const h = hook()
    mockReview.mockReturnValue(h)
    await renderScreen()
    expect(screen.getByText('Q1')).toBeTruthy()
    await act(async () => {
      await fireEvent.press(screen.getByTestId('btn-submit-stock-taking'))
    })
    expect(h.handleSubmitStockTaking).toHaveBeenCalledTimes(1)
    expect(mockReview).toHaveBeenCalledWith({ items: [] }, 'x')
  })

  it('meminta konfirmasi ganti jika sudah ada opname terakhir', async () => {
    const h = hook({ detail: { lastStockOpname: { id: 1 } } })
    mockReview.mockReturnValue(h)
    await renderScreen()
    await act(async () => {
      await fireEvent.press(screen.getByTestId('btn-submit-stock-taking'))
    })
    expect(h.handleSubmitStockTaking).not.toHaveBeenCalled()
    await act(async () => {
      await fireEvent.press(
        screen.getByTestId('btn-confirm-replace-stock-taking')
      )
    })
    expect(h.handleSubmitStockTaking).toHaveBeenCalledTimes(1)
  })

  it('batal konfirmasi ganti tidak mengirim', async () => {
    const h = hook({ detail: { lastStockOpname: { id: 1 } } })
    mockReview.mockReturnValue(h)
    await renderScreen()
    await act(async () => {
      await fireEvent.press(screen.getByTestId('btn-submit-stock-taking'))
    })
    await fireEvent.press(screen.getByTestId('btn-cancel-replace-stock-taking'))
    expect(h.handleSubmitStockTaking).not.toHaveBeenCalled()
  })

  it('hapus semua menavigasi ke CreateStockTaking dengan deleteAll', async () => {
    mockReview.mockReturnValue(hook())
    await renderScreen()
    await fireEvent.press(screen.getByTestId('btn-delete-all-stock-taking'))
    await fireEvent.press(screen.getByText('button.yes'))
    expect(nav.navigate).toHaveBeenCalledWith('CreateStockTaking', {
      deleteAll: true,
    })
  })
})
