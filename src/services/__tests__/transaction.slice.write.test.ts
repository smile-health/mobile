jest.mock('@/storage', () => ({
  saveLocalData: jest.fn(),
  removeLocalData: jest.fn(),
}))
import { removeLocalData, saveLocalData } from '@/storage'
import {
  transactionReducer as reducer,
  setProgram,
  setCustomer,
  setActivity,
  setMaterial,
  setMaterials,
  setExistingTrx,
  setTransactionReason,
  setTransaction,
  deleteTransaction,
  clearTrxState,
  clearTransaction,
  getReviewTrxItems,
} from '../features/transaction.slice'

const init = () => reducer(undefined, { type: 'init' })
const t1: any = {
  stock_id: 1,
  material_id: 10,
  change_qty: 2,
  batch: { id: 1, code: 'B' },
}
const t2: any = { stock_id: 2, material_id: 20, change_qty: 3 }
beforeEach(() => jest.clearAllMocks())

describe('transaction.slice reducers', () => {
  it('setter sederhana', () => {
    let s = reducer(init(), setProgram({ id: 1 } as any))
    s = reducer(s, setCustomer({ id: 2 } as any))
    s = reducer(s, setActivity({ id: 3 } as any))
    s = reducer(s, setMaterial({ material: { id: 4 } } as any))
    s = reducer(s, setMaterials([{ id: 5 }] as any))
    expect(s.program).toEqual({ id: 1 })
    expect(s.customer).toEqual({ id: 2 })
    expect(s.activity).toEqual({ id: 3 })
    expect(s.trxMaterial).toEqual({ material: { id: 4 } })
    expect(s.trxMaterials).toEqual([{ id: 5 }])
  })

  it('setExistingTrx memuat draft', () => {
    const s = reducer(
      init(),
      setExistingTrx({
        transactionTypeId: 7,
        activity: { id: 1 },
        customer: { id: 2 },
        program: { id: 3 },
        transactions: [t1],
      } as any)
    )
    expect(s.draftTrxTypeId).toBe(7)
    expect(s.transactions).toEqual([t1])
  })

  it('setTransactionReason mengganti hanya stock yang cocok', () => {
    let s = reducer(init(), setExistingTrx({ transactions: [t1, t2] } as any))
    s = reducer(
      s,
      setTransactionReason({
        trx: t1,
        trxReason: { value: 9, label: 'r' } as any,
      })
    )
    expect(s.transactions[0].transaction_reason_id).toBe(9)
    expect(s.transactions[1].transaction_reason_id).toBeUndefined()
    const same = reducer(
      s,
      setTransactionReason({
        trx: { stock_id: 99 } as any,
        trxReason: { value: 1 } as any,
      })
    )
    expect(same.transactions).toEqual(s.transactions)
  })

  it('setTransaction menyimpan draft, menghapus kalau kosong', () => {
    let s = reducer(init(), setMaterial({ material: { id: 10 } } as any))
    s = reducer(s, setExistingTrx({ transactions: [t1, t2] } as any))
    s = reducer(s, setMaterial({ material: { id: 10 } } as any))
    s = reducer(
      s,
      setTransaction({
        trxTypeId: 5,
        transactions: [{ ...t1, change_qty: 8 }],
        programId: 1,
      })
    )
    expect(s.transactions).toHaveLength(2)
    expect(s.draftTrxTypeId).toBe(5)
    expect(saveLocalData).toHaveBeenCalledWith(
      'trxDraft-1',
      expect.objectContaining({ transactionTypeId: 5 })
    )
    s = reducer(init(), setMaterial({ material: { id: 1 } } as any))
    s = reducer(
      s,
      setTransaction({ trxTypeId: 5, transactions: [], programId: 2 })
    )
    expect(s.draftTrxTypeId).toBeUndefined()
    expect(removeLocalData).toHaveBeenCalledWith('trxDraft-2')
  })

  it('deleteTransaction, clearTransaction, clearTrxState', () => {
    let s = reducer(init(), setExistingTrx({ transactions: [t1, t2] } as any))
    s = reducer(
      s,
      deleteTransaction({
        transaction: { ...t1, transactionTypeId: 3 },
        programId: 1,
      })
    )
    expect(s.transactions).toEqual([t2])
    expect(saveLocalData).toHaveBeenCalledWith(
      'trxDraft-1',
      expect.objectContaining({ transactionTypeId: 3 })
    )
    s = reducer(s, clearTransaction({ programId: 1 }))
    expect(s.transactions).toEqual([])
    expect(removeLocalData).toHaveBeenCalledWith('trxDraft-1')
    s = reducer(s, setCustomer({ id: 1 } as any))
    s = reducer(s, clearTrxState())
    expect(s.customer).toBeUndefined()
  })
})

describe('getReviewTrxItems', () => {
  const root = (transactions: any[]): any => ({
    transactionTypes: { transactionTypes: [{ id: 1, title: 'Add' }] },
    transaction: {
      transactions,
      customer: { id: 1 },
      activity: { name: 'Act' },
    },
    materials: {
      materials: [
        { id: 10, name: 'M10', material_level_id: 3 },
        {
          id: 1,
          material_level_id: 2,
          material_hierarchy: [{ id: 20, name: 'M20' }],
        },
      ],
    },
    vaccineSequence: {
      rabiesSequences: [
        {
          id: 1,
          title: 'VT',
          methods: [
            { id: 2, title: 'VM', sequences: [{ id: 3, title: 'Seq' }] },
          ],
        },
      ],
    },
  })

  it('kosong tanpa trxTypeId', () => {
    expect(getReviewTrxItems(root([t1]))).toEqual([])
  })

  it('mengelompokkan per material dan memetakan nama', () => {
    const trx = [
      {
        ...t1,
        vaccine_type_id: 1,
        vaccine_method_id: 2,
        patients: [{ vaccine_sequence: 3 }],
      },
      { ...t1, stock_id: 5, change_qty: undefined },
      t2,
    ]
    const res: any = getReviewTrxItems(root(trx), 1)
    expect(res).toHaveLength(2)
    const first = res.find((r: any) => r.materialName === 'M10')
    expect(first.totalQty).toBe(2)
    expect(first.transactionName).toBe('Add')
    expect(first.activityName).toBe('Act')
    expect(first.stocks[0].vaccineTypeName).toBe('VT')
    expect(first.stocks[0].patients[0].vaccineSequenceName).toBe('Seq')
    expect(res.find((r: any) => r.materialName === 'M20').totalQty).toBe(3)
  })

  it('nilai default saat data tidak ditemukan', () => {
    const state = root([{ stock_id: 9, material_id: 999 }])
    state.transaction.activity = {}
    const res: any = getReviewTrxItems(state, 77)
    expect(res[0].materialName).toBe('')
    expect(res[0].activityName).toBe('')
    expect(res[0].transactionName).toBe('')
  })
})
