import { ParseKeys } from 'i18next'
import { IOptions } from '@/models/Common'
import { TicketFilterFormValues } from '@/models/order/EventReport'
import {
  OrderDraftStorageKey,
  RelocationDraftStorageKey,
  TrxDraftStorageKey,
} from '@/storage/types'

export const PAGE_SIZE = 10

export const PAGE = 1
export const PAGINATE = 100

export const MAX_INPUT_LENGTH = 255
export const MAX_PRICE_LENGTH = 15

export const LangCode = {
  id: 'id',
  en: 'en',
}

export const deviceTypes = {
  1: 'Web',
  2: 'Mobile',
}

export const genderNames: Record<number, ParseKeys> = {
  1: 'gender.male',
  2: 'gender.female',
}

export const orderTypeListNames: Record<number, ParseKeys> = {
  1: 'order.type.request',
  2: 'order.type.distribution',
  3: 'order.type.return',
  4: 'order.type.central_distribution',
  7: 'order.type.relocation',
}

export const ORDER_INTEGRATION = {
  SIHA: 'SIHA',
  SITB: 'SITB',
  DIN: 'DIN',
}

export const ORDER_EDIT_TYPE = {
  EDIT: 'edit',
  CONFIRM: 'confirm',
  VALIDATE: 'validate',
}

export const orderIntegrationListNames: Record<string, string> = {
  siha: ORDER_INTEGRATION.SIHA,
  sitb: ORDER_INTEGRATION.SITB,
  din: ORDER_INTEGRATION.DIN,
}

export const ENTITY_TYPE = {
  PROVINCE: 1,
  CITY: 2,
  FASKES: 3,
  PKC: 4,
}

export const entityTypeNames = {
  [ENTITY_TYPE.PROVINCE]: 'Provinsi',
  [ENTITY_TYPE.CITY]: 'Kota',
  [ENTITY_TYPE.FASKES]: 'Faskes',
  [ENTITY_TYPE.PKC]: 'PKC',
}

export const COMMON_KEYS = {
  TRANSACTION_ACTIVITY_SELECT: 'TransactionActivitySelect',
  ACTIVITY_LIST: 'CustomerSelect',
  VENDOR_SELECT: 'VendorSelect',
  CUSTOMER_SELECT: 'CustomerSelect',
} as const

export const COMMON_ICONS = {
  LIST_DISPOSAL: 'IcListDisposal',
  SELF_DISPOSAL: 'IcSelfDisposal',
  ASSETS: 'IcAssets',
  STOCK_AMOUNT: 'IcStockAmount',
  VIEW_STOCK: 'IcViewStock',
  TRANSACTION: 'IcViewTransaction',
} as const

export const MENU_KEYS = {
  INVENTORY: {
    ROOT: 'inventory',
    ADD_STOCK: COMMON_KEYS.TRANSACTION_ACTIVITY_SELECT,
    REDUCE_STOCK: COMMON_KEYS.TRANSACTION_ACTIVITY_SELECT,
    VIEW_STOCK: 'StockActivitySelect',
    STOCK_TAKING: 'StockTakingMaterial',
    RECONCILIATION: 'ReconciliationActivity',
    ISSUES: COMMON_KEYS.TRANSACTION_ACTIVITY_SELECT,
    CONSUMPTION: COMMON_KEYS.TRANSACTION_ACTIVITY_SELECT,
    RETURN_ISSUE: COMMON_KEYS.TRANSACTION_ACTIVITY_SELECT,
    DISCARDS: COMMON_KEYS.TRANSACTION_ACTIVITY_SELECT,
    CANCEL_DISCARDS: COMMON_KEYS.TRANSACTION_ACTIVITY_SELECT,
    TRANSFER_STOCK: 'TransferStockProgram',
    VIEW_TRANSACTIONS: 'ViewTransaction',
  },
  ORDER: {
    ROOT: 'order',
    ADD_ORDER: 'RegularActivitySelect',
    LIST_ORDER: 'ViewOrder',
    MAKE_DISTRIBUTION: 'DistributionActivitySelect',
    MAKE_RETURN: 'ReturnActivitySelect',
    MAKE_RELOCATION: 'RelocationActivitySelect',
    LIST_TICKETS: 'ViewListTicket',
    TICKETING_SYSTEM: 'CreateTicket',
  },
  DISPOSAL: {
    ROOT: 'disposal',
    VIEW_DISPOSAL: 'DisposalStockActivitySelect',
    CREATE_DISPOSAL: 'ShipmentDisposalActivity',
    LIST_DISPOSAL: 'DisposalShipmentList',
    LIST_SELF_DISPOSAL: 'ViewSelfDisposalList',
    CREATE_SELF_DISPOSAL: 'SelfDisposalActivity',
  },
  ASSETS: {
    ROOT: 'assets',
    VIEW_ASSET_INVENTORY: 'ViewAssetInventory',
    ADD_ASSET_INVENTORY: 'AddAssetInventory',
  },
  CUSTOMER_VENDOR: {
    ROOT: 'customer_vendor',
    VENDOR: 'VendorList',
    CONSUMPTION_CUSTOMER: 'ConsumptionCustomerList',
    DISTRIBUTION_CUSTOMER: 'DistributionCustomerList',
  },
} as const

