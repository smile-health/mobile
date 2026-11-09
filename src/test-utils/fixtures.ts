export const item: any = {
  id: 1,
  name: 'Item',
  code: 'C1',
  label: 'Label',
  value: 1,
  status: 1,
  qty: 1,
  quantity: 1,
  total_qty: 1,
  created_at: '2025-01-01T00:00:00.000Z',
  updated_at: '2025-01-01T00:00:00.000Z',
  entity: { id: 1, name: 'Entity' },
  material: { id: 1, name: 'Material', code: 'M1' },
  activity: { id: 1, name: 'Activity' },
  stocks: [],
  details: [],
  batch: { code: 'B1', expired_date: '2030-01-01', manufacture: { name: 'M' } },
}

/** Array yang juga punya properti objek: aman untuk `.map()` maupun `.data`. */
export const listFixture = (): any =>
  Object.assign([item], {
    data: [item],
    list: [item],
    items: [item],
    stocks: [item],
    details: [item],
    total: 1,
    page: 1,
    total_item: 1,
    total_page: 1,
  })

export const emptyListFixture = (): any =>
  Object.assign([], {
    data: [],
    list: [],
    items: [],
    stocks: [],
    details: [],
    total: 0,
    page: 1,
  })

export const objectFixture = (): any => ({ ...item, ...listFixture() })

const hash = (s: string) => {
  let h = 7
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

/**
 * Objek "kacau" deterministik: nilai tiap properti dipilih dari kumpulan nilai
 * (asli, 0, 1, null, undefined, '', string, boolean, array, objek anak) berdasar
 * hash(nama properti + seed). Seed berbeda membuka cabang berbeda pada
 * komponen/hook yang membaca properti yang sama.
 */
export const chaosItem = (seed: number, depth = 0): any => {
  const cache: Record<string, any> = {}
  return new Proxy({ ...item } as Record<string, any>, {
    get: (t, k) => {
      if (typeof k === 'symbol') return (t as any)[k]
      if (k === 'toJSON') return undefined
      if (k in cache) return cache[k]
      const base = t[k]
      const child = () => (depth < 2 ? chaosItem(seed + 1, depth + 1) : { id: 1 })
      const opts = [
        base,
        base,
        0,
        1,
        2,
        null,
        undefined,
        '',
        'abc',
        true,
        false,
        [],
        [child()],
        child(),
      ]
      const v = opts[(hash(k) + seed) % opts.length]
      cache[k] = v
      return v
    },
    has: () => true,
  })
}

export const chaosList = (seed: number): any => {
  const it = chaosItem(seed)
  const it2 = chaosItem(seed + 3)
  return Object.assign([it, it2], {
    data: [it, it2],
    list: [it, it2],
    items: [it, it2],
    stocks: [it, it2],
    details: [it, it2],
    total: 2,
    page: 1,
  })
}
