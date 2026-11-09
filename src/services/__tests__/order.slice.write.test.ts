jest.mock('@/storage', () => ({
  saveLocalData: jest.fn(),
  removeLocalData: jest.fn(),
}))
import { removeLocalData, saveLocalData } from '@/storage'
import {
  orderReducer as reducer,
  setOrderFilter,
  resetFilter,
  setOrderActivity,
  setOrderEntity,
  setDraft,
  resetOrderActivity,
  resetOrderEntity,
  resetDraft,
  setDetailOrder,
  setOrderItemDraft,
  resetOrderItemDraft,
  setActiveTab,
  resetOrderState,
  removeAllChildDraft,
  removeOrderState,
  getOrderFilters,
  getActiveTab,
  getOrderItemDraft,
  getOrderActivities,
  getOrderEntities,
  getOrderDrafts,
} from '../features/order.slice'

const init = () => reducer(undefined, { type: 'init' })
const it1: any = { material_id: 1, ordered_qty: 2 }
const child: any = { material_id: 11, ordered_qty: 3 }
const child2: any = { material_id: 12, ordered_qty: 4 }

beforeEach(() => jest.clearAllMocks())

describe('order.slice filter & tab', () => {
  it('setOrderFilter dengan purpose me-reset filter lalu menimpa', () => {
    let s = reducer(init(), setOrderFilter({ page: 3, order_number: 'X' }))
    expect(s.filter.page).toBe(3)
    s = reducer(s, setOrderFilter({ purpose: 'sales', vendor_id: 5 } as any))
    expect(s.filter.purpose).toBe('sales')
    expect(s.filter.page).toBe(1)
    expect(s.filter.order_number).toBeNull()
    expect(s.filter.vendor_id).toBe(5)
  })

  it('resetFilter dan setActiveTab', () => {
    let s = reducer(init(), setOrderFilter({ vendor_id: 5, status: 2 } as any))
    s = reducer(s, resetFilter())
    expect(s.filter.vendor_id).toBeNull()
    expect(s.filter.status).toBe(2)
    s = reducer(s, setActiveTab(2))
    expect(s.activeTab).toBe(2)
  })
})

describe('order.slice activity/entity', () => {
  it('set & reset activity menyimpan ke storage', () => {
    let s = reducer(
      init(),
      setOrderActivity({ type: 'regular', activity: { id: 1 } as any, programId: 7 })
    )
    expect(s.activities.regular?.[7]).toEqual({ id: 1 })
    expect(saveLocalData).toHaveBeenCalledWith('regularActivity-7', { id: 1 })
    s = reducer(s, setOrderActivity({ type: 'regular', activity: { id: 2 } as any }))
    expect(s.activities.regular?.[0]).toEqual({ id: 2 })
    s = reducer(s, resetOrderActivity({ type: 'regular', programId: 7 }))
    expect(s.activities.regular?.[7]).toBeUndefined()
    expect(removeLocalData).toHaveBeenCalledWith('regularActivity-7')
    s = reducer(s, resetOrderActivity({ type: 'regular' }))
    expect(removeLocalData).toHaveBeenCalledWith('regularActivity-0')
    // tipe tanpa activity
    s = reducer(removeOrderState_(), resetOrderActivity({ type: 'return' }))
    expect(s.activities).toEqual({})
  })

  it('set & reset entity', () => {
    let s = reducer(init(), setOrderEntity({ type: 'return', entities: { id: 9 } as any, programId: 1 }))
    expect(s.entities.return).toEqual({ id: 9 })
    expect(saveLocalData).toHaveBeenCalledWith('returnEntity-1', { id: 9 })
    s = reducer(s, resetOrderEntity({ type: 'return', programId: 1 }))
    expect(s.entities.return).toEqual({})
    expect(removeLocalData).toHaveBeenCalledWith('returnEntity-1')
  })
})

function removeOrderState_() {
  return reducer(init(), removeOrderState())
}

