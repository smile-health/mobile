jest.mock('@/storage', () => ({
  saveLocalData: jest.fn(),
  removeLocalData: jest.fn(),
}))
jest.mock('axios', () => {
  const instance: any = jest.fn()
  instance.interceptors = {
    request: { use: jest.fn() },
    response: { use: jest.fn() },
  }
  instance.defaults = { headers: { common: {} } }
  return {
    __esModule: true,
    default: { create: () => instance, Cancel: class {} },
  }
})
import { removeLocalData, saveLocalData } from '@/storage'
import { materialsApi } from '../apis'
import { reasonApi } from '../apis/reason.api'
import * as al from '../features/allocate.slice'
import * as mt from '../features/materials.slice'
import * as rl from '../features/relocation.slice'
import * as tr from '../features/ticketReason.slice'

beforeEach(() => jest.clearAllMocks())

describe('ticketReason.slice', () => {
  const r = tr.ticketReasonReducer
  const init = () => r(undefined, { type: 'x' })
  const mat: any = { id: 1, qty: 0, batches: [] }

  it('material: tambah, ganti, hapus', () => {
    let s = r(init(), tr.addTicketMaterial(mat))
    s = r(s, tr.addTicketMaterial({ ...mat, qty: 5 }))
    s = r(s, tr.addTicketMaterial({ id: 2 } as any))
    expect(s.ticketMaterials).toHaveLength(2)
    expect(s.ticketMaterials[0].qty).toBe(5)
    s = r(s, tr.removeTicketMaterial(2))
    expect(s.ticketMaterials).toHaveLength(1)
  })

  it('batch: tambah, ganti, hapus & hitung ulang qty', () => {
    let s = r(init(), tr.addTicketMaterial({ id: 1 } as any))
    s = r(
      s,
      tr.addBatchToTicketMaterial({
        materialId: 1,
        batch: { batch_code: 'a', qty: 2 } as any,
      })
    )
    s = r(
      s,
      tr.addBatchToTicketMaterial({
        materialId: 1,
        batch: { batch_code: 'b', qty: 3 } as any,
      })
    )
    s = r(
      s,
      tr.addBatchToTicketMaterial({
        materialId: 1,
        batch: { batch_code: 'a', qty: 7 } as any,
      })
    )
    expect(s.ticketMaterials[0].batches).toHaveLength(2)
    expect(s.ticketMaterials[0].batches![0].qty).toBe(7)
    s = r(
      s,
      tr.addBatchToTicketMaterial({
        materialId: 99,
        batch: { batch_code: 'z' } as any,
      })
    )
    expect(s.ticketMaterials).toHaveLength(1)
    s = r(
      s,
      tr.removeBatchFromTicketMaterial({ materialId: 1, batchCode: 'a' })
    )
    expect(s.ticketMaterials[0].qty).toBe(3)
    s = r(
      s,
      tr.removeBatchFromTicketMaterial({ materialId: 1, batchCode: 'b' })
    )
    expect(s.ticketMaterials[0].qty).toBe(0)
    const same = r(
      s,
      tr.removeBatchFromTicketMaterial({ materialId: 55, batchCode: 'b' })
    )
    expect(same).toEqual(s)
  })

  it('batch dengan qty kosong dan material tanpa batches', () => {
    let s = r(
      init(),
      tr.addTicketMaterial({
        id: 1,
        batches: [{ batch_code: 'a' }, { batch_code: 'b', qty: 4 }],
      } as any)
    )
    s = r(
      s,
      tr.removeBatchFromTicketMaterial({ materialId: 1, batchCode: 'b' })
    )
    expect(s.ticketMaterials[0].qty).toBe(0)
    s = r(init(), tr.addTicketMaterial({ id: 3 } as any))
    s = r(
      s,
      tr.removeBatchFromTicketMaterial({ materialId: 3, batchCode: 'x' })
    )
    expect(s.ticketMaterials[0].batches).toBeUndefined()
  })

  it('form data, reasons, ignoreConfirm, clear', () => {
    let s = r(
      init(),
      tr.setTicketFormData({ doNumber: '1', arrivalDate: 'd', isSubmitted: 0 })
    )
    s = r(s, tr.setIgnoreConfirm(true))
    expect(tr.getTicketFormData({ ticketReason: s } as any)).toEqual(
      s.ticketFormData
    )
    expect(tr.getStoreIgnoreConfirm({ ticketReason: s } as any)).toBe(true)
    s = r(s, tr.clearTicketFormData())
    expect(s.ticketFormData).toBeUndefined()
    expect(s.ignoreConfirm).toBe(false)
    s = r(
      s,
      tr.setReasons({ reasons: [{ label: 'a' }] as any, lastUpdated: 3 })
    )
    expect(tr.getReasons({ ticketReason: s } as any)).toHaveLength(1)
    expect(
      tr.getReasons({ ticketReason: { reasons: undefined } } as any)
    ).toEqual([])
    s = r(s, tr.addTicketMaterial(mat))
    s = r(s, tr.setIgnoreConfirm(true))
    s = r(s, tr.clearTicketMaterials())
    expect(s.ticketMaterials).toEqual([])
    expect(s.ignoreConfirm).toBe(false)
    expect(tr.getTicketMaterials({ ticketReason: s } as any)).toEqual([])
  })

  it('getReasons API dipetakan ke opsi bertingkat', () => {
    const action = reasonApi.endpoints.getReasons.matchFulfilled as any
    const payload = [
      { id: 1, title: 'T', child: [{ id: 2, name: 'N' }, { id: 3 }] },
      { id: 4, name: 'Nm' },
      { id: 5 },
    ]
    const s = r(init(), {
      type: 'api/executeQuery/fulfilled',
      payload,
      meta: {
        arg: {
          endpointName: 'getReasons',
          originalArgs: undefined,
          type: 'query',
        },
        requestId: 'r',
        requestStatus: 'fulfilled',
      },
    })
    expect(action).toBeDefined()
    expect(s.reasons[0]).toEqual({
      label: 'T',
      value: '1',
      children: [
        { label: 'N', value: '2' },
        { label: '', value: '3' },
      ],
    })
    expect(s.reasons[1].label).toBe('Nm')
    expect(s.reasons[2].label).toBe('')
    expect(s.lastUpdated).not.toBeNull()
  })
})

