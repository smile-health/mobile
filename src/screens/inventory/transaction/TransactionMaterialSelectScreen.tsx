import React, { useState } from 'react'
import { View } from 'react-native'
import { useSelector } from 'react-redux'
import { Icons } from '@/assets/icons'
import EntityActivityHeader from '@/components/header/EntityActivityHeader'
import MaterialList from '@/components/list/MaterialList'
import ScreenFooterActions from '@/components/view/ScreenFooterActions'
import { useLanguage } from '@/i18n/useLanguage'
import { AppStackScreenProps } from '@/navigators'
import { clearTransaction } from '@/services/features/transaction.slice'
import {
  trxState,
  useAppDispatch,
  useAppSelector,
  workspaceState,
} from '@/services/store'
import { MATERIAL_LIST_TYPE } from '@/utils/Constants'
import useTransactionMaterials from '../hooks/useTransactionMaterials'

interface Props extends AppStackScreenProps<'TransactionMaterialSelect'> {}
export default function TransactionMaterialSelectScreen({ navigation }: Props) {
  const { selectedWorkspace } = useSelector(workspaceState)
  const { activity, customer, transactions } = useAppSelector(trxState)
  const dispatch = useAppDispatch()

  const shouldShowFooter = transactions.length > 0

  const { materials, handlePressMaterial } = useTransactionMaterials()

  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false)

  const openDeleteAllDialog = () => setShowDeleteAllDialog(true)
  const dismissDeleteAllDialog = () => setShowDeleteAllDialog(false)

  const { t } = useLanguage()

  const handleDeleteTransaction = () => {
    if (selectedWorkspace) {
      dispatch(clearTransaction({ programId: selectedWorkspace.id }))
      dismissDeleteAllDialog()
    }
  }

  const handleNavigateToReview = () => {
    navigation.navigate('ReviewTransaction')
  }

  return (
    <View className='bg-white flex-1'>
      <EntityActivityHeader
        activityName={activity.name}
        entityName={customer?.name}
      />
      <MaterialList
        data={materials}
        transactions={transactions}
        onPressMaterial={handlePressMaterial}
        type={MATERIAL_LIST_TYPE.NORMAL}
      />
      {shouldShowFooter && (
        <ScreenFooterActions
          primaryAction={{
            text: t('button.review'),
            LeftIcon: Icons.IcArrowForward,
            onPress: handleNavigateToReview,
            testID: 'btn-review-transaction',
          }}
          secondaryAction={{
            text: t('button.delete_all'),
            LeftIcon: Icons.IcDelete,
            onPress: openDeleteAllDialog,
            testID: 'btn-delete-all-transaction',
          }}
          confirmationDialog={{
            title: t('dialog.delete_all_item'),
            message: t('dialog.delete_all'),
            isVisible: showDeleteAllDialog,
            onConfirm: handleDeleteTransaction,
            onCancel: dismissDeleteAllDialog,
          }}
        />
      )}
    </View>
  )
}
