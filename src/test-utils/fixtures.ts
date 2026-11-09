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
