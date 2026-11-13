import * as d from '../features/disposal.slice'

const r = d.disposalReducer
const init = () => r(undefined, { type: 'x' })

describe('disposal.slice', () => {
  const material: any = {
    material_id: 5,
    material: { id: 5, name: 'M' },
    details: [
      {
        stocks: [
          { id: 1, activity: { id: 1 }, batch: { code: 'A' } },
          { id: 2, activity: { id: 1 }, batch: { code: 'B' } },
        ],
      },
    ],
  }

  it('setter sederhana', () => {
    let s = r(init(), d.setActivity({ id: 1 } as any))
    s = r(s, d.setReceiver({ id: 2 } as any))
    s = r(s, d.setDisposalMethod({ id: 3 } as any))
    expect(s.activity).toEqual({ id: 1 })
    expect(s.receiver).toEqual({ id: 2 })
    expect(s.method).toEqual({ id: 3 })
    s = r(s, d.setReceiver(undefined))
    expect(s.receiver).toBeUndefined()
  })

  it('setMaterial mengisi detail, dan memulihkan batch dari disposal tersimpan', () => {
    let s = r(init(), d.setMaterial(material))
    expect(s.materialDetail).toBe(s.material.details[0])
    expect(s.batchDisposalData).toEqual({})
    s = r(
      s,
      d.setBatchDisposal({
        stockId: 1,
        disposalData: { discard: 2, received: 1 } as any,
      })
    )
    s = r(s, d.saveMaterialDisposal({ selectedActivityStocks: [1] }))
    expect(s.disposal[5].disposal).toHaveLength(1)
    expect(s.disposal[5].disposal[0]).toMatchObject({
      stock_id: 1,
      discard: 2,
      received: 1,
    })
    expect(s.batchDisposalData).toEqual({})
    s = r(s, d.setMaterial(material))
    expect(s.batchDisposalData[1]).toEqual({ discard: 2, received: 1 })
    s = r(s, d.clearBatchData())
    expect(s.batchDisposalData).toEqual({})
    s = r(s, d.clearDisposal())
    expect(s.disposal).toEqual({})
  })

  it('saveMaterialDisposal tanpa detail menghasilkan list kosong', () => {
    let s = r(init(), d.setMaterial({ ...material, details: [{}] }))
    s = r(s, d.saveMaterialDisposal({ selectedActivityStocks: [] }))
    expect(s.disposal[5].disposal).toEqual([])
  })

  it('selected stock + selector', () => {
    let s = r(init(), d.setSelectedDisposalStock({ id: 9 } as any))
    expect(d.getSelectedDisposalStock({ disposal: s })).toEqual({ id: 9 })
    s = r(s, d.clearSelectedDisposalStock())
    expect(s.selectedDisposalStock).toEqual({})
  })
})
