import React from 'react'
import { View } from 'react-native'
import { ConfirmationDialog } from '@/components/dialog/ConfirmationDialog'
import { ActivityHeader } from '@/components/header/ActivityHeader'
import EntityList from '@/components/list/EntityList'
import { useLanguage } from '@/i18n/useLanguage'
import useTransactionCustomerList from '../hooks/useTransactionCustomerList'

export default function TransactionCustomerSelectScreen() {
  const {
    activity,
    customerConsumption,
    customers,
    isOpenModalExistTrx,
    closeModalExistTrx,
    handleSelectCustomer,
  } = useTransactionCustomerList()

  const { t } = useLanguage()

  return (
    <View className='bg-white flex-1'>
      <ActivityHeader name={activity.name} />
      <EntityList
        data={customers}
        entity={customerConsumption}
        onPress={handleSelectCustomer}
        type='customer'
      />
      <ConfirmationDialog
        modalVisible={isOpenModalExistTrx}
        dismissDialog={closeModalExistTrx}
        onCancel={closeModalExistTrx}
        title={t('dialog.information')}
        message={t('dialog.have_transaction_draft')}
        cancelText={t('button.ok')}
      />
    </View>
  )
}
