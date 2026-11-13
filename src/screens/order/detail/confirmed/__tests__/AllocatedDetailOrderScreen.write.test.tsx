let mockHook: any
const captured: any = {}

jest.mock('@/components/toolbar/hooks/useToolbar', () => ({
  useToolbar: jest.fn(),
}))
jest.mock('../../../hooks/useAllocatedDetailOrder', () => ({
  useAllocatedDetailOrder: () => mockHook,
}))
const stub = (name: string, render?: (p: any) => any) => {
  const { Pressable, Text } = require('react-native')
  return {
    __esModule: true,
    default: (p: any) => {
      captured[name] = p
      return render ? render(p) : <Text>{name}</Text>
    },
    [name]: (p: any) => {
      captured[name] = p
      return render ? render(p) : <Text>{name}</Text>
    },
  }
}
jest.mock('@/components/buttons', () => {
  const { Pressable, Text } = require('react-native')
  return {
    Button: ({ text, onPress }: any) => (
      <Pressable onPress={onPress}>
        <Text>{text}</Text>
      </Pressable>
    ),
  }
})
jest.mock('@/components/header/HeaderMaterial', () => stub('HeaderMaterial'))
jest.mock('@/components/LoadingDialog', () => stub('LoadingDialog'))
jest.mock('@/screens/inventory/component/button/StockActivityButton', () => {
  const { Pressable, Text } = require('react-native')
  return {
    __esModule: true,
    default: ({ onPress }: any) => (
      <Pressable onPress={onPress}>
        <Text>stock-activity</Text>
      </Pressable>
    ),
  }
})
jest.mock(
  '@/screens/inventory/component/transaction/SelectActivityStockBottomSheet',
  () => stub('SelectSheet')
)
jest.mock('../../../component/allocation/AllocatedOrderHeader', () =>
  stub('Header')
)
jest.mock(
  '../../../component/allocation/AllocationMaterialHierarchyRenderer',
  () =>
    stub('Hier', (p: any) => {
      const { Text } = require('react-native')
      return <Text>hier-{p.item.material.id}</Text>
    })
)
jest.mock(
  '../../../component/allocation/AllocationMaterialNonHierarchyRenderer',
  () =>
    stub('NonHier', (p: any) => {
      const { Text } = require('react-native')
      return <Text>nonhier-{p.item.material.id}</Text>
    })
)
jest.mock('../../../component/allocation/StockInfoModal', () => stub('Info'))

import React from 'react'
import { fireEvent, render } from '@testing-library/react-native'
import AllocatedDetailOrderScreen from '../AllocatedDetailOrderScreen'

const detail: any = {
  id: 3,
  activity: { name: 'Act' },
  customer: { name: 'Cust' },
  vendor: { name: 'Ven' },
}
const makeData = (over: any = {}) => ({
  material: { id: 1, name: 'Parent' },
  confirmed_qty: 5,
  children: [],
  stock_customer: { total_qty: 1, min: 0, max: 9, updated_at: 'd' },
  ...over,
})
const makeHook = (over: any = {}) => ({
  formControl: {
    watch: jest.fn(),
    setValue: jest.fn(),
    form: { comment: '' },
    control: {},
  },
  t: (k: string) => k,
  uiState: {
    isOpenInfoModal: false,
    isActivitySheetOpen: false,
    activityStockData: [],
    setIsActivitySheetOpen: jest.fn(),
  },
  actions: {
    handleOpenInfoModal: jest.fn(),
    handleCloseInfoModal: jest.fn(),
    handleSelectStockFromOtherActivity: jest.fn(),
    handleSaveAllocateStock: jest.fn(),
  },
  datas: { materialList: [], additionalStockDetails: [], draftData: [] },
  status: { isBatch: false, isHierarchy: false, isLoadingMaterial: false },
  ...over,
})
const renderScreen = (data: any) =>
  render(
    <AllocatedDetailOrderScreen
      route={{ params: { detail, data } } as any}
      navigation={{} as any}
    />
  )

