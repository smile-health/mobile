const mockLoad = jest.fn()
const mockShowError = jest.fn()
const mockShowSuccess = jest.fn()
const mockNavDetail = jest.fn()

jest.mock('@/storage', () => ({ loadLocalData: (...a: any[]) => mockLoad(...a) }))
jest.mock('@/utils/CommonUtils', () => ({
  numberFormat: (n: number) => String(n),
  showError: (...a: any[]) => mockShowError(...a),
  showSuccess: (...a: any[]) => mockShowSuccess(...a),
}))
jest.mock('../NavigationHelpers', () => ({ navigateToOrderDetail: (...a: any[]) => mockNavDetail(...a) }))
jest.mock('i18next', () => ({ t: (k: string, o?: any) => (o ? `${k}:${o.qty}` : k) }))

import {
  calculateOrderStockCounts,
  getMissingCompanionMaterials,
  getOrderStatusFromIndex,
  getSectionedBatchData,
  getValueFromDraftByStockId,
  isOrderQuantityValid,
  loadExistingDistributionActivity,
  loadExistingDistributionDraft,
  loadExistingDistributionEntity,
  loadExistingOrderDraft,
  loadExistingOrderEntity,
  loadExistingRegularActivity,
  loadExistingRelocationDraft,
  showSuccessAndNavigateToDetail,
  validateReceivedQty,
} from '../OrderHelpers'

const t: any = (k: string) => k

beforeEach(() => {
  jest.clearAllMocks()
  mockLoad.mockResolvedValue('stored')
})

describe('loader draft/activity/entity', () => {
  it('memakai kunci storage per program', async () => {
    await loadExistingOrderDraft(3)
    await loadExistingRegularActivity(3)
    await loadExistingDistributionDraft(3)
    await loadExistingDistributionActivity(3)
    await loadExistingOrderEntity(3)
    await loadExistingDistributionEntity(3)
    expect(mockLoad.mock.calls.map((c) => c[0])).toEqual([
      'regularDraft-3',
      'regularActivity-3',
      'distributionDraft-3',
      'distributionActivity-3',
      'regularEntity-3',
      'distributionEntity-3',
    ])
  })

  it('draft relokasi: callback dipanggil bila ada, error menghasilkan null', async () => {
    const cb = jest.fn()
    expect(await loadExistingRelocationDraft(2, cb)).toBe('stored')
    expect(mockLoad).toHaveBeenCalledWith('relocationDraft-2')
    expect(cb).toHaveBeenCalledWith('stored')
    mockLoad.mockResolvedValueOnce(null)
    expect(await loadExistingRelocationDraft(2, cb)).toBeNull()
    expect(cb).toHaveBeenCalledTimes(1)
    mockLoad.mockResolvedValueOnce('x')
    expect(await loadExistingRelocationDraft(2)).toBe('x')
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {})
    mockLoad.mockRejectedValueOnce(new Error('x'))
    expect(await loadExistingRelocationDraft(2)).toBeNull()
    spy.mockRestore()
  })
})

describe('isOrderQuantityValid', () => {
  it.each([
    [{ quantity: '' }, 'error.complete_data', false],
    [{ quantity: '0' }, 'error.entry_batch_stock_zero', false],
    [{ quantity: '4', recommendation: 5, reason: '' }, 'error.complete_data', false],
  ])('invalid %j', (p: any, msg, ok) => {
    expect(isOrderQuantityValid({ ...p, t })).toBe(ok)
    expect(mockShowError).toHaveBeenCalledWith(msg)
  })

  it('valid: sesuai rekomendasi, ada alasan, atau tanpa rekomendasi', () => {
    expect(isOrderQuantityValid({ quantity: '5', recommendation: 5, reason: '', t } as any)).toBe(true)
    expect(isOrderQuantityValid({ quantity: '4', recommendation: 5, reason: 'x', t } as any)).toBe(true)
    expect(isOrderQuantityValid({ quantity: '4', t } as any)).toBe(true)
    expect(mockShowError).not.toHaveBeenCalled()
  })
})

describe('perhitungan dan format', () => {
  it('calculateOrderStockCounts', () => {
    expect(calculateOrderStockCounts()).toEqual({ allocateCount: 0, receiveCount: 0 })
    expect(calculateOrderStockCounts([{ allocated_qty: 2, received_qty: 1 }, {}] as any)).toEqual({ allocateCount: 2, receiveCount: 1 })
    expect(calculateOrderStockCounts({} as any)).toEqual({ allocateCount: 0, receiveCount: 0 })
  })

  it('getMissingCompanionMaterials', () => {
    const data = [
      { material_name: 'A', material_companion: [{ name: 'B' }, { name: 'A' }] },
      { material_name: 'C', material_companion: [{ name: 'B' }] },
      { material_name: 'D' },
    ]
    const tt: any = (k: string, o: any) => `${k}|${o.materials}`
    const r = getMissingCompanionMaterials(data, tt)
    expect(r.uniqueMissingCompanions).toEqual(['B', undefined])
    expect(getMissingCompanionMaterials([], tt).uniqueMissingCompanions).toEqual([])
  })

  it('getSectionedBatchData memisah batch valid dan kedaluwarsa', () => {
    const future = new Date(Date.now() + 5 * 864e5).toISOString()
    const past = new Date(Date.now() - 5 * 864e5).toISOString()
    const r = getSectionedBatchData({
      stocks: [
        { batch: { code: 'ok', expired_date: future } },
        { batch: { code: 'old', expired_date: past } },
        { batch: { code: 'noexp' } },
        { batch: {} },
      ],
    } as any)
    expect(r[0].data.map((s: any) => s.batch.code)).toEqual(['ok', 'noexp'])
    expect(r[1].data.map((s: any) => s.batch.code)).toEqual(['old'])
    expect(getSectionedBatchData({} as any)[0].data).toEqual([])
  })

  it('validateReceivedQty', () => {
    expect(validateReceivedQty(0, 5)).toBeUndefined()
    expect(validateReceivedQty(5, 5)).toBeUndefined()
    expect(validateReceivedQty(3, 5)).toBe('validation.received_qty_mismatch:5')
  })

  it('getOrderStatusFromIndex', () => {
    expect(getOrderStatusFromIndex(0)).toBeNull()
    expect(getOrderStatusFromIndex(1)).toBe(8)
    expect(getOrderStatusFromIndex(4)).toBe(3)
  })
})

describe('getValueFromDraftByStockId', () => {
  const draft = [{ children: [{ stock: [{ stock_id: 1, draft_allocated_qty: 7 }] }, { stock: undefined }] }, { children: undefined }]
  it('mencari nilai, null bila tidak ada atau draft kosong', () => {
    expect(getValueFromDraftByStockId(draft as any, 1, 'draft_allocated_qty')).toBe(7)
    expect(getValueFromDraftByStockId(draft as any, 2, 'draft_allocated_qty')).toBeNull()
    expect(getValueFromDraftByStockId(undefined as any, 1, 'x')).toBeNull()
    expect(getValueFromDraftByStockId(draft[0] as any, 1, 'draft_allocated_qty')).toBe(7)
  })
})

describe('showSuccessAndNavigateToDetail', () => {
  it('menampilkan sukses lalu navigasi', () => {
    showSuccessAndNavigateToDetail('msg', 'id', 5, 2)
    expect(mockShowSuccess).toHaveBeenCalledWith('msg', 'id')
    expect(mockNavDetail).toHaveBeenCalledWith(5, 2)
  })
})
