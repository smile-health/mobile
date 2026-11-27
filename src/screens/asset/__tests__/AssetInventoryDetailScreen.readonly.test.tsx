let mockHook: any
const mockRefetch = jest.fn()
jest.mock('../hooks/useAssetInventoryDetail', () => ({
  useAssetInventoryDetail: () => mockHook,
}))
jest.mock('@/components/toolbar/hooks/useToolbar', () => ({
  useToolbar: jest.fn(),
}))
jest.mock('@/i18n/useLanguage', () => ({
  useLanguage: () => ({ t: (k: string) => k }),
}))
jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (cb: any) => require('react').useEffect(() => cb(), []),
  createNavigationContainerRef: () => ({}),
}))

import React from 'react'
import { render, screen, cleanup } from '@testing-library/react-native'
import AssetInventoryDetailScreen from '../AssetInventoryDetailScreen'

const fmt = (d?: string) => (d ? `D:${d}` : '-')
const contact = (n?: string | null, p?: string | null) =>
  !n && !p ? '-' : `${n ?? ''}|${p ?? ''}`
const base = {
  refetchDetail: mockRefetch,
  isLoadingDetail: false,
  isError: false,
  formatDate: fmt,
  formatContactPerson: contact,
}
const props: any = { navigation: {}, route: { params: { id: 1 } } }
const full: any = {
  entity: { name: 'Ent' },
  updated_at: '2025-01-01',
  serial_number: 'SN',
  production_year: 2020,
  budget_source: { name: 'BudgetA', year: 2024 },
  asset_type: { name: 'TypeA' },
  asset_model: { name: 'ModelA' },
  manufacture: { name: 'MfA' },
  borrowed_from: { name: 'Borrow' },
  working_status: { id: 1, name: 'Working' },
  contact_person: {
    first: { name: 'N1', number: '1' },
    second: { name: 'N2', number: '2' },
    third: { name: 'N3', number: '3' },
  },
  ownership: { id: 1, qty: 5, name: 'Own' },
  electricity: { name: 'PLN' },
  warranty: {
    asset_vendor_name: 'WV',
    start_date: '2025-01-01',
    end_date: '2026-01-01',
  },
  calibration: {
    name: 'Cal',
    asset_vendor_name: 'CV',
    last_date: '2025-01-01',
  },
  maintenance: { name: 'Mt', asset_vendor_name: 'MV', last_date: '2025-01-01' },
  status: 1,
}
const sparse: any = {
  entity: { name: 'Ent' },
  budget_source: {},
  working_status: { id: 2 },
  other_asset_type_name: 'OtherType',
  other_asset_model_name: 'OtherModel',
  other_manufacture_name: 'OtherMf',
  other_budget_source_name: 'OtherBudget',
  other_borrowed_from_entity_name: 'OtherBorrow',
  ownership: {},
  warranty: {},
  calibration: {},
  maintenance: {},
}

describe('AssetInventoryDetailScreen', () => {
  beforeEach(() => jest.clearAllMocks())

  it('loading', async () => {
    mockHook = { ...base, isLoadingDetail: true }
    await render(<AssetInventoryDetailScreen {...props} />)
    expect(screen.queryByText('Asset not found')).toBeNull()
    expect(mockRefetch).toHaveBeenCalled()
  })

  it('error / tidak ada data', async () => {
    mockHook = { ...base, isError: true, assetDetail: full }
    await render(<AssetInventoryDetailScreen {...props} />)
    expect(screen.getByText('Asset not found')).toBeTruthy()
    mockHook = { ...base, assetDetail: undefined }
    await cleanup()
    await render(<AssetInventoryDetailScreen {...props} />)
    expect(screen.getByText('Asset not found')).toBeTruthy()
  })

  it('data lengkap menampilkan nilai', async () => {
    mockHook = { ...base, assetDetail: full }
    await render(<AssetInventoryDetailScreen {...props} />)
    expect(screen.getByText('TypeA')).toBeTruthy()
    expect(screen.getByText('ModelA')).toBeTruthy()
    expect(screen.getByText('Working')).toBeTruthy()
    expect(screen.getByText('PLN')).toBeTruthy()
    expect(screen.getByText('Borrow')).toBeTruthy()
  })

  it('data minim memakai fallback other_* dan "-"', async () => {
    mockHook = { ...base, assetDetail: sparse }
    await render(<AssetInventoryDetailScreen {...props} />)
    expect(screen.getByText('OtherType')).toBeTruthy()
    expect(screen.getByText('OtherModel')).toBeTruthy()
    expect(screen.getAllByText('-').length).toBeGreaterThan(3)
  })

  it('varian kepemilikan, kontak & status berbeda', async () => {
    mockHook = {
      ...base,
      assetDetail: {
        ...full,
        ownership: { id: 2, qty: undefined, name: undefined },
        working_status: { id: 3 },
        contact_person: undefined,
        electricity: undefined,
        calibration: {},
        maintenance: {},
        warranty: {},
        status: 0,
      },
    }
    await render(<AssetInventoryDetailScreen {...props} />)
    expect(screen.getAllByText('-').length).toBeGreaterThan(3)
  })
})
