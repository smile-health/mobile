import React, { useCallback, useMemo, useState } from 'react'
import { FlatList, View, KeyboardAvoidingView } from 'react-native'
import { useForm } from 'react-hook-form'
import { Icons } from '@/assets/icons'
import { Button } from '@/components/buttons'
import { ConfirmationDialog } from '@/components/dialog/ConfirmationDialog'
import { ActivityHeader } from '@/components/header/ActivityHeader'
import LoadingDialog from '@/components/LoadingDialog'
import { flexStyle } from '@/theme/AppStyles'
import colors from '@/theme/colors'
import { getTestID, isIOS, showError } from '@/utils/CommonUtils'
import ReviewDisposalFooter from '../components/ReviewDisposalFooter'
import ReviewDisposalHeader from '../components/ReviewDisposalHeader'
import ReviewItemDisposal from '../components/ReviewItemDisposal'
import { DISPOSAL_TYPE } from '../disposal-constant'
import useReviewSelfDisposal from '../hooks/useReviewSelfDisposal'

export default function ReviewSelfDisposalScreen() {
  const { t, activity, disposalItems, isLoading, submitData } =
    useReviewSelfDisposal()
  // 1. React Hook Form for disposal report number & comment
  const { control, watch } = useForm({
    defaultValues: {
      disposalReportNumber: '',
      comment: '',
    },
  })
  const { disposalReportNumber, comment } = watch()

  // 2. State for dialog
  const [dialogVisible, setDialogVisible] = useState(false)

  // 3.  triggers submit dialog
  const handleReviewSelfDisposal = () => {
    if (!disposalReportNumber) {
      showError(t('disposal.validation.empty_report_number'))
      return
    }
    setDialogVisible(true)
  }

  // 4. Confirm dialog: On Yes, proceed with disposal logic
  const handleDialogYes = () => {
    setDialogVisible(false)
    // Pass form data to submitData to send the correct payload
    submitData(disposalReportNumber, comment)
  }

  // 5. Cancel just closes dialog
  const handleDialogCancel = () => {
    setDialogVisible(false)
  }

  const renderHeader = useCallback(() => {
    return (
      <ReviewDisposalHeader
        control={control}
        totalItem={disposalItems.length}
        title={t('title.review_self_disposal')}
      />
    )
  }, [control, disposalItems.length, t])

  const renderItem = useCallback(
    ({ item }) => <ReviewItemDisposal item={item} type={DISPOSAL_TYPE.SELF} />,
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
        <ActivityHeader name={activity.name} />
        <FlatList
          data={disposalItems}
          renderItem={renderItem}
          ListHeaderComponent={renderHeader}
          ListFooterComponent={renderFooter}
          showsVerticalScrollIndicator={false}
          contentContainerClassName='bg-white'
          removeClippedSubviews={false}
        />
        <View className='p-4 bg-white border-t border-paleGreyTwo'>
          <Button
            text={t('disposal.process_self_disposal')}
            onPress={handleReviewSelfDisposal}
            preset='filled'
            containerClassName='gap-x-2'
            leftIconColor={colors.mainText()}
            LeftIcon={Icons.IcArrowForward}
            {...getTestID('btn-submit-self-disposal')}
          />
        </View>
        <ConfirmationDialog
          modalVisible={dialogVisible}
          title={t('disposal.confirm_self_disposal')}
          message={t('disposal.confirm_self_disposal_desc')}
          confirmText={t('button.yes')}
          cancelText={t('button.cancel')}
          dismissDialog={handleDialogCancel}
          onCancel={handleDialogCancel}
          onConfirm={handleDialogYes}
          cancelProps={{
            containerClassName: 'rounded border border-main px-3 py-2',
            textClassName: 'text-main',
            ...getTestID('btn-cancel-submit-self-disposal'),
          }}
          confirmProps={{
            containerClassName: 'rounded bg-main px-3 py-2',
            textClassName: 'text-mainText',
            ...getTestID('btn-confirm-submit-self-disposal'),
          }}
        />
        <LoadingDialog
          modalVisible={isLoading}
          testID='loading-dialog-submit-self-disposal'
        />
      </View>
    </KeyboardAvoidingView>
  )
}
