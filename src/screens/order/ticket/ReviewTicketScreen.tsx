import React, { useCallback } from 'react'
import {
  FlatList,
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { ParseKeys } from 'i18next'
import { Controller } from 'react-hook-form'
import { Icons } from '@/assets/icons'
import { Button, CheckBox } from '@/components/buttons'
import { ConfirmationDialog } from '@/components/dialog/ConfirmationDialog'
import LoadingDialog from '@/components/LoadingDialog'
import { useLanguage } from '@/i18n/useLanguage'
import {
  getTicketMaterials,
  getTicketFormData,
  getReasons,
} from '@/services/features/ticketReason.slice'
import { useAppSelector } from '@/services/store'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import { getTestID } from '@/utils/CommonUtils'
import OrderCommentSection from '../component/section/OrderCommentSection'
import ReviewTicketHeader from '../component/ticket/ReviewTicketHeader'
import ReviewTicketItem from '../component/ticket/ReviewTicketItem'
import { useReviewTicket } from '../hooks/useReviewTicket'

export default function ReviewTicketScreen() {
  const { t } = useLanguage()
  const ticketMaterials = useAppSelector(getTicketMaterials)
  const ticketFormData = useAppSelector(getTicketFormData)
  const reasonOptions = useAppSelector(getReasons)

  const {
    isLoading,
    showConfirm,
    setShowConfirm,
    showDeleteAllConfirm,
    setShowDeleteAllConfirm,
    handleDeleteMaterial,
    handleDeleteAll,
    confirmDeleteAll,
    onSend,
    control,
    errors,
    requestCancelValue,
  } = useReviewTicket({ ticketMaterials, ticketFormData })

  const renderHeader = useCallback(
    () => (
      <ReviewTicketHeader
        ticketFormData={ticketFormData}
        ticketMaterials={ticketMaterials}
        t={t}
      />
    ),
    [ticketFormData, ticketMaterials, t]
  )

  const renderItem = useCallback(
    ({ item }) => (
      <ReviewTicketItem
        item={item}
        t={t}
        reasonOptions={reasonOptions}
        handleDelete={handleDeleteMaterial}
      />
    ),
    [t, reasonOptions, handleDeleteMaterial]
  )

  const isShowMessageError =
    requestCancelValue === false && ticketFormData?.isSubmitted === 1

  const renderFooter = useCallback(
    () => (
      <View>
        {ticketFormData?.isSubmitted === 1 && (
          <View className='bg-white my-2'>
            <View className='bg-lightBlueGray w-full h-2' />
            <View className='p-4'>
              <View>
                <Controller
                  name='requestCancel'
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <CheckBox
                      checked={value}
                      onPress={() => onChange(!value)}
                      text={t('label.request_to_cancel_the_order')}
                      testID='checkbox-request-cancel'
                    />
                  )}
                />
                {isShowMessageError && (
                  <Text className='text-red-500 text-xs mt-1 ml-8'>
                    {t('validation.required')}
                  </Text>
                )}
              </View>
            </View>
          </View>
        )}
        <OrderCommentSection t={t} control={control} errors={errors} />
      </View>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ticketFormData?.isSubmitted, control, requestCancelValue, t, errors]
  )

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className='flex-1 bg-lightBlueGray'>
      <FlatList
        data={ticketMaterials}
        keyExtractor={(item) => String(item?.id)}
        ListHeaderComponent={renderHeader}
        renderItem={renderItem}
        className='bg-white'
        ListFooterComponent={renderFooter}
      />
      <View className='p-4 border-whiteTwo mt-auto border-t bg-white flex-row justify-between'>
        <Button
          preset='outlined'
          textClassName={cn(AppStyles.textMedium, 'text-primary-dark ml-1')}
          containerClassName='flex-1 mr-2 border-primary-dark'
          text={t('button.delete_all')}
          LeftIcon={Icons.IcClose}
          onPress={handleDeleteAll}
          {...getTestID('btn-delete-all')}
        />
        <Button
          preset='filled'
          textClassName={cn(AppStyles.textMedium, 'text-white ml-1')}
          containerClassName='flex-1 ml-2'
          text={t('button.send')}
          LeftIcon={Icons.IcArrowForward}
          onPress={() => setShowConfirm(true)}
          {...getTestID('btn-send')}
        />
      </View>

      <ConfirmationDialog
        modalVisible={showConfirm}
        title={t('dialog.confirm_send_ticket')}
        message={t('dialog.confirm_send_ticket_message')}
        confirmText={t('button.yes')}
        cancelText={t('button.cancel')}
        onConfirm={onSend}
        onCancel={() => setShowConfirm(false)}
        dismissDialog={() => setShowConfirm(false)}
        cancelProps={{
          containerClassName: 'rounded-md border border-main px-3 py-2',
          textClassName: 'text-main px-2',
          ...getTestID('btn-cancel-send-ticket'),
        }}
        confirmProps={{
          containerClassName: 'rounded-md bg-main px-4 py-2',
          textClassName: 'text-white',
          ...getTestID('btn-confirm-send-ticket'),
        }}
      />

      <ConfirmationDialog
        modalVisible={showDeleteAllConfirm}
        title={t('dialog.confirm_delete_all_materials')}
        message={t('dialog.confirm_delete_all_materials_message')}
        confirmText={t('button.yes')}
        cancelText={t('button.cancel')}
        onConfirm={confirmDeleteAll}
        onCancel={() => setShowDeleteAllConfirm(false)}
        dismissDialog={() => setShowDeleteAllConfirm(false)}
        cancelProps={{
          containerClassName: 'rounded-md border border-primary-dark px-3 py-2',
          textClassName: 'text-primary-dark px-2',
          ...getTestID('btn-cancel-delete-all'),
        }}
        confirmProps={{
          containerClassName: 'rounded-md bg-main px-4 py-2',
          textClassName: 'text-white',
          ...getTestID('btn-confirm-delete-all'),
        }}
      />

      <LoadingDialog
        modalVisible={isLoading}
        title={t('dialog.hang_tight') as ParseKeys}
        message={t('dialog.processing_message')}
        containerClassName='p-6'
        titleClassName={cn('mt-4', AppStyles.textMediumMedium)}
        messageClassName={cn(AppStyles.textRegularSmall, 'text-mediumGray')}
        testID='loading-dialog-review-ticket'
      />
    </KeyboardAvoidingView>
  )
}
