import React, { useEffect, useState } from 'react'
import { Linking, View, Text, FlatList, RefreshControl } from 'react-native'
import { Icons } from '@/assets/icons'
import { MENU_ITEM } from '@/assets/strings/menu'
import Accordion from '@/components/accordion/Accordion'
import {
  ConfirmationDialog,
  ConfirmationDialogProps,
} from '@/components/dialog/ConfirmationDialog'
import LoadingDialog from '@/components/LoadingDialog'
import { ProfileToolbarActions } from '@/components/toolbar/actions/ProfileToolbarActions'
import { useToolbar } from '@/components/toolbar/hooks/useToolbar'
import { useOrderNotif } from '@/hooks/useOrderNotif'
import { useLanguage } from '@/i18n/useLanguage'
import { HomeMenuChildItem } from '@/models'
import { useLazyGetNotificationCountQuery } from '@/services/apis'
import { removeOrdersState } from '@/services/features'
import { setActiveMenu } from '@/services/features/home.slice'
import { removeOrderState } from '@/services/features/order.slice'
import {
  resetRelocationState,
  setExistingRelocation,
} from '@/services/features/relocation.slice'
import {
  clearTrxState,
  setExistingTrx,
} from '@/services/features/transaction.slice'
import { getProgramConfig } from '@/services/features/workspace.slice'
import {
  authState,
  trxState,
  useAppDispatch,
  useAppSelector,
  workspaceState,
} from '@/services/store'
import mockNotifData from '@/temporary/data/response_app_notifications.json'
import AppStyles from '@/theme/AppStyles'
import colors from '@/theme/colors'
import { filterMenuByRole, getTestID } from '@/utils/CommonUtils'
import { LINK_ELEARNING, MENU_KEYS, MENU_NAMES } from '@/utils/Constants'
import useProgramId from '@/utils/hooks/useProgramId'
import { navigate } from '@/utils/NavigationUtils'
import ListFooter from './component/ListFooter'
import { useAppDataManagement } from './hooks/useAppDataManagement'
import useAppNotifMaterial from './hooks/useAppNotifMaterial'
import {
  checkDraftTransaction,
  loadExistingTransaction,
} from '../inventory/helpers/TransactionHelpers'
import { loadExistingRelocationDraft } from '../order/helpers/OrderHelpers'

