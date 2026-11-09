jest.mock('@react-navigation/native', () => require('@/test-utils/misc-nav').navModule)
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'))
jest.mock('react-native-safe-area-context', () =>
  require('react-native-safe-area-context/jest/mock').default
)
jest.mock('@/components/portals/Portal', () => ({ __esModule: true, default: ({ children }: any) => children }))
jest.mock('@/components/toolbar/hooks/useToolbar', () => ({ useToolbar: jest.fn() }))
jest.mock('@/utils/CommonUtils', () => ({
  ...jest.requireActual('@/utils/CommonUtils'),
  showError: jest.fn(),
}))

const mockDetail = jest.fn()
const mockReceive = jest.fn()
const mockAddForm = jest.fn()
const mockReviewSelf = jest.fn()
jest.mock('../hooks/useDisposalShipmentDetail', () => ({ __esModule: true, default: (...a: any[]) => mockDetail(...a) }))
jest.mock('../hooks/useReceiveDisposalShipment', () => ({ __esModule: true, default: (...a: any[]) => mockReceive(...a) }))
jest.mock('@/screens/disposal/hooks/useAddDisposalForm', () => ({ __esModule: true, default: (...a: any[]) => mockAddForm(...a) }))
jest.mock('../hooks/useReviewSelfDisposal', () => ({ __esModule: true, default: (...a: any[]) => mockReviewSelf(...a) }))

// komponen anak yang berat / tidak relevan dengan logika layar
const stub = (name: string) => ({ __esModule: true, default: () => {
  const { Text } = require('react-native')
  return <Text>{name}</Text>
} })
jest.mock('../components/shipment-list/DisposalShipmentDetailHeader', () => stub('DetailHeader'))
jest.mock('../components/shipment-list/DisposalShipmentStatus', () => stub('ShipmentStatus'))
jest.mock('../components/shipment-list/ShipmentWarningBox', () => stub('WarningBox'))
jest.mock('../components/shipment-list/DisposalShipmentDetailItem', () => ({ __esModule: true, default: ({ item, onPressDetail }: any) => {
  const { Pressable, Text } = require('react-native')
  return <Pressable testID={`item-${item.id}`} onPress={() => onPressDetail(item)}><Text>{`item ${item.id}`}</Text></Pressable>
} }))
jest.mock('../components/shipment-list/DisposalCommentItem', () => ({ __esModule: true, default: ({ item }: any) => {
  const { Text } = require('react-native')
  return <Text>{`comment ${item.id}`}</Text>
} }))
jest.mock('../components/shipment-list/ReceiveShipmentFooter', () => stub('ReceiveFooter'))
jest.mock('../components/shipment-list/ReceiveShipmentMaterialItem', () => ({ __esModule: true, default: ({ data }: any) => {
  const { Text } = require('react-native')
  return <Text>{`material ${data.id}`}</Text>
} }))
jest.mock('../components/shipment-list/ShipmentStatusConfirmationDialog', () => ({ __esModule: true, default: ({ dialogVisible, onConfirm, onClose }: any) => {
  const { Pressable, Text } = require('react-native')
  return dialogVisible ? (
    <>
      <Pressable testID='dlg-confirm' onPress={onConfirm}><Text>confirm</Text></Pressable>
      <Pressable testID='dlg-close' onPress={onClose}><Text>close</Text></Pressable>
    </>
  ) : null
} }))
jest.mock('../components/shipment-list/ShipmentItemDetailHeader', () => stub('ItemDetailHeader'))
jest.mock('../components/AddDisposalMaterialInfo', () => stub('AddMaterialInfo'))
jest.mock('../components/DisposalShipmentHeader', () => stub('ShipmentHeader'))
jest.mock('../components/DisposalInputItem', () => ({ __esModule: true, default: ({ name }: any) => {
  const { Text } = require('react-native')
  return <Text>{`input ${name}`}</Text>
} }))
const field = (testID: string, name: string) => ({ __esModule: true, default: ({ control }: any) => {
  const { TextInput } = require('react-native')
  const { useController } = require('react-hook-form')
  const { field: f } = useController({ control, name })
  return <TextInput testID={testID} value={f.value} onChangeText={f.onChange} />
} })
jest.mock('../components/ReviewDisposalHeader', () => field('report-input', 'disposalReportNumber'))
jest.mock('../components/ReviewDisposalFooter', () => field('comment-input', 'comment'))
jest.mock('../components/ReviewItemDisposal', () => ({ __esModule: true, default: ({ item }: any) => {
  const { Text } = require('react-native')
  return <Text>{`review ${item.id}`}</Text>
} }))