describe('allocate.slice', () => {
  const r = al.allocateReducer
  const init = () => r(undefined, { type: 'x' })
  it('draft & order item', () => {
    let s = r(
      init(),
      al.setAllocatedDraft({ material_id: 1, order_id: 5 } as any)
    )
    s = r(s, al.setAllocatedDraft({ material_id: 1, order_id: 5, x: 1 } as any))
    s = r(s, al.setAllocatedDraft({ material_id: 2, order_id: 6 } as any))
    expect(s.allocatedDraft).toHaveLength(2)
    s = r(s, al.filterAllocatedDraftByOrderId(5))
    expect(s.allocatedDraft).toHaveLength(1)
    s = r(
      s,
      al.setAllocatedOrderItem({ orderId: 5, materialId: 1, data: { a: 1 } })
    )
    s = r(
      s,
      al.setAllocatedOrderItem({ orderId: 5, materialId: 2, data: { a: 2 } })
    )
    expect(s.allocatedOrderItem['5']['2']).toEqual({ a: 2 })
    expect(
      al.selectAllocatedOrderItemsByOrderId(5)({ allocate: s })['1']
    ).toEqual({ a: 1 })
    expect(al.selectAllocatedOrderItemsByOrderId(9)({ allocate: s })).toEqual(
      {}
    )
    expect(al.getAllocatedDraft({ order: s })).toBe(s.allocatedDraft)
  })
  it('getAllocatedOrderItem(+ByOrderId) mengembalikan nilai', () => {
    let s = r(
      init(),
      al.setAllocatedOrderItem({ orderId: 1, materialId: 1, data: { a: 1 } })
    )
    expect(
      r(s, al.getAllocatedOrderItem({ orderId: 1, materialId: 1 }))
    ).toEqual({ a: 1 })
    expect(
      r(s, al.getAllocatedOrderItem({ orderId: 2, materialId: 1 }))
    ).toBeNull()
    expect(
      r(s, al.allocateSlice.actions.getAllocatedOrderItemsByOrderId(1))
    ).toEqual({ '1': { a: 1 } })
    expect(
      r(s, al.allocateSlice.actions.getAllocatedOrderItemsByOrderId(3))
    ).toEqual({})
    s = r(s, al.resetAllocatedDraft())
    expect(s).toEqual(init())
  })
})

