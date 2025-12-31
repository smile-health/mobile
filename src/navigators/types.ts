import { RouteProp } from '@react-navigation/native'
import {
  NativeStackNavigationOptions,
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack'
import { Path } from 'react-hook-form'
import { BaseEntity, EntityType, OrderItemReview } from '@/models'
import { AssetInventory } from '@/models/asset-inventory/AssetInventory'
import {
  IDisposalShipmentDetail,
  IDisposalShipmentDetailItem,
} from '@/models/disposal/DisposalShipmentList'
import {
  DisposalDetailMaterialItem,
  DisposalDetailMaterialStockItem,
} from '@/models/disposal/DisposalStock'
import {
  AppNotifActivityMaterial,
  AppNotifActivityParentMaterial,
} from '@/models/notif/AppNotifMaterial'
import {
  OrderMaterialDetailParams,
  AddOrderParams,
  ShipOrderParams,
  AllocatedDetailParams,
  AllocatedOrderParams,
} from '@/models/order/AddOrderItem'
import {
  EditOrderReviewParams,
  OrderFormData as OrderFinalReviewParams,
  EditOrderParams as ReviewOrderDataParams,
} from '@/models/order/OrderActions'
import { OrderDetailResponse } from '@/models/order/OrderDetail'
import { OrderItemData } from '@/models/order/OrderDetailSection'
import { TicketBatch, TicketMaterial } from '@/models/order/Ticket'
import { StockDetail, StockItem } from '@/models/shared/Material'
import {
  BudgetSourceData,
  CreateTransactionForm,
  CreateTransactionStock,
  PatientIDMap,
} from '@/models/transaction/TransactionCreate'
import { DisposalType } from '@/screens/disposal/disposal-constant'
import {
  ReconciliationForm,
  ReconciliationFormItem,
} from '@/screens/reconciliation/schema/CreateReconciliationSchema'
import { MaterialData } from '@/screens/shared/types/MaterialDetail'
import {
  StockTakingForm,
  StockTakingFormItem,
} from '@/screens/stock-taking/schema/CreateStockTakingSchema'

export type ListScreenType = {
  name: keyof AppStackParamList
  component: React.ComponentType<any> | (() => JSX.Element)
  options?:
    | NativeStackNavigationOptions
    | ((props: {
        route: RouteProp<AppStackParamList, keyof AppStackParamList>
      }) => NativeStackNavigationOptions)
}

export type AppStackParamList = {
  Splash: undefined
  Login: undefined
  Workspace: undefined
  Home: undefined
  Profile: undefined
  ProfileDetail: undefined
  EditProfile: undefined
  EditPassword: undefined
  ChangeHistory: { userId: number }
  ViewOrder: undefined
  OrderDetail: {
    id: number
    type?: number
    preview?: boolean
  }
  OrderItemDetail: {
    data: OrderItemData
    orderDetail: OrderDetailResponse
  }
  Network: undefined
  StockActivitySelect: undefined
  TransactionActivitySelect: undefined
  TransactionCustomerSelect: undefined
  StockMaterialSelect: { alerts?: AppNotifActivityParentMaterial[] }
  TransactionMaterialSelect: undefined
  TrademarkMaterialSelect: { alerts?: AppNotifActivityMaterial[] }
  TrademarkMaterialDetail: { detail: StockDetail }
  StockDetail: { materialId: number }
  TransactionAddStock: {
    stock: StockItem
    formUpdate?: {
      path: Path<CreateTransactionForm>
      values: Partial<CreateTransactionStock>
    }
  }
  TransactionAddStockBatch: {
    stock: StockItem
    formUpdate?: {
      path: Path<CreateTransactionForm>
      values: Partial<CreateTransactionStock>
      isNewBatch?: boolean
    }
  }
  TransactionReduceStock: { stock: StockItem }
  TransactionReduceStockBatch: { stock: StockItem }
  TransactionDiscard: { stock: StockItem }
  TransactionDiscardBatch: { stock: StockItem }
  TransactionConsumption: { stock: StockItem }
  TransactionConsumptionBatch: {
    stock: StockItem
    formUpdate?: {
      path: Path<CreateTransactionForm>
      values: Partial<CreateTransactionStock>
      isNewBatch?: boolean
    }
  }
  TransactionReturnHF: { stock: StockItem }
  TransactionReturnHFBatch: { stock: StockItem }
  TransactionCancelDiscard: { stock: StockItem }
  AddPatientInfo: {
    path: Path<CreateTransactionForm>
    data: CreateTransactionStock
    patientIds: PatientIDMap
  }
  AddNewBatch: { batchList: CreateTransactionStock[] }
  AddBudgetInfo: {
    path: Path<CreateTransactionForm>
    data: BudgetSourceData
    isPurchase?: boolean
  }
  ReviewTransaction: undefined
  ViewTransaction: undefined
  AddOrder: AddOrderParams
  CancelOrder: {
    orderId: number
    type?: number
  }
  CustomerSelect: undefined
  OrderItemMaterial: undefined
  OrderItemMaterialDetail: OrderMaterialDetailParams
  OrderItemReview: OrderItemReview
  OrderItemTrademarkMaterial: OrderMaterialDetailParams
  OrderItemTrademarkMaterialDetail: OrderMaterialDetailParams
  EditOrder: {
    orderId: number
    data: OrderDetailResponse
  }
  ReceiveOrder: {
    orderId: number
    data: OrderDetailResponse
  }
  ShipOrder: ShipOrderParams
  ReviewOrder: ReviewOrderDataParams
  EditOrderReview: EditOrderReviewParams
  ConfirmOrder: {
    orderId: number
    data: OrderDetailResponse
  }
  RegularVendorSelect: undefined
  RegularMaterialSelect: undefined
  RegularMaterialDetail: OrderMaterialDetailParams
  RegularActivitySelect: undefined
  RegularReview: undefined
  RegularFinalReview: OrderFinalReviewParams
  DistributionActivitySelect: undefined
  DistributionCustomerSelect: undefined
  DistributionMaterial: undefined
  DistributionMaterialDetail: OrderMaterialDetailParams
  DistributionReview: undefined
  DistributionFinalReview: OrderFinalReviewParams
  ReturnActivitySelect: undefined
  ReturnCustomerSelect: undefined
  ReturnMaterialSelect: undefined
  ReturnMaterialDetail: OrderMaterialDetailParams
  ReturnReview: undefined
  ReturnFinalReview: OrderFinalReviewParams
  Notification: undefined
  RegularTrademarkMaterialScreen: OrderMaterialDetailParams
  RegularTrademarkMaterialDetail: OrderMaterialDetailParams
  AllocatedOrder: AllocatedOrderParams
  AllocatedOrderReview: AllocatedOrderParams
  AllocatedDetailOrder: AllocatedDetailParams
  CreateTicket: { section?: 1 | 2 }
  ViewAssetInventory: undefined
  AddAssetInventory: { isEdit: boolean; data: AssetInventory } | undefined
  AssetInventoryDetail: { id: string | number }
  StockTakingMaterial: { needRefresh: boolean } | undefined
  StockTakingTrademarkMaterial: undefined
  CreateStockTaking:
    | { newBatch?: StockTakingFormItem; deleteAll?: boolean }
    | undefined
  AddBatchStockTaking: { batchList: StockTakingFormItem[] }
  StockTakingHistory: undefined
  ReviewStockTaking: { data: StockTakingForm; createdAt: string }
  TicketMaterialDetail: {
    material: TicketMaterial
    isBatch?: boolean
    isEdit?: boolean
    mode?: 'batch' | 'non-batch'
  }
  AddMaterialOrBatchScreen: {
    material: TicketMaterial
    mode: 'batch' | 'non-batch'
    isEdit?: boolean
    batch?: TicketBatch
  }
  TicketingAddNewMaterial?: {
    material: TicketMaterial
    mode: 'batch' | 'non-batch'
    isEdit: boolean
  }
  ReconciliationActivity: undefined
  ReconciliationMaterial: undefined
  CreateReconciliation: {
    formUpdate?: {
      path: Path<ReconciliationForm>
      values: ReconciliationFormItem
    }
  }
  AddReconciliationType: {
    data: ReconciliationFormItem
    path: Path<ReconciliationForm>
  }
  ReviewReconciliation: {
    data: ReconciliationForm
    createdAt: string
  }
  ReconciliationHistory: undefined
  ReviewTicket: undefined
  ReviewTicketDetail: {
    id: number
  }
  TicketDetail: {
    id: number
  }
  CancelReport: {
    ticketId: number
  }
  StockDisposalActivitySelect: undefined
  ViewListTicket: undefined
  TransferStockProgram: undefined
  TransferStockMaterial: undefined
  CreateTransferStock: { materials: StockItem[]; material: StockItem }
  ReviewTransferStock: undefined
  DisposalStockActivitySelect: undefined
  DisposalSubstanceMaterialSelect: undefined
  DisposalStockMaterialDetail: {
    materialId: number
  }
  DisposalTrademarkMaterialSelect: undefined
  DisposalTrademarkMaterialDetail: { detail: DisposalDetailMaterialItem }
  ConsumptionCustomerList: undefined
  DistributionCustomerList: undefined
  VendorList: undefined
  ProgramEntityDetail: { type: EntityType; data: BaseEntity }
  RelocationActivitySelect: undefined
  RelocationVendorSelect: undefined
  RelocationMaterialSelect: undefined
  RelocationMaterialDetail: { material: MaterialData }
  RelocationTrademarkMaterial: { material: MaterialData }
  RelocationTrademarkMaterialDetail: { material: MaterialData }
  RelocationReview: undefined
  RelocationFinalReview: OrderFinalReviewParams
  SelfDisposalActivity: undefined
  DisposalMethodSelect: undefined
  SelfDisposalMaterial: undefined
  CreateSelfDisposalMaterial: undefined
  AddDisposal: {
    disposalStock: DisposalDetailMaterialStockItem
    type: DisposalType
  }
  ReviewSelfDisposal: undefined
  ViewSelfDisposalList: undefined
  HelpCenter: undefined
  ShipmentDisposalFollowUp: undefined
  ShipmentDisposalActivity: undefined
  ShipmentDisposalReceiver: undefined
  ShipmentDisposalMaterial: undefined
  CreateDisposalShipmentMaterial: undefined
  ReviewDisposalShipment: undefined
  DisposalShipmentList: undefined
  DisposalShipmentDetail: { id: number; isSender: boolean }
  DisposalShipmentItemDetail: {
    item: IDisposalShipmentDetailItem
    activityName: string
    status: number
  }
  ReceiveDisposalShipment: { data: IDisposalShipmentDetail }
  CancelDisposalShipment: { data: IDisposalShipmentDetail }
  ValidateOrder: {
    orderId: number
    data: OrderDetailResponse
  }
  UserEntityList: undefined
}

export type AppStackScreenProps<T extends keyof AppStackParamList> =
  NativeStackScreenProps<AppStackParamList, T>

export type UseNavigationScreen = NativeStackNavigationProp<AppStackParamList>

declare global {
  namespace ReactNavigation {
    interface RootParamList extends AppStackParamList {}
  }
}