describe('order.slice draft', () => {
  it('parent: tambah baru lalu update menjumlah anak', () => {
    let s = reducer(init(), setDraft({ type: 'regular', item: it1, programId: 1 }))
    expect(s.drafts.regular[1]).toEqual([it1])
    s = reducer(s, setDraft({ type: 'regular', item: { ...it1, ordered_qty: 9 }, programId: 1 }))
    expect(s.drafts.regular[1][0].ordered_qty).toBe(9)
  })

  it('child: membuat parent, menambah, mengganti, dan menjumlah', () => {
    const parent: any = { id: 1, name: 'P' }
    let s = reducer(init(), setDraft({ type: 'regular', item: child, programId: 1, parentMaterial: parent }))
    expect(s.drafts.regular[1][0].material_hierarchy).toEqual([child])
    expect(s.drafts.regular[1][0].ordered_qty).toBe(3)
    s = reducer(s, setDraft({ type: 'regular', item: child2, programId: 1, parentMaterial: parent }))
    expect(s.drafts.regular[1][0].ordered_qty).toBe(7)
    s = reducer(s, setDraft({ type: 'regular', item: { ...child, ordered_qty: 1 }, programId: 1, parentMaterial: parent }))
    expect(s.drafts.regular[1][0].ordered_qty).toBe(5)
    // parent diperbarui: qty anak mengalahkan qty item
    s = reducer(s, setDraft({ type: 'regular', item: { material_id: 1, ordered_qty: 100 } as any, programId: 1 }))
    expect(s.drafts.regular[1][0].ordered_qty).toBe(5)
    // parent tanpa anak memakai qty item
    s = reducer(s, setDraft({ type: 'distribution', item: it1 }))
    s = reducer(s, setDraft({ type: 'distribution', item: { ...it1, ordered_qty: 4 } }))
    expect(s.drafts.distribution[0][0].ordered_qty).toBe(4)
  })

  it('child pada parent tanpa hierarchy dan nama kosong', () => {
    let s = reducer(init(), setDraft({ type: 'regular', item: { material_id: 1, ordered_qty: 1 } as any, programId: 2 }))
    s.drafts.regular[2][0] = { material_id: 1, ordered_qty: 1 } as any
    s = reducer(s, setDraft({ type: 'regular', item: { material_id: 5 } as any, programId: 2, parentMaterial: { id: 1 } as any }))
    expect(s.drafts.regular[2][0].material_hierarchy).toHaveLength(1)
    s = reducer(s, setDraft({ type: 'regular', item: { material_id: 6 } as any, programId: 3, parentMaterial: { id: 77 } as any }))
    expect(s.drafts.regular[3][0].material_name).toBe('')
    expect(s.drafts.regular[3][0].ordered_qty).toBe(0)
  })

  it('resetDraft, removeAllChildDraft', () => {
    let s = reducer(init(), setDraft({ type: 'regular', item: it1, programId: 1 }))
    s = reducer(s, removeAllChildDraft({ type: 'regular', parentMaterialId: 1, programId: 1 }))
    expect(s.drafts.regular[1]).toEqual([])
    s = reducer(s, removeAllChildDraft({ type: 'return', parentMaterialId: 1, programId: 4 }))
    expect(s.drafts.return[4]).toEqual([])
    s = reducer(s, resetDraft({ type: 'regular', programId: 1 }))
    expect(s.drafts.regular[1]).toBeUndefined()
    expect(removeLocalData).toHaveBeenCalledWith('regularDraft-1')
    jest.clearAllMocks()
    s = reducer(s, resetDraft({ type: 'regular' }))
    expect(removeLocalData).not.toHaveBeenCalled()
    s = reducer(removeOrderState_(), resetDraft({ type: 'regular', programId: 1 }))
    expect(s.drafts.regular[1]).toBeUndefined()
  })
})

describe('order.slice detail/itemDraft/reset', () => {
  it('detail order dan item draft', () => {
    let s = reducer(init(), setDetailOrder({ id: 3 } as any))
    expect(s.detailOrder).toEqual({ id: 3 })
    s = reducer(s, setOrderItemDraft(it1))
    s = reducer(s, setOrderItemDraft({ ...it1, ordered_qty: 8 }))
    s = reducer(s, setOrderItemDraft(child))
    expect(s.orderItemDraft).toHaveLength(2)
    expect(s.orderItemDraft[0].ordered_qty).toBe(8)
    s = reducer(s, resetOrderItemDraft())
    expect(s.orderItemDraft).toEqual([])
  })

  it('resetOrderState & removeOrderState', () => {
    let s = reducer(init(), setActiveTab(3))
    s = reducer(s, resetOrderState({ programId: 2 }))
    expect(s.activeTab).toBe(0)
    expect(removeLocalData).toHaveBeenCalledWith('regularActivity-2')
    expect(removeLocalData).toHaveBeenCalledWith('relocationDraft-2')
    s = reducer(s, removeOrderState())
    expect(s.activities).toEqual({})
  })

  it('selector', () => {
    const state: any = { order: init() }
    expect(getOrderFilters(state)).toBe(state.order.filter)
    expect(getActiveTab(state)).toBe(0)
    expect(getOrderItemDraft(state)).toEqual([])
    expect(getOrderActivities(state)).toBe(state.order.activities)
    expect(getOrderEntities(state)).toBe(state.order.entities)
    expect(getOrderDrafts(state)).toBe(state.order.drafts)
  })
})
