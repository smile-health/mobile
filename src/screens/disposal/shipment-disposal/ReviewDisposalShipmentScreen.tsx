import React, { useCallback, useMemo, useState } from 'react'
import { FlatList, View, KeyboardAvoidingView } from 'react-native'
import { useForm } from 'react-hook-form'
import { Icons } from '@/assets/icons'
import { Button } from '@/components/buttons'
import { ConfirmationDialog } from '@/components/dialog/ConfirmationDialog'
import LoadingDialog from '@/components/LoadingDialog'
import { flexStyle } from '@/theme/AppStyles'
import colors from '@/theme/colors'
import { getTestID, isIOS, showError } from '@/utils/CommonUtils'
import DisposalShipmentHeader from '../components/DisposalShipmentHeader'
import ReviewDisposalFooter from '../components/ReviewDisposalFooter'
import ReviewDisposalHeader from '../components/ReviewDisposalHeader'
import ReviewItemDisposal from '../components/ReviewItemDisposal'
import { DISPOSAL_TYPE } from '../disposal-constant'
import useReviewDisposalShipment from '../hooks/useReviewDisposalShipment'

export default function ReviewDisposalShipmentScreen() {
  const { t, receiver, disposalItems, isLoading, submitData } =
    useReviewDisposalShipment()
  const [dialogVisible, setDialogVisible] = useState(false)

  const { control, watch } = useForm({
    defaultValues: {
      disposalReportNumber: '',
      comment: '',
    },
  })
  const { disposalReportNumber, comment } = watch()

  const handleReviewDisposalShipment = () => {
    if (!disposalReportNumber) {
      showError(t('disposal.validation.empty_report_number'))
      return
    }
    setDialogVisible(true)
  }

  const handleDialogYes = () => {
    setDialogVisible(false)
    submitData(disposalReportNumber, comment)
  }

  const handleDialogCancel = () => {
    setDialogVisible(false)
  }

  const renderHeader = useCallback(() => {
    return (
      <ReviewDisposalHeader
        title={t('title.review_disposal_shipment')}
        control={control}
        totalItem={disposalItems.length}
        receiver={receiver}
      />
    )
  }, [control, disposalItems.length, receiver, t])

  const renderItem = useCallback(
    ({ item }) => (
      <ReviewItemDisposal item={item} type={DISPOSAL_TYPE.SHIPMENT} />
    ),
    []
  )

  const renderFooter = useMemo(() => {
    return <ReviewDisposalFooter control={control} />
  }, [control])

  return (
    <KeyboardAvoidingView
      behavior={isIOS ? 'padding' : 'height'}
      style={flexStyle}>
      <View className='flex-1 bg-lightBlueGray'>
        <DisposalShipmentHeader t={t} />
        <FlatList
          data={disposalItems}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={false}
          contentContainerClassName='bg-white'
          renderItem={renderItem}
          ListHeaderComponent={renderHeader}
          ListFooterComponent={renderFooter}
        />
        <View className='p-4 bg-white border-t border-paleGreyTwo'>
          <Button
            text={t('disposal.process_disposal_shipment')}
            onPress={handleReviewDisposalShipment}
            preset='filled'
            LeftIcon={Icons.IcArrowForward}
            leftIconColor={colors.mainText()}
            containerClassName='gap-x-2'
            {...getTestID('btn-submit-shipment-disposal')}
          />
        </View>
        <ConfirmationDialog
          modalVisible={dialogVisible}
          title={t('disposal.confirm_disposal_shipment')}
          message={t('disposal.confirm_disposal_shipment_desc')}
          confirmText={t('button.yes')}
          cancelText={t('button.cancel')}
          onConfirm={handleDialogYes}
          onCancel={handleDialogCancel}
          dismissDialog={handleDialogCancel}
          cancelProps={{
            containerClassName: 'rounded border border-main px-3 py-2',
            textClassName: 'text-main',
            ...getTestID('btn-cancel-submit-disposal-shipment'),
          }}
          confirmProps={{
            containerClassName: 'rounded bg-main px-3 py-2',
            textClassName: 'text-mainText',
            ...getTestID('btn-confirm-submit-disposal-shipment'),
          }}
        />
        <LoadingDialog
          modalVisible={isLoading}
          testID='loading-dialog-submit-disposal-shipment'
        />
      </View>
    </KeyboardAvoidingView>
  )
}