import React from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react-native'
import { showError } from '@/utils/CommonUtils'
import DisposalShipmentDetailScreen from '../shipment-list/DisposalShipmentDetailScreen'
import DisposalShipmentItemDetailScreen from '../shipment-list/DisposalShipmentItemDetailScreen'
import ReceiveDisposalShipmentScreen from '../shipment-list/ReceiveDisposalShipmentScreen'
import AddDisposalScreen from '../disposal/AddDisposalScreen'
import ReviewSelfDisposalScreen from '../disposal/ReviewSelfDisposalScreen'
import { DISPOSAL_STATUS } from '../disposal-constant'

const t = (k: string) => k

describe('DisposalShipmentDetailScreen', () => {
  const hook = (over: any = {}) => ({
    t,
    data: { activity: { name: 'Rutin' }, status: DISPOSAL_STATUS.SHIPPED, updated_at: 'u' },
    sections: [
      { key: 'items', title: 'label.item', data: [{ id: 1 }] },
      { key: 'comments', title: 'label.comment', data: [{ id: 2 }] },
      { key: 'lain', title: 'lain', data: [{ id: 3 }] },
    ],
    actionConfig: { buttonPreset: 'filled', buttonText: 'btn.action', Icon: undefined, testID: 'btn-action' },
    isShipped: true,
    isLoading: false,
    isSender: false,
    refetch: jest.fn(),
    handlePressItem: jest.fn(),
    handleActionButton: jest.fn(),
    ...over,
  })

  it('menampilkan item, komentar, peringatan dan menjalankan aksi', () => {
    const h = hook()
    mockDetail.mockReturnValue(h)
    render(<DisposalShipmentDetailScreen {...({ route: { params: { id: 1 } } } as any)} />)
    expect(screen.getByText('item 1')).toBeTruthy()
    expect(screen.getByText('comment 2')).toBeTruthy()
    expect(screen.getByText('WarningBox')).toBeTruthy()
    expect(screen.getByText('DetailHeader')).toBeTruthy()
    fireEvent.press(screen.getByTestId('item-1'))
    expect(h.handlePressItem).toHaveBeenCalledWith({ id: 1 })
    fireEvent.press(screen.getByTestId('btn-action'))
    expect(h.handleActionButton).toHaveBeenCalled()
    expect(mockDetail).toHaveBeenCalledWith({ id: 1 })
  })

  it('pengirim tidak melihat peringatan dan data kosong tanpa header', () => {
    mockDetail.mockReturnValue(hook({ isSender: true, data: undefined, isShipped: false, sections: [] }))
    render(<DisposalShipmentDetailScreen {...({ route: { params: {} } } as any)} />)
    expect(screen.queryByText('WarningBox')).toBeNull()
    expect(screen.queryByText('DetailHeader')).toBeNull()
    expect(screen.queryByTestId('btn-action')).toBeNull()
  })

  it('status bukan shipped tidak menampilkan peringatan', () => {
    mockDetail.mockReturnValue(
      hook({ data: { activity: { name: 'A' }, status: DISPOSAL_STATUS.RECEIVED } })
    )
    render(<DisposalShipmentDetailScreen {...({ route: { params: {} } } as any)} />)
    expect(screen.queryByText('WarningBox')).toBeNull()
  })
})

describe('DisposalShipmentItemDetailScreen', () => {
  const route = (batch: number) => ({
    params: {
      activityName: 'Rutin',
      status: DISPOSAL_STATUS.RECEIVED,
      item: {
        master_material: { name: 'Vaksin', managed_in_batch: batch },
        confirmed_qty: 1,
        shipped_qty: 2,
        disposal_shipment_stocks: [
          {
            id: 1,
            disposal_received_qty: 1,
            disposal_discard_qty: 1,
            transaction_reasons: { title: 'R' },
            stock: { batch: null, activity: { name: 'A' } },
          },
        ],
      },
    },
  })
  it('batch tampil dengan judul section', () => {
    render(<DisposalShipmentItemDetailScreen {...({ route: route(1) } as any)} />)
    expect(screen.getByText('section.material_batch')).toBeTruthy()
    expect(screen.getByText('ItemDetailHeader')).toBeTruthy()
  })
  it('non batch tanpa judul section', () => {
    render(<DisposalShipmentItemDetailScreen {...({ route: route(0) } as any)} />)
    expect(screen.queryByText('section.material_batch')).toBeNull()
  })
})

