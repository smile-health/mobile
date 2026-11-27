import {
  aggregateDisposalStocks,
  createDisposalShipmentOrderItems,
} from '../helper/DisposalShipmentHelpers'
import {
  ReceiveShipmentFormSchema,
  ReceiveShipmentStockSchema,
  getReceiveDefaultValue,
} from '../schema/ReceiveDisposalShipmentSchema'

const di = (stock: number, reason: number, qty: number) =>
  ({
    disposal_stock_id: stock,
    transaction_reason_id: reason,
    disposal_qty: qty,
  }) as any

describe('DisposalShipmentHelpers', () => {
  it('menggabungkan item discard dan received dengan kunci stok+alasan', () => {
    const result = aggregateDisposalStocks({
      discard: [di(1, 1, 2), di(1, 1, 3), di(1, 2, 1)],
      received: [di(1, 1, 4), di(2, 1, 5)],
    } as any)
    expect(result).toEqual([
      {
        disposal_stock_id: 1,
        transaction_reasons: { id: 1 },
        discard_qty: 5,
        received_qty: 4,
      },
      {
        disposal_stock_id: 1,
        transaction_reasons: { id: 2 },
        discard_qty: 1,
        received_qty: 0,
      },
      {
        disposal_stock_id: 2,
        transaction_reasons: { id: 1 },
        discard_qty: 0,
        received_qty: 5,
      },
    ])
  })

  it('membuat order items dengan batch dan tanpa batch', () => {
    const material = { id: 7, name: 'Vaksin' }
    const base = {
      activity: { id: 3, name: 'Imunisasi' },
      discard: [di(1, 1, 2)],
      received: [di(1, 1, 1)],
    }
    const result = createDisposalShipmentOrderItems({
      7: {
        material,
        disposal: [
          { ...base, stock_id: 11, batch: { id: 5, code: 'B5', extra: 1 } },
          { ...base, stock_id: 12, batch: null },
        ],
      },
    } as any)
    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      material_id: 7,
      material_name: 'Vaksin',
      shipment_qty: 6,
    })
    expect(result[0].stocks[0]).toMatchObject({
      activity_id: 3,
      activity_name: 'Imunisasi',
      batch: { code: 'B5', id: 5 },
      stock_id: 11,
      stock_qty: 3,
    })
    expect(result[0].stocks[1].batch).toBeNull()
  })

  it('mengembalikan array kosong untuk input kosong', () => {
    expect(createDisposalShipmentOrderItems({})).toEqual([])
  })
})

describe('ReceiveDisposalShipmentSchema', () => {
  it('received_qty harus sama dengan shipped_qty', () => {
    const ok = {
      shipped_qty: 3,
      disposal_shipment_stock_id: 1,
      received_qty: 3,
    }
    expect(ReceiveShipmentStockSchema.isValidSync(ok)).toBe(true)
    expect(
      ReceiveShipmentStockSchema.isValidSync({ ...ok, received_qty: 2 })
    ).toBe(false)
    expect(
      ReceiveShipmentStockSchema.isValidSync({ ...ok, received_qty: null })
    ).toBe(false)
  })

  it('memvalidasi form lengkap', () => {
    const form = {
      id: 1,
      items: [
        {
          confirmed_qty: 3,
          disposal_shipment_item_id: 2,
          stocks: [
            { shipped_qty: 3, disposal_shipment_stock_id: 1, received_qty: 3 },
          ],
        },
      ],
    }
    expect(ReceiveShipmentFormSchema.isValidSync(form)).toBe(true)
    expect(
      ReceiveShipmentFormSchema.isValidSync({ ...form, items: undefined })
    ).toBe(false)
  })

  it('getReceiveDefaultValue menjumlahkan qty per stock_id', () => {
    const result = getReceiveDefaultValue({
      id: 9,
      disposal_items: [
        {
          id: 4,
          shipped_qty: 8,
          disposal_shipment_stocks: [
            {
              id: 1,
              stock_id: 10,
              disposal_discard_qty: 2,
              disposal_received_qty: 3,
            },
            { id: 2, stock_id: 10, disposal_discard_qty: 1 },
            { id: 3, stock_id: 11 },
          ],
        },
      ],
    } as any)
    expect(result).toEqual({
      id: 9,
      comment: undefined,
      items: [
        {
          disposal_shipment_item_id: 4,
          confirmed_qty: 8,
          stocks: [
            {
              disposal_shipment_stock_id: 1,
              received_qty: null,
              shipped_qty: 6,
            },
            {
              disposal_shipment_stock_id: 3,
              received_qty: null,
              shipped_qty: 0,
            },
          ],
        },
      ],
    })
  })
})
