import { ParseKeys } from 'i18next'

export const DISPOSAL_TYPE = {
  SELF: 'self',
  SHIPMENT: 'shipment',
} as const

export type DisposalType = (typeof DISPOSAL_TYPE)[keyof typeof DISPOSAL_TYPE]

export const disposalTypeLabel = {
  [DISPOSAL_TYPE.SELF]: 'disposal.self_disposal_entered',
  [DISPOSAL_TYPE.SHIPMENT]: 'disposal.shipment_disposal_entered',
} as const

export const disposalItemLabel = {
  [DISPOSAL_TYPE.SELF]: {
    qty: 'disposal.self_disposal_qty',
    button: 'disposal.enter_self_disposal_qty',
    stockDiscard: 'disposal.self_disposal_discard_from_internal',
    stockReceived: 'disposal.self_disposal_discard_from_external',
  },
  [DISPOSAL_TYPE.SHIPMENT]: {
    qty: 'disposal.disposal_shipment_qty',
    button: 'disposal.enter_disposal_shipment_qty',
    stockDiscard: 'disposal.shipment_discard_from_internal',
    stockReceived: 'disposal.shipment_discard_from_external',
  },
} as const

export const disposalQtyLabel = 'disposal.total_discard'

export const DISPOSAL_QTY_TYPE = {
  DISCARD: 'discard',
  RECEIVED: 'received',
} as const

export type DisposalQtyType =
  (typeof DISPOSAL_QTY_TYPE)[keyof typeof DISPOSAL_QTY_TYPE]

export const disposalQtyTypeLabel = {
  [DISPOSAL_QTY_TYPE.DISCARD]: 'disposal.discard_from_internal',
  [DISPOSAL_QTY_TYPE.RECEIVED]: 'disposal.discard_from_external',
} as const

export const DISPOSAL_SHIPMENT_METHOD = 1
export const DISPOSAL_SHIPMENT_TYPE = 5

export const DISPOSAL_PURPOSE = {
  SENDER: 'sender',
  RECEIVER: 'receiver',
} as const

export type DisposalPurpose =
  (typeof DISPOSAL_PURPOSE)[keyof typeof DISPOSAL_PURPOSE]

export const disposalPurposeNames: Record<DisposalPurpose, ParseKeys> = {
  [DISPOSAL_PURPOSE.SENDER]: 'disposal.sender',
  [DISPOSAL_PURPOSE.RECEIVER]: 'disposal.receiver',
} as const

export const DISPOSAL_STATUS = {
  ALL: 0,
  SHIPPED: 4,
  RECEIVED: 5,
  CANCELLED: 6,
} as const

export const disposalStatusNames = {
  [DISPOSAL_STATUS.ALL]: 'disposal.status.all',
  [DISPOSAL_STATUS.SHIPPED]: 'disposal.status.shipped',
  [DISPOSAL_STATUS.RECEIVED]: 'disposal.status.received',
  [DISPOSAL_STATUS.CANCELLED]: 'disposal.status.cancelled',
} as const

export const disposalStatusTabs = Object.entries(disposalStatusNames).map(
  ([value, label]) => ({ label, value: Number(value) })
)

export const disposalStatusDate = {
  [DISPOSAL_STATUS.SHIPPED]: 'disposal.date_status.shipped',
  [DISPOSAL_STATUS.RECEIVED]: 'disposal.date_status.received',
  [DISPOSAL_STATUS.CANCELLED]: 'disposal.date_status.cancelled',
} as const

export const disposalStatusDateKey = {
  [DISPOSAL_STATUS.SHIPPED]: 'shipped_at',
  [DISPOSAL_STATUS.RECEIVED]: 'fulfilled_at',
  [DISPOSAL_STATUS.CANCELLED]: 'cancelled_at',
} as const

export const disposalStatusDialogConfig = {
  [DISPOSAL_STATUS.RECEIVED]: {
    title: 'disposal.dialog.receive_title',
    message1: 'disposal.dialog.receive_message1',
    message2: 'disposal.dialog.receive_message2',
    confirmTestID: 'btn-confirm-submit-receive-disposal-shipment',
    cancelTestID: 'btn-cancel-submit-receive-disposal-shipment',
  },
  [DISPOSAL_STATUS.CANCELLED]: {
    title: 'disposal.dialog.cancel_title',
    message1: 'disposal.dialog.cancel_message1',
    message2: 'disposal.dialog.cancel_message2',
    confirmTestID: 'btn-confirm-submit-cancel-disposal-shipment',
    cancelTestID: 'btn-cancel-submit-cancel-disposal-shipment',
  },
} as const