describe('relocation.slice', () => {
  const r = rl.relocationReducer
  const init = () => r(undefined, { type: 'x' })
  it('setter dan reset', () => {
    let s = r(init(), rl.setActivity({ id: 1 } as any))
    s = r(s, rl.setVendor({ id: 2 } as any))
    s = r(s, rl.setParentMaterial({ id: 9, name: 'P' } as any))
    expect(s.vendor).toEqual({ id: 2 })
    s = r(
      s,
      rl.setExistingRelocation({
        activity: { id: 3 },
        vendor: { id: 4 },
        parentMaterial: { id: 5 },
        relocations: [{ material_id: 1 }],
      } as any)
    )
    expect(s.relocations).toHaveLength(1)
    s = r(s, rl.clearRelocations({ programId: 1 }))
    expect(s.relocations).toEqual([])
    expect(removeLocalData).toHaveBeenCalledWith('relocationDraft-1')
    expect(r(s, rl.resetRelocationState())).toEqual(init())
  })

  it('material biasa: tambah dan ganti', () => {
    let s = r(
      init(),
      rl.setRelocations({
        relocation: { material_id: 1, ordered_qty: 1 } as any,
        programId: 1,
      })
    )
    s = r(
      s,
      rl.setRelocations({
        relocation: { material_id: 1, ordered_qty: 4 } as any,
        programId: 1,
      })
    )
    expect(s.relocations).toEqual([{ material_id: 1, ordered_qty: 4 }])
    expect(saveLocalData).toHaveBeenCalledTimes(2)
  })

  it('material trademark: parent baru, parent ada, parent menimpa', () => {
    let s = r(init(), rl.setParentMaterial({ id: 9, name: 'P' } as any))
    s = r(
      s,
      rl.setRelocations({
        relocation: { material_id: 91, parent_id: 9, ordered_qty: 2 } as any,
        programId: 1,
      })
    )
    expect(s.relocations[0].material_id).toBe(9)
    expect(s.relocations[0].ordered_qty).toBe(2)
    s = r(
      s,
      rl.setRelocations({
        relocation: { material_id: 92, parent_id: 9, ordered_qty: 3 } as any,
        programId: 1,
      })
    )
    s = r(
      s,
      rl.setRelocations({
        relocation: { material_id: 91, parent_id: 9, ordered_qty: 1 } as any,
        programId: 1,
      })
    )
    expect(s.relocations[0].ordered_qty).toBe(4)
    expect(s.relocations[0].material_hierarchy).toHaveLength(2)
    // parent_id tidak ada di list tapi parentMaterial sudah ada di list → ganti
    let t = r(init(), rl.setParentMaterial({ id: 9, name: 'P' } as any))
    t = r(
      t,
      rl.setExistingRelocation({
        activity: {},
        vendor: {},
        parentMaterial: { id: 9, name: 'P' },
        relocations: [{ material_id: 8 }],
      } as any)
    )
    t = r(
      t,
      rl.setRelocations({
        relocation: { material_id: 91, parent_id: 7, ordered_qty: 2 } as any,
        programId: 1,
      })
    )
    expect(t.relocations).toHaveLength(2)
    t = r(
      t,
      rl.setExistingRelocation({
        activity: {},
        vendor: {},
        parentMaterial: { id: 8, name: 'Q' },
        relocations: [{ material_id: 8 }],
      } as any)
    )
    t = r(
      t,
      rl.setRelocations({
        relocation: { material_id: 91, parent_id: 7, ordered_qty: 5 } as any,
        programId: 1,
      })
    )
    expect(t.relocations).toHaveLength(1)
    expect(t.relocations[0].ordered_qty).toBe(5)
    // parent ada tanpa hierarchy
    t = r(
      t,
      rl.setExistingRelocation({
        activity: {},
        vendor: {},
        parentMaterial: { id: 8 },
        relocations: [{ material_id: 8, ordered_qty: 1 }],
      } as any)
    )
    t = r(
      t,
      rl.setRelocations({
        relocation: { material_id: 91, parent_id: 8, ordered_qty: 6 } as any,
        programId: 1,
      })
    )
    expect(t.relocations[0].ordered_qty).toBe(6)
  })
})