describe('ReceiveDisposalShipmentScreen', () => {
  const hook = (over: any = {}) => {
    const { useForm } = require('react-hook-form')
    return {
      methods: useForm(),
      disposalItems: [{ id: 1 }, { id: 2 }],
      isSaveDisabled: false,
      isOpenDialog: false,
      isLoading: false,
      openDialog: jest.fn(),
      closeDialog: jest.fn(),
      confirmSubmitReceive: jest.fn(),
      ...over,
    }
  }
  const Harness = ({ over }: any) => {
    const h = hook(over)
    mockReceive.mockReturnValue(h)
    ;(Harness as any).h = h
    return <ReceiveDisposalShipmentScreen {...({ route: { params: { data: { id: 77 } } } } as any)} />
  }

  it('membuka dialog lalu konfirmasi dan menutup', () => {
    const { rerender } = render(<Harness />)
    expect(screen.getByText('material 1')).toBeTruthy()
    fireEvent.press(screen.getByTestId('btn-submit-receive-disposal-shipment'))
    expect((Harness as any).h.openDialog).toHaveBeenCalled()
    rerender(<Harness over={{ isOpenDialog: true }} />)
    fireEvent.press(screen.getByTestId('dlg-confirm'))
    expect((Harness as any).h.confirmSubmitReceive).toHaveBeenCalled()
    fireEvent.press(screen.getByTestId('dlg-close'))
    expect((Harness as any).h.closeDialog).toHaveBeenCalled()
  })

  it('tombol nonaktif saat belum bisa disimpan', () => {
    render(<Harness over={{ isSaveDisabled: true }} />)
    fireEvent.press(screen.getByTestId('btn-submit-receive-disposal-shipment'))
    expect((Harness as any).h.openDialog).not.toHaveBeenCalled()
  })
})

describe('AddDisposalScreen', () => {
  const Harness = ({ over }: any) => {
    const { useForm } = require('react-hook-form')
    const methods = useForm()
    const h = {
      activity: { name: 'Rutin' },
      material: {},
      methods,
      errors: { discard: [{ disposal_qty: { message: 'salah' } }] },
      isSaveEnabled: true,
      sections: [
        { key: 'discard', title: 'Buang', data: [{ title: 'a' }] },
        { key: 'received', title: 'Terima', data: [{ title: 'b' }] },
      ],
      handleSave: jest.fn(),
      ...over,
    }
    mockAddForm.mockReturnValue(h)
    ;(Harness as any).h = h
    return <AddDisposalScreen {...({ route: { params: { disposalStock: { id: 1 }, type: 'self' } } } as any)} />
  }

  it('menampilkan section dan menyimpan', () => {
    render(<Harness />)
    expect(screen.getByText('Buang')).toBeTruthy()
    expect(screen.getByText('input discard.0.disposal_qty')).toBeTruthy()
    expect(screen.getByText('input received.0.disposal_qty')).toBeTruthy()
    fireEvent.press(screen.getByText('button.save'))
    expect((Harness as any).h.handleSave).toHaveBeenCalled()
    expect(mockAddForm).toHaveBeenCalledWith({ disposalStock: { id: 1 }, type: 'self' })
  })

  it('tombol simpan tidak aktif jika form belum valid', () => {
    render(<Harness over={{ isSaveEnabled: false }} />)
    fireEvent.press(screen.getByText('button.save'))
    expect((Harness as any).h.handleSave).not.toHaveBeenCalled()
  })
})

describe('ReviewSelfDisposalScreen', () => {
  const setup = () => {
    const h = {
      t,
      activity: { name: 'Rutin' },
      disposalItems: [{ id: 1 }, { id: 2 }],
      isLoading: false,
      submitData: jest.fn(),
    }
    mockReviewSelf.mockReturnValue(h)
    render(<ReviewSelfDisposalScreen />)
    return h
  }
  beforeEach(() => jest.clearAllMocks())

  it('menampilkan item dan menolak submit tanpa nomor laporan', () => {
    setup()
    expect(screen.getByText('review 1')).toBeTruthy()
    fireEvent.press(screen.getByTestId('btn-submit-self-disposal'))
    expect(showError).toHaveBeenCalledWith('disposal.validation.empty_report_number')
  })

  it('konfirmasi dialog mengirim nomor laporan dan komentar', () => {
    const h = setup()
    fireEvent.changeText(screen.getByTestId('report-input'), 'RPT-9')
    fireEvent.changeText(screen.getByTestId('comment-input'), 'catatan')
    fireEvent.press(screen.getByTestId('btn-submit-self-disposal'))
    fireEvent.press(screen.getByTestId('btn-confirm-submit-self-disposal'))
    expect(h.submitData).toHaveBeenCalledWith('RPT-9', 'catatan')
  })

  it('batal dialog tidak mengirim', () => {
    const h = setup()
    fireEvent.changeText(screen.getByTestId('report-input'), 'RPT-9')
    fireEvent.press(screen.getByTestId('btn-submit-self-disposal'))
    fireEvent.press(screen.getByTestId('btn-cancel-submit-self-disposal'))
    expect(h.submitData).not.toHaveBeenCalled()
  })
})
