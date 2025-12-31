import React, { useCallback } from 'react'
import { FlatList, KeyboardAvoidingView, View } from 'react-native'
import { FormProvider } from 'react-hook-form'
import { Icons } from '@/assets/icons'
import { Button } from '@/components/buttons'
import ListTitle from '@/components/list/ListTitle'
import LoadingDialog from '@/components/LoadingDialog'
import { useToolbar } from '@/components/toolbar/hooks/useToolbar'
import { useLanguage } from '@/i18n/useLanguage'
import { AppStackScreenProps } from '@/navigators'
import AppStyles, { flexStyle } from '@/theme/AppStyles'
import colors from '@/theme/colors'
import { cn } from '@/theme/theme-config'
import { getTestID, isIOS } from '@/utils/CommonUtils'
import ReceiveShipmentFooter from '../components/shipment-list/ReceiveShipmentFooter'
import ReceiveShipmentMaterialItem from '../components/shipment-list/ReceiveShipmentMaterialItem'
import ShipmentStatusConfirmationDialog from '../components/shipment-list/ShipmentStatusConfirmationDialog'
import { DISPOSAL_STATUS } from '../disposal-constant'
import useReceiveDisposalShipment from '../hooks/useReceiveDisposalShipment'

interface Props extends AppStackScreenProps<'ReceiveDisposalShipment'> {}

export default function ReceiveDisposalShipmentScreen({ route }: Props) {
  const { t } = useLanguage()
  const { data } = route.params

  const {
    methods,
    disposalItems,
    isSaveDisabled,
    isOpenDialog,
    isLoading,
    openDialog,
    closeDialog,
    confirmSubmitReceive,
  } = useReceiveDisposalShipment(data)

  const renderHeader = useCallback(() => {
    return (
      <ListTitle
        title={t('label.item')}
        className='pb-0'
        itemCount={disposalItems.length}
      />
    )
  }, [disposalItems.length, t])

  const renderItem = useCallback(({ item, index }) => {
    return <ReceiveShipmentMaterialItem data={item} index={index} />
  }, [])

  const renderFooter = useCallback(() => {
    return <ReceiveShipmentFooter />
  }, [])

  useToolbar({ title: `${t('disposal.disposal_shipment')}: ${data.id}` })

  return (
    <KeyboardAvoidingView
      behavior={isIOS ? 'padding' : 'height'}
      style={flexStyle}>
      <View className='flex-1 bg-lightBlueGray'>
        <FormProvider {...methods}>
          <FlatList
            data={disposalItems}
            renderItem={renderItem}
            ListHeaderComponent={renderHeader}
            ListFooterComponent={renderFooter}
            keyExtractor={(item) => String(item.id)}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews={false}
            contentContainerClassName='bg-white gap-y-2'
          />
        </FormProvider>
        <View className='bg-white p-4 border-t border-quillGrey'>
          <Button
            preset='filled'
            text={t('disposal.receive_shipment')}
            onPress={openDialog}
            disabled={isSaveDisabled}
            LeftIcon={Icons.IcCheck}
            leftIconColor={colors.mainText()}
            containerClassName='gap-x-2'
            {...getTestID('btn-submit-receive-disposal-shipment')}
          />
        </View>
        <ShipmentStatusConfirmationDialog
          status={DISPOSAL_STATUS.RECEIVED}
          dialogVisible={isOpenDialog}
          onClose={closeDialog}
          onConfirm={confirmSubmitReceive}
          t={t}
        />
        <LoadingDialog
          modalVisible={isLoading}
          title={'dialog.hang_tight'}
          message={t('dialog.processing_message')}
          containerClassName='p-6'
          titleClassName={cn(AppStyles.textRegular, 'mt-4')}
          messageClassName={AppStyles.labelRegular}
          testID='loading-dialog-receive-disposal-shipment'
        />
      </View>
    </KeyboardAvoidingView>
  )
}
