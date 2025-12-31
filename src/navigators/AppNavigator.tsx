import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { ParseKeys } from 'i18next'
import { Toolbar } from '@/components/toolbar'
import { HomeAction } from '@/components/toolbar/actions/HomeAction'
import { ProfileToolbarActions } from '@/components/toolbar/actions/ProfileToolbarActions'
import { ToolbarMenu } from '@/components/toolbar/ToolbarMenu'
import i18n from '@/i18n'
import AddAssetInventoryScreen from '@/screens/asset/AddAssetInventoryScreen'
import AssetInventoryDetailScreen from '@/screens/asset/AssetInventoryDetailScreen'
import ViewAssetInventory from '@/screens/asset/ViewAssetInventoryScreen'
import LoginScreen from '@/screens/auth/LoginScreen'
import AddDisposalScreen from '@/screens/disposal/disposal/AddDisposalScreen'
import CreateSelfDisposalMaterialScreen from '@/screens/disposal/disposal/CreateSelfDisposalMaterialScreen'
import DisposalMethodSelectScreen from '@/screens/disposal/disposal/DisposalMethodSelectScreen'
import ReviewSelfDisposalScreen from '@/screens/disposal/disposal/ReviewSelfDisposalScreen'
import SelfDisposalMaterialScreen from '@/screens/disposal/disposal/SelfDisposalMaterialScreen'
import ViewSelfDisposalListScreen from '@/screens/disposal/disposal/ViewSelfDisposalListScreen'
import SelfDisposalActivityScreen from '@/screens/disposal/SelfDisposalActivityScreen'
import CreateDisposalShipmentMaterialScreen from '@/screens/disposal/shipment-disposal/CreateDisposalShipmentMaterialScreen'
import ReviewDisposalShipmentScreen from '@/screens/disposal/shipment-disposal/ReviewDisposalShipmentScreen'
import ShipmentDisposalActivityScreen from '@/screens/disposal/shipment-disposal/ShipmentDisposalActivityScreen'
import ShipmentDisposalMaterialScreen from '@/screens/disposal/shipment-disposal/ShipmentDisposalMaterialScreen'
import ShipmentDisposalReceiverScreen from '@/screens/disposal/shipment-disposal/ShipmentDisposalReceiverScreen'
import CancelDisposalShipmentScreen from '@/screens/disposal/shipment-list/CancelDisposalShipmentScreen'
import DisposalShipmentDetailScreen from '@/screens/disposal/shipment-list/DisposalShipmentDetailScreen'
import DisposalShipmentItemDetailScreen from '@/screens/disposal/shipment-list/DisposalShipmentItemDetailScreen'
import DisposalShipmentListScreen from '@/screens/disposal/shipment-list/DisposalShipmentListScreen'
import ReceiveDisposalShipmentScreen from '@/screens/disposal/shipment-list/ReceiveDisposalShipmentScreen'
import DisposalStockActivitySelectScreen from '@/screens/disposal/stock/DisposalStockActivitySelectScreen'
import DisposalStockMaterialDetailScreen from '@/screens/disposal/stock/DisposalStockMaterialDetail'
import DisposalSubstanceMaterialSelectScreen from '@/screens/disposal/stock/DisposalSubstanceMaterialSelectScreen'
import DisposalTrademarkMaterialDetailScreen from '@/screens/disposal/stock/DisposalTrademarkMaterialDetailScreen'
import DisposalTrademarkMaterialSelectScreen from '@/screens/disposal/stock/DisposalTrademarkMaterialSelectScreen'
import HelpCenterScreen from '@/screens/help-center/HelpCenterScreen'
import HomeScreen from '@/screens/home/HomeScreen'
import StockActivitySelectScreen from '@/screens/inventory/stock/StockActivitySelectScreen'
import StockDetailScreen from '@/screens/inventory/stock/StockDetailScreen'
import StockMaterialSelectScreen from '@/screens/inventory/stock/StockMaterialSelectScreen'
import TrademarkMaterialDetailScreen from '@/screens/inventory/stock/TrademarkMaterialDetailScreen'
import TrademarkMaterialSelectScreen from '@/screens/inventory/stock/TrademarkMaterialSelectScreen'
import AddBudgetInfoScreen from '@/screens/inventory/transaction/AddBudgetInfoScreen'
import AddNewBatchScreen from '@/screens/inventory/transaction/AddNewBatchScreen'
import AddPatientInfoScreen from '@/screens/inventory/transaction/AddPatientInfoScreen'
import ReviewTransactionScreen from '@/screens/inventory/transaction/ReviewTransactionScreen'
import TransactionActivitySelectScreen from '@/screens/inventory/transaction/TransactionActivitySelectScreen'
import TransactionAddStockBatchScreen from '@/screens/inventory/transaction/TransactionAddStockBatchScreen'
import TransactionAddStockScreen from '@/screens/inventory/transaction/TransactionAddStockScreen'
import TransactionCancelDiscardScreen from '@/screens/inventory/transaction/TransactionCancelDiscardScreen'
import TransactionConsumptionBatchScreen from '@/screens/inventory/transaction/TransactionConsumptionBatchScreen'
import TransactionConsumptionScreen from '@/screens/inventory/transaction/TransactionConsumptionScreen'
import TransactionCustomerSelectScreen from '@/screens/inventory/transaction/TransactionCustomerSelectScreen'
import TransactionDiscardBatchScreen from '@/screens/inventory/transaction/TransactionDiscardBatchScreen'
import TransactionDiscardScreen from '@/screens/inventory/transaction/TransactionDiscardScreen'
import TransactionMaterialSelectScreen from '@/screens/inventory/transaction/TransactionMaterialSelectScreen'
import TransactionReduceStockBatchScreen from '@/screens/inventory/transaction/TransactionReduceStockBatchScreen'
import TransactionReduceStockScreen from '@/screens/inventory/transaction/TransactionReduceStockScreen'
import TransactionReturnHFScreen from '@/screens/inventory/transaction/TransactionReturnHFScreen'
import ViewTransactionScreen from '@/screens/inventory/transaction/ViewTransactionScreen'
import NetworkScreen from '@/screens/NetworkScreen'
import NotificationScreen from '@/screens/notif/NotificationScreen'
import ShipOrderScreen from '@/screens/order/detail/allocated/ShipOrderScreen'
import CancelOrderScreen from '@/screens/order/detail/cancelled/CancelOrderScreen'
import AllocatedDetailOrderScreen from '@/screens/order/detail/confirmed/AllocatedDetailOrderScreen'
import AllocatedOrderReviewScreen from '@/screens/order/detail/confirmed/AllocatedOrderReviewScreen'
import AllocatedOrderScreen from '@/screens/order/detail/confirmed/AllocatedOrderScreen'
import ValidateOrderScreen from '@/screens/order/detail/draft/ValidateOrderScreen'
import AddOrderScreen from '@/screens/order/detail/pending/AddOrderScreen'
import ConfirmOrderScreen from '@/screens/order/detail/pending/ConfirmOrderScreen'
import EditOrderReviewScreen from '@/screens/order/detail/pending/EditOrderReviewScreen'
import EditOrderScreen from '@/screens/order/detail/pending/EditOrderScreen'
import OrderItemDetailScreen from '@/screens/order/detail/pending/OrderItemDetailScreen'
import OrderItemMaterialDetailScreen from '@/screens/order/detail/pending/OrderItemMaterialDetailScreen'
import OrderItemMaterialScreen from '@/screens/order/detail/pending/OrderItemMaterialScreen'
import OrderItemReviewScreen from '@/screens/order/detail/pending/OrderItemReviewScreen'
import OrderItemTrademarkMaterialDetailScreen from '@/screens/order/detail/pending/OrderItemTrademarkMaterialDetailScreen'
import OrderItemTrademarkMaterialScreen from '@/screens/order/detail/pending/OrderItemTrademarkMaterialScreen'
import ReceiveOrderScreen from '@/screens/order/detail/shipped/ReceiveOrderScreen'
import DistributionActivitySelectScreen from '@/screens/order/distribution/DistributionActivitySelectScreen'
import DistributionCustomerSelectScreen from '@/screens/order/distribution/DistributionCustomerSelectScreen'
import DistributionFinalReviewScreen from '@/screens/order/distribution/DistributionFinalReviewScreen'
import DistributionMaterialDetailScreen from '@/screens/order/distribution/DistributionMaterialDetailScreen'
import DistributionMaterialScreen from '@/screens/order/distribution/DistributionMaterialScreen'
import DistributionReviewScreen from '@/screens/order/distribution/DistributionReviewScreen'
import OrderDetailScreen from '@/screens/order/OrderDetailScreen'
import RegularActivitySelectScreen from '@/screens/order/regular/RegularActivitySelectScreen'
import RegularFinalReviewScreen from '@/screens/order/regular/RegularFinalReviewScreen'
import RegularMaterialDetailScreen from '@/screens/order/regular/RegularMaterialDetailScreen'
import RegularMaterialSelectScreen from '@/screens/order/regular/RegularMaterialSelectScreen'
import RegularReviewScreen from '@/screens/order/regular/RegularReviewScreen'
import RegularTrademarkMaterialDetailScreen from '@/screens/order/regular/RegularTrademarkMaterialDetailScreen'
import RegularTrademarkMaterialScreen from '@/screens/order/regular/RegularTrademarkMaterialScreen'
import RegularVendorSelectScreen from '@/screens/order/regular/RegularVendorSelectScreen'
import RelocationActivitySelectScreen from '@/screens/order/relocation/RelocationActivitySelectScreen'
import RelocationFinalReviewScreen from '@/screens/order/relocation/RelocationFinalReviewScreen'
import RelocationMaterialDetailScreen from '@/screens/order/relocation/RelocationMaterialDetailScreen'
import RelocationMaterialSelectScreen from '@/screens/order/relocation/RelocationMaterialSelectScreen'
import RelocationReviewScreen from '@/screens/order/relocation/RelocationReviewScreen'
import RelocationTrademarkMaterialDetailScreen from '@/screens/order/relocation/RelocationTrademarkMaterialDetailScreen'
import RelocationTrademarkMaterialScreen from '@/screens/order/relocation/RelocationTrademarkMaterialScreen'
import RelocationVendorSelectScreen from '@/screens/order/relocation/RelocationVendorSelectScreen'
import ReturnActivitySelectScreen from '@/screens/order/return/ReturnActivitySelectScreen'
import ReturnCustomerSelectScreen from '@/screens/order/return/ReturnCustomerSelectScreen'
import ReturnFinalReviewScreen from '@/screens/order/return/ReturnFinalReviewScreen'
import ReturnMaterialDetailScreen from '@/screens/order/return/ReturnMaterialDetailScreen'
import ReturnMaterialSelectScreen from '@/screens/order/return/ReturnMaterialSelect'
import ReturnReviewScreen from '@/screens/order/return/ReturnReviewScreen'
import AddMaterialOrBatchScreen from '@/screens/order/ticket/AddMaterialOrBatchScreen'
import CancelReportScreen from '@/screens/order/ticket/CancelReportScreen'
import CreateTicketScreen from '@/screens/order/ticket/CreateTicketScreen'
import ReviewTicketScreen from '@/screens/order/ticket/ReviewTicketScreen'
import TicketDetailScreen from '@/screens/order/ticket/TicketDetailScreen'
import TicketingAddMaterialScreen from '@/screens/order/ticket/TicketingAddMaterialScreen'
import TicketMaterialDetailScreen from '@/screens/order/ticket/TicketMaterialDetailScreen'
import ViewListTicketScreen from '@/screens/order/ticket/ViewListTicketScreen'
import ViewOrderScreen from '@/screens/order/ViewOrderScreen'
import ChangeHistoryScreen from '@/screens/profile/ChangeHistoryScreen'
import EditPasswordScreen from '@/screens/profile/EditPasswordScreen'
import EditProfileScreen from '@/screens/profile/EditProfileScreen'
import ProfileDetailScreen from '@/screens/profile/ProfileDetailScreen'
import ProfileScreen from '@/screens/profile/ProfileScreen'
import ConsumptionCustomerListScreen from '@/screens/program-entity/ConsumptionCustomerListScreen'
import DistributionCustomerListScreen from '@/screens/program-entity/DistributionCustomerListScreen'
import ProgramEntityDetailScreen from '@/screens/program-entity/ProgramEntityDetailScreen'
import VendorListScreen from '@/screens/program-entity/VendorListScreen'
import AddReconciliationTypeScreen from '@/screens/reconciliation/AddReconciliationTypeScreen'
import CreateReconciliationScreen from '@/screens/reconciliation/CreateReconciliationScreen'
import ReconciliationActivityScreen from '@/screens/reconciliation/ReconciliationActivityScreen'
import ReconciliationHistoryScreen from '@/screens/reconciliation/ReconciliationHistoryScreen'
import ReconciliationMaterialScreen from '@/screens/reconciliation/ReconciliationMaterialScreen'
import ReviewReconciliationScreen from '@/screens/reconciliation/ReviewReconciliationScreen'
import SplashScreen from '@/screens/splash/SplashScreen'
import AddBatchStockTakingScreen from '@/screens/stock-taking/AddBatchStockTakingScreen'
import CreateStockTakingScreen from '@/screens/stock-taking/CreateStockTakingScreen'
import ReviewStockTakingScreen from '@/screens/stock-taking/ReviewStockTakingScreen'
import StockTakingHistoryScreen from '@/screens/stock-taking/StockTakingHistoryScreen'
import StockTakingMaterialScreen from '@/screens/stock-taking/StockTakingMaterialScreen'
import StockTakingTrademarkMaterialScreen from '@/screens/stock-taking/StockTakingTrademarkMaterialScreen'
import CreateTransferStockScreen from '@/screens/transfer-stock/CreateTransferStockScreen'
import ReviewTransferStockScreen from '@/screens/transfer-stock/ReviewTransferStockScreen'
import TransferStockMaterialScreen from '@/screens/transfer-stock/TransferStockMaterialScreen'
import TransferStockProgramScreen from '@/screens/transfer-stock/TransferStockProgramScreen'
import UserEntityListScreen from '@/screens/workspace/UserEntityListScreen'
import WorkspaceScreen from '@/screens/workspace/WorkspaceScreen'
import colors from '@/theme/colors'
import { canShowNetworkLogger } from '@/utils/CommonUtils'
import { DATA_TYPES } from '@/utils/Constants'
import { navigationRef } from '@/utils/NavigationUtils'
import { AppStackParamList, ListScreenType } from './types'