beforeEach(() => {
  for (const k of Object.keys(captured)) delete captured[k]
  mockHook = makeHook()
})

describe('AllocatedDetailOrderScreen', () => {
  it('non-hierarki memakai stok material sendiri', () => {
    mockHook = makeHook({
      datas: {
        materialList: [
          {
            material: { id: 1 },
            details: [{ material: { id: 8, is_managed_in_batch: 1 } }],
          },
        ],
        additionalStockDetails: [{ material: { id: 9 } }],
        draftData: [],
      },
    })
    const { getByText } = renderScreen(makeData())
    getByText('nonhier-8')
    getByText('nonhier-9')
    expect(captured.NonHier.isBatch).toBe(false)
  })

  it('hierarki memfilter detail berdasar child dan memperkaya item', () => {
    mockHook = makeHook({
      status: { isBatch: true, isHierarchy: true, isLoadingMaterial: true },
      datas: {
        materialList: [
          {
            material: { id: 1 },
            details: [
              { material: { id: 8, is_managed_in_batch: 1 } },
              { material: { id: 99 } },
            ],
          },
        ],
        additionalStockDetails: [],
        draftData: [],
      },
    })
    const { getByText, queryByText } = renderScreen(
      makeData({
        children: [
          {
            material: { id: 8 },
            qty: 2,
            ordered_qty: 3,
            confirmed_qty: 4,
            allocated_qty: 1,
            recommended_stock: 7,
          },
        ],
      })
    )
    getByText('hier-8')
    expect(queryByText('hier-99')).toBeNull()
    expect(captured.Hier.item).toMatchObject({
      qty: 2,
      recommended_stock: 7,
      allocated_qty: 1,
    })
    expect(captured.Hier.isBatch).toBe(true)
    expect(captured.LoadingDialog.modalVisible).toBe(true)
  })

  it('hierarki tanpa child yang cocok menghasilkan null di field tambahan', () => {
    mockHook = makeHook({
      status: { isBatch: false, isHierarchy: true, isLoadingMaterial: false },
      datas: {
        materialList: [
          {
            material: { id: 1 },
            details: [{ material: { id: 5, is_managed_in_batch: 0 } }],
          },
        ],
        additionalStockDetails: [],
        draftData: [],
      },
    })
    renderScreen(makeData({ children: [] }))
    expect(captured.Hier.item).toMatchObject({
      qty: null,
      recommended_stock: null,
    })
  })

  it('tanpa material cocok hanya menampilkan stok tambahan', () => {
    mockHook = makeHook({
      datas: {
        materialList: [{ material: { id: 77 } }],
        additionalStockDetails: undefined,
        draftData: [],
      },
    })
    const { queryByText } = renderScreen(makeData())
    expect(queryByText(/nonhier/)).toBeNull()
  })

  it('tombol simpan, aktivitas stok, dan modal info memanggil aksi hook', () => {
    const { getByText } = renderScreen(makeData())
    fireEvent.press(getByText('button.save'))
    expect(mockHook.actions.handleSaveAllocateStock).toHaveBeenCalled()
    fireEvent.press(getByText('stock-activity'))
    expect(mockHook.uiState.setIsActivitySheetOpen).toHaveBeenCalledWith(true)
    captured.SelectSheet.toggleSheet()
    expect(mockHook.uiState.setIsActivitySheetOpen).toHaveBeenCalledWith(false)
    captured.Header.onOpenInfo()
    expect(mockHook.actions.handleOpenInfoModal).toHaveBeenCalled()
    captured.Info.onClose()
    expect(mockHook.actions.handleCloseInfoModal).toHaveBeenCalled()
    expect(captured.HeaderMaterial.items[1].value).toBe('Cust')
    expect(captured.Info.stockInfo.max).toBe(9)
  })
})