export const MENU_ICON_NAMES = {
  INVENTORY: {
    ADD_STOCK: COMMON_ICONS.STOCK_AMOUNT,
    REDUCE_STOCK: COMMON_ICONS.STOCK_AMOUNT,
    VIEW_STOCK: COMMON_ICONS.VIEW_STOCK,
    STOCK_TAKING: COMMON_ICONS.STOCK_AMOUNT,
    RECONCILIATION: COMMON_ICONS.STOCK_AMOUNT,
    ISSUES: 'IcEnterSpending',
    CONSUMPTION: 'IcEnterSpending',
    RETURN_ISSUE: 'IcReturnFaskes',
    DISCARDS: 'IcDisposal',
    CANCEL_DISCARDS: 'IcDisposal',
    TRANSFER_STOCK: 'IcDisposal',
    VIEW_TRANSACTIONS: COMMON_ICONS.TRANSACTION,
  },
  ORDER: {
    LIST_ORDER: COMMON_ICONS.LIST_DISPOSAL,
    ADD_ORDER: COMMON_ICONS.LIST_DISPOSAL,
    MAKE_DISTRIBUTION: COMMON_ICONS.LIST_DISPOSAL,
    MAKE_RETURN: COMMON_ICONS.LIST_DISPOSAL,
    MAKE_RELOCATION: COMMON_ICONS.LIST_DISPOSAL,
    LIST_TICKETS: COMMON_ICONS.SELF_DISPOSAL,
    TICKETING_SYSTEM: COMMON_ICONS.SELF_DISPOSAL,
  },
  DISPOSAL: {
    VIEW_DISPOSAL: COMMON_ICONS.TRANSACTION,
    LIST_DISPOSAL: COMMON_ICONS.LIST_DISPOSAL,
    CREATE_DISPOSAL: COMMON_ICONS.STOCK_AMOUNT,
    LIST_SELF_DISPOSAL: COMMON_ICONS.SELF_DISPOSAL,
    CREATE_SELF_DISPOSAL: COMMON_ICONS.STOCK_AMOUNT,
  },
  ASSETS: {
    VIEW_ASSETS: COMMON_ICONS.ASSETS,
    VIEW_OPNAME_ASSETS: COMMON_ICONS.ASSETS,
    CAPACITY: COMMON_ICONS.ASSETS,
  },
  CUSTOMER_VENDOR: {
    ENTITY: 'IcEntityDetail',
    CUSTOMER: 'IcCustomer',
    VENDOR: 'IcVendor',
  },
} as const