export default function HomeScreen() {
  const dispatch = useAppDispatch()
  const [selectedMenu, setSelectedMenu] = useState<number | null>(null)
  const { user } = useAppSelector(authState)
  const { selectedWorkspace } = useAppSelector(workspaceState)
  const programConfig = useAppSelector(getProgramConfig)
  const isCreateRestricted = programConfig?.order?.is_create_restricted ?? false
  const isTransferStockRestricted =
    programConfig?.transaction?.is_transfer_stock_restricted ?? true

  const { draftTrxTypeId } = useAppSelector(trxState)

  const { notifMaterialData, isLoadingNotifMaterial, refetchAppNotifMaterial } =
    useAppNotifMaterial()
  const {
    orderNotif,
    isLoading: isLoadingOrderNotif,
    refetch: refetchOrderNotif,
  } = useOrderNotif()
  const [fetchNotificationCount] = useLazyGetNotificationCountQuery()
  const { isLoadingAppData, handleRefreshAppData } = useAppDataManagement()
  const programId = useProgramId()

  const isLoading = [
    isLoadingAppData,
    isLoadingNotifMaterial,
    isLoadingOrderNotif,
  ].some(Boolean)

  const { t } = useLanguage()
  const [dialog, setDialog] = useState<
    Omit<ConfirmationDialogProps, 'dismissDialog'>
  >({
    modalVisible: false,
  })

  function refreshProgramData() {
    refetchAppNotifMaterial()
    refetchOrderNotif()
    fetchNotificationCount({})
    handleRefreshAppData()
  }

  function dismissDialog() {
    setDialog({ modalVisible: false })
  }

  function handleOpenElearning() {
    Linking.openURL(LINK_ELEARNING)
  }

  function handleOpenHelpCenter() {
    navigate('HelpCenter')
  }

  function handleToggleAccordion(index: number) {
    setSelectedMenu((current) => (current === index ? null : index))
  }

  const handlePressChildMenu = (item: HomeMenuChildItem) => {
    if (checkDraftTransaction(item.transactionType, draftTrxTypeId)) {
      setDialog({
        modalVisible: true,
        title: t('dialog.information'),
        message: t('dialog.have_transaction_draft'),
        cancelText: t('button.ok'),
        onCancel: dismissDialog,
        cancelProps: { ...getTestID('btn-transaction-draft-dialog') },
      })
      return
    }
    dispatch(setActiveMenu(item))
    navigate(item.key)
  }

  useToolbar({
    title: selectedWorkspace?.name ?? '',
    withDefaultSubtitle: false,
    actions: <ProfileToolbarActions />,
  })

  const filteredMenu = filterMenuByRole(MENU_ITEM, user?.role || 3).map(
    (menu) => {
      // For the 'Order' menu, if 'isCreateRestricted' is true, remove the 'Add Order' submenu item.
      if (menu.key === MENU_KEYS.ORDER.ROOT && isCreateRestricted) {
        return {
          ...menu,
          childs: menu?.childs?.filter(
            (child) => child.name !== MENU_NAMES.ORDER.ADD_ORDER
          ),
        }
      }
      if (menu.key === MENU_KEYS.INVENTORY.ROOT && isTransferStockRestricted) {
        return {
          ...menu,
          childs: menu?.childs?.filter(
            (child) => child.name !== MENU_NAMES.INVENTORY.TRANSFER_STOCK
          ),
        }
      }
      return menu
    }
  )

  const renderHeader = () => {
    return (
      <View className='gap-y-1'>
        <Text className={AppStyles.labelRegular}>{t('home.account')}</Text>
        <Text className={AppStyles.textBold}>{user?.entity?.name}</Text>
        <Text className={AppStyles.textRegular}>{user?.entity.location}</Text>
      </View>
    )
  }

  const renderFooter = () => {
    return (
      <View>
        <ListFooter
          testID='listfooter-elearning'
          name={t('home.elearning')}
          Icon={Icons.IcElearning}
          onPress={handleOpenElearning}
        />
        <ListFooter
          testID='listfooter-help-center'
          name={t('help_center.title')}
          Icon={Icons.IcHelpCenter}
          onPress={handleOpenHelpCenter}
        />
      </View>
    )
  }

  const renderItem = ({ item, index }) => {
    const isOpen = selectedMenu === index
    const data = { notifData: orderNotif ?? mockNotifData, menuName: item.name }
    const isInventory = item.key === MENU_KEYS.INVENTORY.ROOT

    return (
      <Accordion
        testID={`accordion-${item.name}`}
        name={t(item.name)}
        childs={item.childs}
        isOpen={isOpen}
        notif={data}
        notifMaterial={isInventory ? notifMaterialData : undefined}
        onToggleAccordion={() => handleToggleAccordion(index)}
        onPressChild={handlePressChildMenu}
      />
    )
  }

  useEffect(() => {
    async function loadDraft() {
      if (!selectedWorkspace) return
      await loadExistingTransaction(programId, (trxDraft) => {
        dispatch(setExistingTrx(trxDraft))
      })

      await loadExistingRelocationDraft(programId, (relocationDraft) => {
        dispatch(setExistingRelocation(relocationDraft))
      })
    }

    loadDraft()
    return () => {
      dispatch(clearTrxState())
      dispatch(removeOrderState()) //order regular
      dispatch(removeOrdersState()) //order dist & return
      dispatch(resetRelocationState())
    }
  }, [selectedWorkspace, dispatch, programId])

  return (
    <React.Fragment>
      <View className='flex-1 bg-white'>
        <FlatList
          showsVerticalScrollIndicator={false}
          data={filteredMenu}
          renderItem={renderItem}
          ListHeaderComponent={renderHeader}
          contentContainerClassName='p-4 gap-y-4'
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={refreshProgramData}
              colors={[colors.bluePrimary]}
            />
          }
        />
        {renderFooter()}
        <LoadingDialog
          testID='loadingdialog-load-notif'
          modalVisible={isLoading}
        />
      </View>
      <ConfirmationDialog dismissDialog={dismissDialog} {...dialog} />
    </React.Fragment>
  )
}