describe('materials.slice', () => {
  const r = mt.materialsReducer
  const m3 = (id: number, name: string, extra: any = {}): any => ({
    id,
    name,
    material_level_id: 3,
    activities: [1],
    is_addremove: 1,
    is_managed_in_batch: 1,
    manufactures: [{ id: 1, name: 'Mf' }],
    activityMinMax: [{ activity_id: 1, min: 1, max: 2 }],
    activity_protocols: [],
    stocks: [
      {
        stock_id: 1,
        activity_id: 1,
        qty: 2,
        allocated: 1,
        updated_at: '2025-01-01',
        batch: { code: null },
        budget_source: null,
      },
    ],
    material_hierarchy: null,
    ...extra,
  })
  const m2: any = {
    id: 50,
    name: 'Tm',
    material_level_id: 2,
    activities: [1],
    manufactures: [],
    activityMinMax: [],
    activity_protocols: [],
    stocks: [],
    material_hierarchy: [m3(60, 'Child')],
  }
  const root = (extra: any = {}): any => ({
    materials: { materials: [m3(2, 'B'), m3(1, 'A', { is_addremove: 0 }), m2] },
    transaction: { activity: { id: 1, name: 'Act' } },
    auth: { user: { entity: { id: 1, name: 'E' } } },
    home: { activeMenu: { transactionType: undefined } },
    cva: { cva: { origin_activities: [] } },
    stock: {
      stockActivity: { id: 1, name: 'Act' },
      stockMaterial: { material: { id: 50 } },
    },
    workspace: {
      selectedWorkspace: { config: { material: { is_hierarchy_enabled: 0 } } },
    },
    ...extra,
  })

  it('reducer setMaterials & matcher getMaterials', () => {
    let s = r(
      undefined,
      mt.setMaterials({ lastUpdated: 5, materials: [m3(1, 'A')] } as any)
    )
    expect(s.lastUpdated).toBe(5)
    s = r(s, {
      type: 'api/executeQuery/fulfilled',
      payload: [m3(2, 'B')],
      meta: {
        arg: { endpointName: 'getMaterials', originalArgs: 7, type: 'query' },
        requestId: 'r',
        requestStatus: 'fulfilled',
      },
    })
    expect(materialsApi.endpoints.getMaterials).toBeDefined()
    expect(s.materials).toHaveLength(1)
    expect((saveLocalData as jest.Mock).mock.calls[0][0]).toBe('material-7')
  })

  it('selector stok transaksi', () => {
    expect(mt.getAppDataTrxStocks(root({ auth: { user: undefined } }))).toEqual(
      []
    )
    const all: any = mt.getAppDataTrxStocks(root())
    expect(all.map((x: any) => x.material.name)).toEqual(['A', 'B', 'Child'])
    const addRemove: any = mt.getAppDataTrxStocks(
      root({ home: { activeMenu: { transactionType: 1 } } })
    )
    expect(addRemove.length).toBeLessThanOrEqual(all.length)
  })

  it('selector detail & manufacturer & option', () => {
    expect(mt.getAppDataStockDetail(root(), 2)).toBeDefined()
    expect(mt.getAppDataStockDetail(root(), 999)).toEqual([])
    expect(mt.getMaterialManufacturer(root(), 2)).toEqual([
      { id: 1, name: 'Mf', address: '' },
    ])
    expect(mt.getMaterialManufacturer(root(), 999)).toEqual([])
    const l3: any = mt.getMaterialOption(root())
    expect(l3.map((o: any) => o.label)).toEqual(['A', 'B', 'Child'])
    expect(l3[0].isBatch).toBe(1)
    const l2: any = mt.getMaterialOption(root(), 92)
    expect(Array.isArray(l2)).toBe(true)
    expect(mt.getMaterialOption(root(), 12_345)).toEqual([])
  })

  it('inventory stock & trademark detail', () => {
    expect(mt.getInventoryStock(root({ auth: { user: undefined } }))).toEqual(
      []
    )
    expect((mt.getInventoryStock(root()) as any).length).toBe(3)
    const hier = root({
      workspace: {
        selectedWorkspace: {
          config: { material: { is_hierarchy_enabled: 1 } },
        },
      },
    })
    expect(Array.isArray(mt.getInventoryStock(hier))).toBe(true)
    expect(mt.getTrademarkMaterialDetail(root())).not.toBeNull()
    expect(
      mt.getTrademarkMaterialDetail(root({ auth: { user: undefined } }))
    ).toBeNull()
    expect(
      mt.getTrademarkMaterialDetail(
        root({
          stock: { stockActivity: {}, stockMaterial: { material: { id: 1 } } },
        })
      )
    ).toBeNull()
  })

  it('activity materials', () => {
    expect(mt.getActivityMaterials(root())).toEqual([])
    expect(
      mt.getActivityMaterials(
        root({ workspace: { selectedWorkspace: null } }),
        1
      )
    ).toEqual([])
    expect((mt.getActivityMaterials(root(), 1) as any).length).toBe(3)
    const hier = root({
      workspace: {
        selectedWorkspace: {
          config: { material: { is_hierarchy_enabled: 1 } },
        },
      },
    })
    expect(Array.isArray(mt.getActivityMaterials(hier, 1))).toBe(true)
    expect(Array.isArray(mt.getActivityMaterials(hier, 1, 93))).toBe(true)
    expect(mt.getActivityMaterials(root(), 1, 12_345)).toEqual([])
  })
})