export const MENU_NAMES = {
  INVENTORY: {
    ROOT: 'home.menu.inventory',
    ADD_STOCK: 'home.menu.add_stock',
    REDUCE_STOCK: 'home.menu.reduce_stock',
    VIEW_STOCK: 'home.menu.view_stock',
    STOCK_TAKING: 'home.menu.stock_taking',
    RECONCILIATION: 'home.menu.reconciliation',
    ISSUES: 'home.menu.issues',
    CONSUMPTION: 'home.menu.consumption',
    RETURN_ISSUE: 'home.menu.return_issues',
    DISCARDS: 'home.menu.discards',
    CANCEL_DISCARDS: 'home.menu.cancel_discards',
    TRANSFER_STOCK: 'home.menu.transfer_stock',
    VIEW_TRANSACTIONS: 'home.menu.view_transactions',
  },
  ORDER: {
    ROOT: 'home.menu.order',
    LIST_ORDER: 'home.menu.list_order',
    ADD_ORDER: 'home.menu.add_order',
    MAKE_DISTRIBUTION: 'home.menu.make_distribution',
    MAKE_RETURN: 'home.menu.make_return',
    MAKE_RELOCATION: 'home.menu.make_relocation',
    LIST_TICKETS: 'home.menu.list_tickets',
    TICKETING_SYSTEM: 'home.menu.ticketing_system',
  },
  DISPOSAL: {
    ROOT: 'home.menu.disposal',
    VIEW_DISPOSAL: 'home.menu.view_disposal',
    LIST_DISPOSAL: 'home.menu.list_disposal',
    CREATE_DISPOSAL: 'home.menu.create_disposal',
    LIST_SELF_DISPOSAL: 'home.menu.list_self_disposal',
    CREATE_SELF_DISPOSAL: 'home.menu.create_self_disposal',
  },
  ASSETS: {
    ROOT: 'home.menu.assets',
    VIEW_ASSET_INVENTORY: 'home.menu.view_asset_inventory',
    ADD_ASSET_INVENTORY: 'home.menu.add_asset_inventory',
  },
  CUSTOMER_VENDOR: {
    ROOT: 'home.menu.customer_vendor',
    CONSUMPTION_CUSTOMER: 'home.menu.consumption_customer',
    DISTRIBUTION_CUSTOMER: 'home.menu.distribution_customer',
    VENDOR: 'home.menu.vendor',
  },
} as const

export const ROLES = {
  MANAGER: 3,
  OPERATOR: 4,
}

export const orderPurposeNames: Record<string, ParseKeys> = {
  purchase: 'order.purpose.purchase',
  sales: 'order.purpose.sales',
}

export const ORDER_STATUS = {
  ALL: 0,
  DRAFT: 8,
  PENDING: 1,
  CONFIRMED: 2,
  ALLOCATED: 3,
  SHIPPED: 4,
  FULFILLED: 5,
  CANCELLED: 6,
}

export const TICKET_STATUS = {
  PENDING: 1,
  COMPLETED: 9,
  CANCELED: 10,
  MANUAL_INPUT: 5,
}

export const ORDER_REASON_TYPE = {
  REQUEST: 'request',
  RELOCATION: 'relocation',
  SIHA: 'siha',
}

export const orderStatusNames: Record<number, ParseKeys> = {
  [ORDER_STATUS.PENDING]: 'order.status.pending',
  [ORDER_STATUS.CONFIRMED]: 'order.status.confirmed',
  [ORDER_STATUS.ALLOCATED]: 'order.status.allocated',
  [ORDER_STATUS.SHIPPED]: 'order.status.shipped',
  [ORDER_STATUS.FULFILLED]: 'order.status.fulfilled',
  [ORDER_STATUS.CANCELLED]: 'order.status.cancelled',
}

export const orderStatusLabel: Record<number, ParseKeys> = {
  [ORDER_STATUS.PENDING]: 'label.ordered_qty',
  [ORDER_STATUS.CONFIRMED]: 'label.confirmed_qty',
  [ORDER_STATUS.ALLOCATED]: 'label.allocated_qty',
  [ORDER_STATUS.SHIPPED]: 'label.shipped_qty',
  [ORDER_STATUS.FULFILLED]: 'label.fulfilled_qty',
  [ORDER_STATUS.CANCELLED]: 'label.cancelled_qty',
}

export const ORDER_TYPE = {
  REQUEST: 1,
  DISTRIBUTION: 2,
  RETURN: 3,
  CENTRAL_DISTRIBUTION: 4,
  RELOCATION: 7,
} as const

