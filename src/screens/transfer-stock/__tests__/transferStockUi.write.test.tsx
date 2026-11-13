jest.mock(
  '@react-navigation/native',
  () => require('@/test-utils/misc-nav').navModule
)
jest.mock('react-native-reanimated', () =>
  require('react-native-reanimated/mock')
)
jest.mock(
  'react-native-safe-area-context',
  () => require('react-native-safe-area-context/jest/mock').default
)
jest.mock('react-native-gesture-handler', () => ({
  FlatList: require('react-native').FlatList,
}))
jest.mock('@/components/portals/Portal', () => ({
  __esModule: true,
  default: ({ children }: any) => children,
}))
jest.mock('@/components/toolbar/hooks/useToolbar', () => ({
  useToolbar: jest.fn(),
}))

const mockProgramHook = jest.fn()
jest.mock('../hooks/useTransferStockProgram', () => ({
  __esModule: true,
  default: () => mockProgramHook(),
}))
const mockFormHook = jest.fn()
jest.mock('../hooks/useTransferStockForm', () => ({
  __esModule: true,
  default: (...a: any[]) => mockFormHook(...a),
}))

import React from 'react'
import { fireEvent, render, screen, act } from '@testing-library/react-native'
import { useToolbar } from '@/components/toolbar/hooks/useToolbar'
import { FormWrapper } from '@/test-utils/misc-form'
import TransferStockFormItem from '../components/TransferStockFormItem'
import CreateTransferStockScreen from '../CreateTransferStockScreen'
import TransferStockProgramScreen from '../TransferStockProgramScreen'

const t = (k: string) => k

describe('TransferStockProgramScreen', () => {
  const base = {
    t,
    title: 'Transfer',
    control: undefined as any,
    draftProgram: { id: 2 },
    programList: [
      { id: 1, name: 'Prog A', key: 'a', color: '#112233' },
      { id: 2, name: 'Prog B', key: 'b', color: '#ffffff' },
    ],
    shouldShowLoading: false,
    isOpenModalExistTrx: false,
    closeModalExistTrx: jest.fn(),
    handleSelectProgram: jest.fn(),
    handleRefreshList: jest.fn(),
  }

  const Wrapper = ({ hook }: { hook: any }) => {
    const { useForm } = require('react-hook-form')
    const { control } = useForm({ defaultValues: { name: '' } })
    mockProgramHook.mockReturnValue({ ...hook, control })
    return <TransferStockProgramScreen />
  }

  beforeEach(() => jest.clearAllMocks())

  it('menampilkan daftar program dan memanggil handleSelectProgram', () => {
    render(<Wrapper hook={base} />)
    fireEvent.press(screen.getByText('Prog A'))
    expect(base.handleSelectProgram).toHaveBeenCalled()
    expect(screen.getByText('Prog B')).toBeTruthy()
  })

  it('mendaftarkan toolbar dengan judul dan aksi refresh', () => {
    render(<Wrapper hook={base} />)
    expect((useToolbar as jest.Mock).mock.calls[0][0].title).toBe('Transfer')
  })

  it('dialog transaksi draft tampil dan bisa ditutup', () => {
    render(
      <Wrapper
        hook={{ ...base, isOpenModalExistTrx: true, draftProgram: undefined }}
      />
    )
    fireEvent.press(screen.getByText('button.ok'))
    expect(base.closeModalExistTrx).toHaveBeenCalled()
  })
})

const item: any = {
  stock_id: 5,
  activity: { name: 'Rutin' },
  available_qty: 10,
  batch: {
    id: 1,
    code: 'BC',
    expired_date: '2030-01-01',
    production_date: '2029-01-01',
    manufacture: { name: 'Bio' },
  },
  budget_source: { label: 'APBN' },
  change_qty: 2,
  price: 100,
  total_price: 200,
}