const screenList: ListScreenType[] = [
  { name: 'Splash', component: SplashScreen, options: { headerShown: false } },
  {
    name: 'Login',
    component: LoginScreen,
    options: { headerShown: false },
  },
  {
    name: 'Workspace',
    component: WorkspaceScreen,
    options: {
      header: () => (
        <Toolbar
          title='SMILE Indonesia'
          showBackButton={false}
          statusBarColor={colors.app()}
          backgroundClassName='bg-app'
          titleClassName='text-white'
          actions={<ProfileToolbarActions iconColor={colors.white} />}
        />
      ),
    },
  },
  {
    name: 'Home',
    component: HomeScreen,
  },
  {
    name: 'StockDetail',
    component: StockDetailScreen,
    options: {
      header: () => getHeaderWithSubtitle('title.detail_stock'),
    },
  },
  {
    name: 'AddNewBatch',
    component: AddNewBatchScreen,
    options: {
      header: () => getHeaderWithSubtitle('title.add_new_batch'),
    },
  },
  {
    name: 'Profile',
    component: ProfileScreen,
    options: { headerShown: false, animation: 'slide_from_right' },
  },
  {
    name: 'ProfileDetail',
    component: ProfileDetailScreen,
    options: {
      header: () => getProfileHeader('title.my_account'),
    },
  },
  {
    name: 'EditProfile',
    component: EditProfileScreen,
    options: {
      header: () => getProfileHeader('title.edit_profile'),
    },
  },
  {
    name: 'EditPassword',
    component: EditPasswordScreen,
    options: {
      header: () => getProfileHeader('title.edit_password'),
    },
  },
  {
    name: 'ChangeHistory',
    component: ChangeHistoryScreen,
    options: {
      header: () => getProfileHeader('title.change_history', true),
    },
  },
  {
    name: 'ViewOrder',
    component: ViewOrderScreen,
  },
  {
    name: 'OrderDetail',
    component: OrderDetailScreen,
  },
  {
    name: 'OrderItemDetail',
    component: OrderItemDetailScreen,
  },
  {
    name: 'OrderItemTrademarkMaterial',
    component: OrderItemTrademarkMaterialScreen,
  },
  {
    name: 'OrderItemTrademarkMaterialDetail',
    component: OrderItemTrademarkMaterialDetailScreen,
  },
  {
    name: 'RegularVendorSelect',
    component: RegularVendorSelectScreen,
    options: {
      header: () => <ToolbarMenu type={DATA_TYPES.CVA} />,
    },
  },
  {
    name: 'TransactionActivitySelect',
    component: TransactionActivitySelectScreen,
    options: {
      header: () => <ToolbarMenu type={DATA_TYPES.CVA} />,
    },
  },
  {
    name: 'StockActivitySelect',
    component: StockActivitySelectScreen,
    options: {
      header: () => <ToolbarMenu type={DATA_TYPES.CVA} />,
    },
  },
  {
    name: 'TransactionCustomerSelect',
    component: TransactionCustomerSelectScreen,
    options: {
      header: () => <ToolbarMenu type={DATA_TYPES.CVA} />,
    },
  },
  {
    name: 'StockMaterialSelect',
    component: StockMaterialSelectScreen,
    options: {
      header: () => <ToolbarMenu type={DATA_TYPES.MATERIAL} />,
    },
  },
  {
    name: 'TransactionMaterialSelect',
    component: TransactionMaterialSelectScreen,
    options: {
      header: () => <ToolbarMenu type={DATA_TYPES.MATERIAL} />,
    },
  },
  {
    name: 'TrademarkMaterialSelect',
    component: TrademarkMaterialSelectScreen,
    options: {
      header: () => <ToolbarMenu type={DATA_TYPES.MATERIAL} />,
    },
  },
  {
    name: 'TrademarkMaterialDetail',
    component: TrademarkMaterialDetailScreen,
    options: {
      header: () => getHeaderWithSubtitle('title.detail_stock'),
    },
  },
  {
    name: 'TransactionAddStock',
    component: TransactionAddStockScreen,
    options: {
      header: () => <ToolbarMenu />,
    },
  },
  {
    name: 'TransactionAddStockBatch',
    component: TransactionAddStockBatchScreen,
    options: {
      header: () => <ToolbarMenu />,
    },
  },
  {
    name: 'AddBudgetInfo',
    component: AddBudgetInfoScreen,
  },
  {
    name: 'TransactionReduceStock',
    component: TransactionReduceStockScreen,
    options: {
      header: () => <ToolbarMenu />,
    },
  },
  {
    name: 'TransactionReduceStockBatch',
    component: TransactionReduceStockBatchScreen,
    options: {
      header: () => <ToolbarMenu />,
    },
  },
  {
    name: 'TransactionDiscard',
    component: TransactionDiscardScreen,
    options: {
      header: () => <ToolbarMenu />,
    },
  },
  {
    name: 'TransactionDiscardBatch',
    component: TransactionDiscardBatchScreen,
    options: {
      header: () => <ToolbarMenu />,
    },
  },
  {
    name: 'TransactionConsumption',
    component: TransactionConsumptionScreen,
    options: {
      header: () => <ToolbarMenu />,
    },
  },
  {
    name: 'TransactionConsumptionBatch',
    component: TransactionConsumptionBatchScreen,
    options: {
      header: () => <ToolbarMenu />,
    },
  },
  {
    name: 'AddPatientInfo',
    component: AddPatientInfoScreen,
    options: {
      header: () => <ToolbarMenu />,
    },
  },
  {
    name: 'TransactionReturnHF',
    component: TransactionReturnHFScreen,
    options: {
      header: () => <ToolbarMenu />,
    },
  },
  {
    name: 'TransactionCancelDiscard',
    component: TransactionCancelDiscardScreen,
  },
  {
    name: 'ReviewTransaction',
    component: ReviewTransactionScreen,
    options: {
      header: () => getHeaderWithSubtitle('title.review_transaction'),
    },
  },
  {
    name: 'AddOrder',
    component: AddOrderScreen,
  },
  {
    name: 'ViewTransaction',
    component: ViewTransactionScreen,
  },
  {
    name: 'CancelOrder',
    component: CancelOrderScreen,
  },
  {
    name: 'OrderItemMaterial',
    component: OrderItemMaterialScreen,
  },
  {
    name: 'OrderItemMaterialDetail',
    component: OrderItemMaterialDetailScreen,
  },
  {
    name: 'OrderItemReview',
    component: OrderItemReviewScreen,
  },
  {
    name: 'EditOrder',
    component: EditOrderScreen,
    options({ route }) {
      const { orderId } = route.params as { orderId: number }
      return {
        header: () => (
          <Toolbar
            title={`${i18n.t('button.edit_order')}: ${orderId}`}
            withDefaultSubtitle
          />
        ),
      }
    },
  },
  {
    name: 'ReceiveOrder',
    component: ReceiveOrderScreen,
  },
  {
    name: 'RegularMaterialSelect',
    component: RegularMaterialSelectScreen,
    options: {
      header: () => <ToolbarMenu type={DATA_TYPES.MATERIAL} />,
    },
  },
  {
    name: 'RegularMaterialDetail',
    component: RegularMaterialDetailScreen,
  },
  {
    name: 'ShipOrder',
    component: ShipOrderScreen,
  },
  {
    name: 'RegularReview',
    component: RegularReviewScreen,
  },
  {
    name: 'RegularFinalReview',
    component: RegularFinalReviewScreen,
  },
  {
    name: 'EditOrderReview',
    component: EditOrderReviewScreen,
  },
  {
    name: 'RegularActivitySelect',
    component: RegularActivitySelectScreen,
    options: {
      header: () => <ToolbarMenu type={DATA_TYPES.CVA} />,
    },
  },
  {
    name: 'ConfirmOrder',
    component: ConfirmOrderScreen,
  },
  {
    name: 'DistributionActivitySelect',
    component: DistributionActivitySelectScreen,
    options: {
      header: () => <ToolbarMenu type={DATA_TYPES.CVA} />,
    },
  },
  {
    name: 'DistributionCustomerSelect',
    component: DistributionCustomerSelectScreen,
    options: {
      header: () => <ToolbarMenu type={DATA_TYPES.CVA} />,
    },
  },
  {
    name: 'DistributionMaterial',
    component: DistributionMaterialScreen,
    options: {
      header: () => <ToolbarMenu type={DATA_TYPES.MATERIAL} />,
    },
  },
  {
    name: 'DistributionMaterialDetail',
    component: DistributionMaterialDetailScreen,
  },
  {
    name: 'DistributionReview',
    component: DistributionReviewScreen,
  },
  {
    name: 'DistributionFinalReview',
    component: DistributionFinalReviewScreen,
  },
  {
    name: 'Notification',
    component: NotificationScreen,
    options: { header: () => getProfileHeader('title.notification', true) },
  },
  {
    name: 'ReturnActivitySelect',
    component: ReturnActivitySelectScreen,
    options: {
      header: () => <ToolbarMenu type={DATA_TYPES.CVA} />,
    },
  },
  {
    name: 'ReturnCustomerSelect',
    component: ReturnCustomerSelectScreen,
    options: {
      header: () => <ToolbarMenu type={DATA_TYPES.CVA} />,
    },
  },
  {
    name: 'ReturnMaterialSelect',
    component: ReturnMaterialSelectScreen,
    options: {
      header: () => <ToolbarMenu type={DATA_TYPES.MATERIAL} />,
    },
  },
  {
    name: 'ReturnMaterialDetail',
    component: ReturnMaterialDetailScreen,
  },
  {
    name: 'ReturnReview',
    component: ReturnReviewScreen,
  },
  {
    name: 'ReturnFinalReview',
    component: ReturnFinalReviewScreen,
  },
  {
    name: 'RegularTrademarkMaterialScreen',
    component: RegularTrademarkMaterialScreen,
  },
  {
    name: 'RegularTrademarkMaterialDetail',
    component: RegularTrademarkMaterialDetailScreen,
  },
  {
    name: 'AllocatedOrder',
    component: AllocatedOrderScreen,
  },
  {
    name: 'AllocatedOrderReview',
    component: AllocatedOrderReviewScreen,
  },
  {
    name: 'AllocatedDetailOrder',
    component: AllocatedDetailOrderScreen,
  },
  {
    name: 'ViewAssetInventory',
    component: ViewAssetInventory,
  },
  {
    name: 'AssetInventoryDetail',
    component: AssetInventoryDetailScreen,
  },
  {
    name: 'AddAssetInventory',
    component: AddAssetInventoryScreen,
  },
  {
    name: 'StockTakingMaterial',
    component: StockTakingMaterialScreen,
  },
  {
    name: 'StockTakingTrademarkMaterial',
    component: StockTakingTrademarkMaterialScreen,
    options: {
      header: () => <ToolbarMenu actions={<HomeAction />} />,
    },
  },
  {
    name: 'CreateTicket',
    component: CreateTicketScreen,
  },
  {
    name: 'TicketMaterialDetail',
    component: TicketMaterialDetailScreen,
    options: {
      header: () => (
        <Toolbar title={i18n.t('ticket.add_material')} withDefaultSubtitle />
      ),
    },
  },
  {
    name: 'AddMaterialOrBatchScreen',
    component: AddMaterialOrBatchScreen,
  },
  {
    name: 'StockTakingHistory',
    component: StockTakingHistoryScreen,
  },
  {
    name: 'CreateStockTaking',
    component: CreateStockTakingScreen,
    options: {
      header: () => <ToolbarMenu actions={<HomeAction />} />,
    },
  },
  {
    name: 'AddBatchStockTaking',
    component: AddBatchStockTakingScreen,
    options: {
      header: () => (
        <ToolbarMenu
          title={i18n.t('stock_taking.review_title')}
          actions={<HomeAction />}
        />
      ),
    },
  },
  {
    name: 'ReviewStockTaking',
    component: ReviewStockTakingScreen,
    options: {
      header: () => <ToolbarMenu actions={<HomeAction />} />,
    },
  },
  {
    name: 'TicketingAddNewMaterial',
    component: TicketingAddMaterialScreen,
    options: {
      header: () => <Toolbar title='Add New Material' withDefaultSubtitle />,
    },
  },
  {
    name: 'ReviewTicket',
    component: ReviewTicketScreen,
    options: {
      header: () => (
        <Toolbar title={i18n.t('ticket.review_ticket')} withDefaultSubtitle />
      ),
    },
  },
  {
    name: 'TicketDetail',
    component: TicketDetailScreen,
    options: {
      header: () => (
        <ToolbarMenu
          title={i18n.t('ticket.label_ticket')}
          actions={<HomeAction />}
        />
      ),
    },
  },
  {
    name: 'ReconciliationActivity',
    component: ReconciliationActivityScreen,
    options: {
      header: () => <ToolbarMenu type={DATA_TYPES.CVA} />,
    },
  },
  {
    name: 'ReconciliationMaterial',
    component: ReconciliationMaterialScreen,
    options: {
      header: () => <ToolbarMenu type={DATA_TYPES.MATERIAL} />,
    },
  },
  {
    name: 'CreateReconciliation',
    component: CreateReconciliationScreen,
    options: {
      header: () => <ToolbarMenu actions={<HomeAction />} />,
    },
  },
  {
    name: 'AddReconciliationType',
    component: AddReconciliationTypeScreen,
  },
  {
    name: 'ReviewReconciliation',
    component: ReviewReconciliationScreen,
    options: {
      header: () => (
        <ToolbarMenu
          title={i18n.t('reconciliation.review_title')}
          actions={<HomeAction />}
        />
      ),
    },
  },
  {
    name: 'ReconciliationHistory',
    component: ReconciliationHistoryScreen,
    options: {
      header: () => <ToolbarMenu actions={<HomeAction />} />,
      headerShown: false,
    },
  },
  {
    name: 'ViewListTicket',
    component: ViewListTicketScreen,
    options: {
      header: () => (
        <Toolbar title={i18n.t('title.view_list_ticket')} withDefaultSubtitle />
      ),
    },
  },
  {
    name: 'TransferStockProgram',
    component: TransferStockProgramScreen,
  },
  {
    name: 'TransferStockMaterial',
    component: TransferStockMaterialScreen,
  },
  {
    name: 'ReviewTransferStock',
    component: ReviewTransferStockScreen,
    options: {
      header: () => getHeaderWithSubtitle('title.review_transaction'),
    },
  },
  {
    name: 'CreateTransferStock',
    component: CreateTransferStockScreen,
  },
  {
    name: 'DisposalStockActivitySelect',
    component: DisposalStockActivitySelectScreen,
    options: {
      header: () => <ToolbarMenu type={DATA_TYPES.CVA} />,
    },
  },
  {
    name: 'DisposalSubstanceMaterialSelect',
    component: DisposalSubstanceMaterialSelectScreen,
    options: {
      header: () => <ToolbarMenu type={DATA_TYPES.MATERIAL} />,
    },
  },
  {
    name: 'DisposalStockMaterialDetail',
    component: DisposalStockMaterialDetailScreen,
    options: {
      header: () => <ToolbarMenu type={DATA_TYPES.MATERIAL} />,
    },
  },
  {
    name: 'DisposalTrademarkMaterialSelect',
    component: DisposalTrademarkMaterialSelectScreen,
    options: {
      header: () => <ToolbarMenu type={DATA_TYPES.MATERIAL} />,
    },
  },
  {
    name: 'DisposalTrademarkMaterialDetail',
    component: DisposalTrademarkMaterialDetailScreen,
    options: {
      header: () => getHeaderWithSubtitle('menu.view_disposal'),
    },
  },
  {
    name: 'DistributionCustomerList',
    component: DistributionCustomerListScreen,
    options: {
      header: () =>
        getHeaderWithSubtitle('customer_vendor.title.distribution_customer'),
    },
  },
  {
    name: 'ConsumptionCustomerList',
    component: ConsumptionCustomerListScreen,
    options: {
      header: () =>
        getHeaderWithSubtitle('customer_vendor.title.consumption_customer'),
    },
  },
  {
    name: 'VendorList',
    component: VendorListScreen,
    options: {
      header: () => getHeaderWithSubtitle('customer_vendor.title.vendor'),
    },
  },
  {
    name: 'ProgramEntityDetail',
    component: ProgramEntityDetailScreen,
  },
  {
    name: 'RelocationActivitySelect',
    component: RelocationActivitySelectScreen,
    options: {
      header: () => <ToolbarMenu type={DATA_TYPES.CVA} />,
    },
  },
  {
    name: 'RelocationVendorSelect',
    component: RelocationVendorSelectScreen,
  },
  {
    name: 'RelocationMaterialSelect',
    component: RelocationMaterialSelectScreen,
    options: {
      header: () => <ToolbarMenu type={DATA_TYPES.MATERIAL} />,
    },
  },
  {
    name: 'RelocationMaterialDetail',
    component: RelocationMaterialDetailScreen,
    options: { header: () => <ToolbarMenu /> },
  },
  {
    name: 'RelocationTrademarkMaterial',
    component: RelocationTrademarkMaterialScreen,
    options: { header: () => <ToolbarMenu /> },
  },
  {
    name: 'RelocationTrademarkMaterialDetail',
    component: RelocationTrademarkMaterialDetailScreen,
    options: { header: () => <ToolbarMenu /> },
  },
  {
    name: 'RelocationReview',
    component: RelocationReviewScreen,
    options: { header: () => <ToolbarMenu /> },
  },
  {
    name: 'RelocationFinalReview',
    component: RelocationFinalReviewScreen,
    options: { header: () => <ToolbarMenu /> },
  },
  {
    name: 'SelfDisposalActivity',
    component: SelfDisposalActivityScreen,
    options: {
      header: () => <ToolbarMenu type={DATA_TYPES.CVA} />,
    },
  },
  {
    name: 'DisposalMethodSelect',
    component: DisposalMethodSelectScreen,
    options: {
      header: () => <ToolbarMenu />,
    },
  },
  {
    name: 'SelfDisposalMaterial',
    component: SelfDisposalMaterialScreen,
    options: {
      header: () => <ToolbarMenu />,
    },
  },
  {
    name: 'CreateSelfDisposalMaterial',
    component: CreateSelfDisposalMaterialScreen,
    options: {
      header: () => <ToolbarMenu />,
    },
  },
  {
    name: 'AddDisposal',
    component: AddDisposalScreen,
    options: {
      header: () => <ToolbarMenu />,
    },
  },
  {
    name: 'ReviewSelfDisposal',
    component: ReviewSelfDisposalScreen,
    options: {
      header: () => getHeaderWithSubtitle('title.review_self_disposal'),
    },
  },
  {
    name: 'ViewSelfDisposalList',
    component: ViewSelfDisposalListScreen,
  },
  {
    name: 'ShipmentDisposalActivity',
    component: ShipmentDisposalActivityScreen,
    options: {
      header: () => <ToolbarMenu type={DATA_TYPES.CVA} />,
    },
  },
  {
    name: 'ShipmentDisposalReceiver',
    component: ShipmentDisposalReceiverScreen,
    options: {
      header: () => <ToolbarMenu type={DATA_TYPES.CVA} />,
    },
  },
  {
    name: 'ShipmentDisposalMaterial',
    component: ShipmentDisposalMaterialScreen,
  },
  {
    name: 'CreateDisposalShipmentMaterial',
    component: CreateDisposalShipmentMaterialScreen,
    options: {
      header: () => <ToolbarMenu />,
    },
  },
  {
    name: 'ReviewDisposalShipment',
    component: ReviewDisposalShipmentScreen,
    options: {
      header: () => getHeaderWithSubtitle('title.review_disposal_shipment'),
    },
  },
  {
    name: 'DisposalShipmentList',
    component: DisposalShipmentListScreen,
  },
  {
    name: 'DisposalShipmentDetail',
    component: DisposalShipmentDetailScreen,
  },
  {
    name: 'DisposalShipmentItemDetail',
    component: DisposalShipmentItemDetailScreen,
    options: {
      header: () => getHeaderWithSubtitle('disposal.disposal_shipment'),
    },
  },
  {
    name: 'CancelDisposalShipment',
    component: CancelDisposalShipmentScreen,
    options: {
      header: () => getHeaderWithSubtitle('disposal.cancel_shipment'),
    },
  },
  {
    name: 'ReceiveDisposalShipment',
    component: ReceiveDisposalShipmentScreen,
  },
  {
    name: 'HelpCenter',
    component: HelpCenterScreen,
    options: {
      header: () => (
        <Toolbar
          title={i18n.t('help_center.title')}
          statusBarColor={colors.deepBlue}
          backgroundClassName='bg-deepBlue'
          titleClassName='text-white'
        />
      ),
    },
  },
  {
    name: 'ValidateOrder',
    component: ValidateOrderScreen,
  },
  {
    name: 'UserEntityList',
    component: UserEntityListScreen,
    options: {
      header: () => (
        <ToolbarMenu title={i18n.t('label.entity')} actions={<HomeAction />} />
      ),
    },
  },
  {
    name: 'CancelReport',
    component: CancelReportScreen,
  },
]

const getProfileHeader = (title: ParseKeys, withDefaultSubtitle = false) => (
  <Toolbar
    title={i18n.t(title)}
    withDefaultSubtitle={withDefaultSubtitle}
    statusBarColor={colors.app()}
    backIconColor={colors.white}
    backgroundClassName='bg-app'
    titleClassName='text-white'
    subtitleClassName='text-white'
  />
)

const getHeaderWithSubtitle = (title: string | ParseKeys) => (
  <Toolbar title={i18n.t(title as ParseKeys)} withDefaultSubtitle />
)

const Stack = createNativeStackNavigator<AppStackParamList>()

export const AppNavigator = () => {
  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator>
        {screenList.map((item) => (
          <Stack.Screen
            name={item.name}
            component={item.component}
            key={`screen-${item.name}`}
            options={item.options}
          />
        ))}
        {canShowNetworkLogger && (
          <Stack.Screen
            name='Network'
            component={NetworkScreen}
            key='screen-network'
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}