export const ORDER_KEY = {
  REGULAR: 'regular',
  DISTRIBUTION: 'distribution',
  RETURN: 'return',
  RELOCATION: 'relocation',
} as const

export const orderTypeNames: Record<number, ParseKeys> = {
  [ORDER_TYPE.REQUEST]: 'order.type.request',
  [ORDER_TYPE.DISTRIBUTION]: 'order.type.distribution',
  [ORDER_TYPE.RETURN]: 'order.type.return',
  [ORDER_TYPE.CENTRAL_DISTRIBUTION]: 'order.type.central_distribution',
  [ORDER_TYPE.RELOCATION]: 'order.type.relocation',
}

export const orderServiceNames: Record<number, ParseKeys> = {
  1: 'order.service.regular',
  2: 'order.service.provincial_buffer',
  3: 'order.service.national_buffer',
}

export const TRANSACTION_TYPE = {
  VIEW_STOCK: 1,
  ISSUES: 2,
  RECEIPTS: 3,
  DISCARDS: 4,
  RETURN: 5,
  RECEIPTS_OPEN_VIAL: 6,
  ADD_STOCK: 7,
  REDUCE_STOCK: 8,
  CANCEL_DISCARDS: 9,
  CONSUMPTION: 10,
  TRANSFER_STOCK: 11,
  STOCK_TAKING: 12,
  RECONCILIATION: 13,
}

export const ADD_REMOVE_STOCK_TYPES = new Set([
  TRANSACTION_TYPE.ADD_STOCK,
  TRANSACTION_TYPE.REDUCE_STOCK,
])

export const materialStatuses = [
  { value: 1, label: 'VVM A' },
  { value: 2, label: 'VVM B' },
  { value: 3, label: 'VVM C' },
  { value: 4, label: 'VVM D' },
]

export const EXPIRATION_STATUS = {
  VALID: 'valid',
  NEAR_ED: 'near_ed',
  EXPIRED: 'expired',
}

export const DATA_TYPES = {
  CVA: 'cva',
  MATERIAL: 'material',
}

export const BATCH_TYPE = {
  ACTIVE: 'activeBatch',
  EXPIRED: 'expiredBatch',
} as const

export const batchTypeSection = {
  [BATCH_TYPE.ACTIVE]: 'section.material_batch',
  [BATCH_TYPE.EXPIRED]: 'section.expired_material_batch',
}

export const MATERIAL_LIST_TYPE = {
  VIEW_STOCK: 'viewStock',
  VIEW_DISPOSAL_TRADEMARK_STOCK: 'viewTrademarkDisposalStock',
  VIEW_DISPOSAL_SUBSTANCE_STOCK: 'viewSubstanceDisposalStock',
  NORMAL: 'normal',
} as const

export const MATERIAL_LEVEL_TYPE = {
  KFA_92: 2,
  KFA_93: 3,
}

export const TYPE_ORDER = 3
export const TYPE_VIEW_ORDER = 'view_order'
export const TYPE_EXTERMINATION_STOCK = 31
export const TYPE_CREATE_EXTERMINATION = 32
export const TYPE_EXTERMINATION_ORDER = 33
export const TYPE_SELF_EXTERMINATION_1 = 34
export const TYPE_SELF_EXTERMINATION_2 = 35

export const ADD_ORDER_ITEM = 4

export const NOTIFICATION_CHANNEL_ID = 'notification_channel_id'
export const DATE_FORMAT = 'DD/MM/YYYY'
export const SHORT_DATE_FORMAT = 'DD MMM YYYY'
export const DATE_TIME_FORMAT = 'DD/MM/YYYY HH:mm'
export const LONG_DATE_FORMAT = 'DD MMMM YYYY'
export const LONG_DATE_TIME_FORMAT = 'DD MMMM YYYY HH:mm'
export const SHORT_DATE_TIME_FORMAT = 'DD MMM YYYY HH:mm'
export const DATE_FILTER_FORMAT = 'YYYY-MM-DD'
export const TIME_FORMAT = 'HH:mm'
export const DATE_CREATED_FORMAT = 'YYYY-MM-DDTHH:mm:ss.SSS[Z]'
export const CALENDAR_DATE_FORMAT = 'ddd, DD MMM YYYY'

