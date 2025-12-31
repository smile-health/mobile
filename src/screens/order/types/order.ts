import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { TFunction } from 'i18next'
import { Control, FormState, UseFormWatch } from 'react-hook-form'
import { ReasonOption } from '@/models/Common'
import { MaterialCompanion } from '@/models/order/AddOrderItem'
import { OrderItemData } from '@/models/order/OrderDetailSection'
import { TicketBatch } from '@/models/order/Ticket'
import { AppStackParamList } from '@/navigators'
import { ORDER_STATUS } from '@/utils/Constants'

export type ORDER_STATUS = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS]

export interface OrderFooterActionProps {
  status?: ORDER_STATUS
  isVendor: boolean
  isCustomer: boolean
  orderId?: number
  activityName?: string
  t: TFunction
  orderType?: number
  onValidate: () => void
  onEdit: () => void
  onCancel: () => void
  onShip: () => void
  onConfirm: () => void
  onReceive: () => void
  onAllocate: () => void
  preview?: boolean
  isRequestOrderConfirmRestricted?: boolean
}

export interface OrderTypeResult {
  isVendor: boolean
  isCustomer: boolean
}

export interface OrderStatusResult {
  statusName: string
  statusStyle: {
    background: string
    text: string
  }
}

export interface OrderNavigationHandlers {
  handleCancelOrder: () => void
  handleValidateOrder: () => void
  handleEditOrder: () => void
  handleAddItem: () => void
  handleOrderDetailItem: (data: OrderItemData) => void
  handleShipOrder: () => void
  handleConfirmOrder: () => void
  handleReceiveOrder: () => void
  handleAllocateOrder: () => void
}

export interface UseOrderDetailProps {
  id?: number
  t: TFunction
  navigation: NativeStackNavigationProp<AppStackParamList, 'OrderDetail'>
}

export interface OrderValidationParams {
  quantity: string
  recommendation: number
  reason: string
  t: TFunction
}

export interface Manufacture {
  id: number
  name: string
  address: string | null
  description: string | null
}

export interface Batch {
  id: number
  code: string
  expired_date: string
  production_date: string
  manufacture_id: number
  manufacture: Manufacture
}

export interface StockData {
  activity_id: number
  activity_name?: string
  allocated: number
  available: number
  batch_id: number
  batch: Batch
  budget_source: Record<string, unknown>
  budget_source_id: number | null
  created_at: string
  created_by: string
  in_transit: number
  material_id?: number
  open_vial: number
  price: number
  qty: number
  stock_id: number
  total_price: number
  updated_at: string
  updated_by: string
  year: number | null
  is_temperature_sensitive: number | null
  stock_quality_id?: number
}

export interface OrderMaterialsData {
  data: StockData[]
  title: string
}

export interface QuantityByStockForm {
  quantityByStock: Record<
    string,
    {
      quantity: string | number
      stock_quality_id: number | null
    }
  >
  resultPayload: StockData[]
}

export interface OrderBatchReviewItemData {
  data: StockData[]
  is_managed_in_batch: number
  material_companion: MaterialCompanion[]
  material_id: number
  material_name: string
  ordered_qty: number
  reason_id: string
}

export interface OrderBatchReviewItemProps {
  containerClassName?: string
  item: any
}

export interface RenderBatchItemProps {
  item: StockData
  itemIndex?: number
}

export interface RenderBatchDetailsProps {
  data: StockData[]
}

export interface RenderNonBatchDetailsProps {
  data: StockData[]
}

export interface OrderBatchItemRendererProps {
  stocks: Array<{
    is_temperature_sensitive: number
    id: number | string
    batch?: {
      code: string
      expired_date: string
      manufacture_name: string
    }
    activity_name: string
    activity?: {
      name: string
    }
    allocated_qty: number
  }>
  index: number
  control: Control<any>
  form: {
    order_items?: Array<{
      receives?: Array<{
        received_qty: number
        material_status?: number
      }>
    }>
  }
  setValue: (name: string, value: number) => void
  t: TFunction
  isMaterialSensitive: boolean
  containerClassName?: string
  inputProps?: {
    getValue?: (stock: any, index: number, stockIdx: number) => string | number
    getFieldName?: (index: number, stockIdx: number) => string
    onValueChange?: (value: string, index: number, stockIdx: number) => void
    getErrors?: (value: any, stock: any) => string[]
  }
  childIdx?: number
  isHierarchy?: boolean
  renderAdditionalInfo?: (stock: any) => React.ReactNode
}

export type OrderType = 'regular' | 'distribution' | 'return' | 'relocation'

export interface OrderStock {
  stock_id: string | number
  available: number
  allocated_qty: number
  is_temperature_sensitive: boolean
  unit?: string
  budget_source_id?: number | null
  budget_source?: null
  year?: number | null
  price?: number | null
}

export interface ItemType {
  qty: number
  recommended_stock: number
  ordered_qty: number
  reason_id?: string
  reason?: { id: string }
  material?: {
    name: string
    consumption_unit_per_distribution_unit: number
  }
  stock_vendor?: {
    total_available_qty?: number
    min?: number
    max?: number
  }
  stock_customer?: {
    total_available_qty?: number
    min?: number
    max?: number
  }
  children: {
    id: number
    qty: number
    confirmed_qty: number
    material_name: string
    material: {
      id: number
      name: string
    }
    ordered_qty: number
    reason?: {
      name: string
    }
    stock_vendor: {
      min: number
      max: number
      total_available_qty: number
    }
  }[]
}

export type OrderEditType = 'edit' | 'confirm' | 'validate'
export interface OrderEditItemProps {
  item: ItemType
  index: number
  updateQuantity?: (index: number, qty: number) => void
  updateReason?: (index: number, reason: string) => void
  updateOtherReasonText?: (index: number, otherReasonText: string) => void
  updateChildQuantity: (
    parentIndex: number,
    childId: number,
    value: number | string
  ) => void
  showReasonDropdown?: boolean
  type: OrderEditType
  dataReason?: ReasonOption[]
}

export interface MaterialPickerOption {
  label: string
  value: number
  isBatch?: boolean
}

export interface TicketMaterial {
  id: string | number
  name: string
  is_managed_in_batch: boolean
  batches?: TicketBatch[]
  qty?: number
  updatedAt?: string
}

export interface CreateTicketForm {
  isSubmitted: number
  doNumber: string
  arrivalDate: Date | null
}

export interface ItemStock {
  activities: {
    id: number
    name: string
  }
  total_allocated_qty: number
  qty: number
  material: {
    id: number
    name: string
    is_temperature_sensitive: number
  }
  stocks: {
    id: number
    available_qty: number
    allocated_qty: number
    qty: number
    batch: {
      code: number
      expired_date: string
      production_date: string
      manufacture: {
        name: string
      }
    }
    activity: {
      name: string
    }
  }[]
}
export interface AllocationMaterialHierarchyRendererProps {
  item: ItemStock
  index: number
  isBatch?: boolean
  control: Control<any>
  t: TFunction
  setValue: (name: string, value: string | number | object) => void
  form: FormState<any>
  watch: UseFormWatch<any>
  materialParentId: number
  draftData: any[]
  stockOnHandQty: number
}