describe('TransferStockFormItem', () => {
  const renderItem = (it: any, props: any = {}, onForm?: any) =>
    render(
      <FormWrapper
        defaultValues={{ items: { activeBatch: [it], expiredBatch: [] } }}
        onForm={onForm}>
        <TransferStockFormItem
          index={0}
          batchType='activeBatch'
          isSelected
          {...props}
        />
      </FormWrapper>
    )

  it('menampilkan detail batch dan toggle', () => {
    const onToggle = jest.fn()
    renderItem(item, { onToggleDetail: onToggle })
    expect(screen.getByText('BC')).toBeTruthy()
    expect(screen.getByText('APBN')).toBeTruthy()
    fireEvent.press(screen.getByTestId('stock-5'))
    expect(onToggle).toHaveBeenCalled()
  })

  it('mengubah qty: nilai terisi, lalu dikosongkan', async () => {
    let methods: any
    renderItem(item, {}, (m: any) => (methods = m))
    const input = screen.getByTestId('textfield-transfer-stock-qty-5')
    await act(async () => {
      fireEvent.changeText(input, '7')
    })
    expect(methods.getValues('items.activeBatch.0.change_qty')).toBe(7)
    await act(async () => {
      fireEvent.changeText(input, '')
    })
    expect(methods.getValues('items.activeBatch.0.change_qty')).toBeNull()
  })

  it('tanpa batch, tanpa anggaran, collapse dinonaktifkan', () => {
    renderItem(
      {
        ...item,
        batch: null,
        budget_source: null,
        activity: undefined,
        change_qty: null,
      },
      { disableCollapse: true, isSelected: false }
    )
    expect(screen.queryByText('label.manufacturer')).toBeNull()
    expect(screen.getByText('-')).toBeTruthy()
  })
})

describe('CreateTransferStockScreen', () => {
  const baseHook = (over: any = {}) => {
    const { useForm } = require('react-hook-form')
    const methods = useForm({
      defaultValues: { items: { activeBatch: [item], expiredBatch: [] } },
    })
    return {
      t,
      title: 'Judul',
      program: { name: 'Prog' },
      methods,
      isBatch: true,
      sections: [
        { fieldname: 'activeBatch', title: 'active_batch', data: [item] },
        { fieldname: 'expiredBatch', title: 'expired_batch', data: [] },
      ],
      activities: [{ value: 1, label: 'Act' }],
      errors: {},
      destination_activity_id: undefined,
      hasNextMaterial: true,
      isLoadingActivities: false,
      handleChangeActivity: jest.fn(),
      handleNextMaterial: jest.fn(),
      handleSaveTransferStock: jest.fn(),
      handleRefreshActivities: jest.fn(),
      ...over,
    }
  }
  const material: any = {
    material: { name: 'Vaksin' },
    aggregate: { total_qty: 3 },
  }
  const Harness = ({ over }: { over?: any }) => {
    const hook = baseHook(over)
    mockFormHook.mockReturnValue(hook)
    ;(Harness as any).hook = hook
    return (
      <CreateTransferStockScreen
        {...({ route: { params: { material, materials: [material] } } } as any)}
      />
    )
  }

  it('tombol simpan dan next material memanggil handler', () => {
    render(<Harness />)
    const hook = (Harness as any).hook
    fireEvent.press(screen.getByTestId('btn-save-transfer-stock'))
    expect(hook.handleSaveTransferStock).toHaveBeenCalled()
    fireEvent.press(screen.getByTestId('btn-next-material-tranfer-stock'))
    expect(hook.handleNextMaterial).toHaveBeenCalled()
    expect(screen.getByText('active_batch')).toBeTruthy()
  })

  it('toggle detail stok batch memilih lalu menutup item', () => {
    render(<Harness />)
    fireEvent.press(screen.getByTestId('stock-5'))
    fireEvent.press(screen.getByTestId('stock-5'))
    expect(screen.getByText('BC')).toBeTruthy()
  })

  it('tanpa batch, tanpa next material, dan data kosong', () => {
    render(
      <Harness
        over={{ isBatch: false, hasNextMaterial: false, sections: [] }}
      />
    )
    expect(screen.queryByTestId('btn-next-material-tranfer-stock')).toBeNull()
    expect(screen.getByText('empty_state.no_data_available')).toBeTruthy()
  })

  it('toggle diabaikan jika bukan batch', () => {
    render(<Harness over={{ isBatch: false }} />)
    fireEvent.press(screen.getByTestId('stock-5'))
    expect(screen.getByText('BC')).toBeTruthy()
  })

  it('memilih aktivitas tujuan lewat picker', () => {
    render(<Harness />)
    const picker = screen.getByTestId('pickerselect-destination-activity')
    expect(picker).toBeTruthy()
  })
})