export const COVID_ACTIVITY_ID = 6

export const listYear = () => {
  const year_start = 2020
  const year_end = 2030
  const years: IOptions[] = []

  for (let yearIndex = year_start; yearIndex <= year_end; yearIndex++) {
    years.push({
      label: String(yearIndex),
      value: yearIndex,
    })
  }

  return years
}

/*
  Storage Key
*/

export const STORAGE_KEY = {
  USER_LOGIN: 'user_login',
  REFRESH_TOKEN: 'refresh_token',
  ACCESS_TOKEN: 'access_token',
  SETTINGS: 'settings',
} as const

export const PUSH_NOTIFICATION_STORAGE_KEYS = {
  NOTIFICATIONS: '@push_notifications',
  SETTINGS: '@push_notification_settings',
  BADGE_COUNT: '@notification_badge_count',
  OFFLINE_QUEUE: '@offline_notification_queue',
  LAST_SYNC: '@last_notification_sync',
  FCM_TOKEN: '@fcm_token',
} as const

export const getTrxDraftStorageKey = (programId: number): TrxDraftStorageKey =>
  `trxDraft-${programId}`

export const getOrderDraftStorageKey = (
  programId: number
): OrderDraftStorageKey => `orderDraft-${programId}`

export const getRelocationDraftStorageKey = (
  programId: number
): RelocationDraftStorageKey => `relocationDraft-${programId}`

/**
 * Regex
 */

export const PHONE_NUMBER_REGEX = /^(08\d{8,13}|628\d{7,12})$/
export const EMAIL_REGEX = /^[\w%+.-]+@[\d.A-Za-z-]+\.[A-Za-z]{2,}$/
export const PASSWORD_REGEX =
  /^(?=[^A-Z]*[A-Z])(?=[^a-z]*[a-z])(?=\D*\d)(?=[^!#$%&'()*+,.:;<=>?@^|-]*[!#$%&'()*+,.:;<=>?@^|-])\S{8,}$/
export const NUMERIC_REGEX = /\D/g

export const LINK_ELEARNING = 'https://elearning.smile-indonesia.id/'

export const STEPS = {
  FORM: 1,
  MATERIALS: 2,
} as const

export const DETAIL_REASON_OPTIONS = [
  { label: 'Broken seal', value: 'Broken seal' },
  { label: 'Color changed', value: 'Color changed' },
]

export const NAVIGATION_TIMEOUT = 10
export const DELAY_TIMEOUT = 500
export const OTHER_REASON_ID = 9

export const TICKET_FILTER_DEFAULT_VALUES: TicketFilterFormValues = {
  order_id: '',
  do_number: '',
  entity_id: '',
  from_arrived_date: '',
  to_arrived_date: '',
} as const

export const TICKET_FILTER_FORM_KEYS = [
  'order_id',
  'do_number',
  'entity_id',
  'from_arrived_date',
  'to_arrived_date',
] as const

export const MINIMUM_DATE_TICKET = new Date('2020-01-01')
export const MAXIMUM_DATE_TICKET = new Date()

export const WORKING_STATUS = {
  FUNCTION: 1,
  STANDBY: 2,
  REPAIR: 3,
  DAMAGED: 4,
  UNREPAIRABLE: 5,
  DEFROSTING: 6,
  NOT_USED: 7,
  UNSUBCRIBES: 8,
  NEED_REPAIR: 9,
}

export const CONTACTS = [
  {
    type: 'email',
    label: 'help_center.label.email',
    content: 'halo@smile-indonesia.id',
    url: 'mailto:halo@smile-indonesia.id',
    error: 'help_center.error.email',
    icon: 'IcSendMail',
  },
  {
    type: 'phone',
    label: 'help_center.label.phone_number',
    content: '08041 501900',
    url: 'tel:08041501900',
    error: '',
    icon: 'IcPhoneCall',
  },
  {
    type: 'whatsapp',
    label: 'help_center.label.whatsapp',
    content: '+62 812 8893 3314',
    url: 'whatsapp://send?text=&phone=+6281288933314',
    error: 'help_center.error.whatsapp',
    icon: 'IcWhatsapp',
  },
]
