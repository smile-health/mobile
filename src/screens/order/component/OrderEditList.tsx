import React, { useCallback } from 'react'
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  View,
} from 'react-native'
import { TFunction } from 'i18next'
import { Icons } from '@/assets/icons'
import { Button } from '@/components/buttons'
import { ConfirmationDialog } from '@/components/dialog/ConfirmationDialog'
import LoadingDialog from '@/components/LoadingDialog'
import { ReasonOption } from '@/models/Common'
import AppStyles, { flexStyle } from '@/theme/AppStyles'
import colors from '@/theme/colors'
import { cn } from '@/theme/theme-config'
import { getTestID } from '@/utils/CommonUtils'
import { OrderEditItem } from './OrderEditItem'
import LetterNumberSection from './section/LetterNumberSection'
import OrderCommentSection from './section/OrderCommentSection'
import { OrderEditType } from '../types/order'
interface Props {
  data: any
  comment: string
  renderHeader: () => React.ReactElement
  updateQuantity: (index: number, field: string, value: number | string) => void
  updateReason: (index: number, field: string, value: string) => void
  updateOtherReasonText: (index: number, field: string, value: string) => void
  updateChildQuantity: (
    parentIndex: number,
    childId: number,
    value: string | number
  ) => void
  showReasonDropdown?: boolean
  t: TFunction
  control: any
  errors: any
  isLoading?: boolean
  modalVisible?: boolean
  dismissDialog?: () => void
  onCancel?: () => void
  onConfirm?: () => void
  onPress: () => void
  type: OrderEditType
  dataReason?: ReasonOption[]
  withComment?: boolean
}

export default function OrderEditList({
  data,
  comment,
  renderHeader,
  updateQuantity,
  updateReason,
  updateOtherReasonText,
  updateChildQuantity,
  showReasonDropdown = true,
  t,
  control,
  isLoading = false,
  modalVisible,
  dismissDialog = () => {},
  onCancel,
  onConfirm,
  onPress,
  type,
  dataReason = [],
  withComment = true,
  errors,
}: Readonly<Props>) {
  const getButtonText = (type: OrderEditType) => {
    if (type === 'edit') {
      return t('button.review')
    }
    if (type === 'validate') {
      return t('button.validate_order')
    }
    return t('button.confirm_order')
  }

  const buttonText = getButtonText(type)

  const handleQuantityUpdate = useCallback(
    (index: number, value: number | string) => {
      const updatedData = [...data]
      if (updatedData[index]) {
        updatedData[index] = {
          ...updatedData[index],
          qty: value,
        }
      }
      updateQuantity(index, 'qty', value)
    },
    [data, updateQuantity]
  )

  const renderItem = useCallback(
    ({ item, index }) => {
      return (
        <OrderEditItem
          dataReason={dataReason}
          type={type}
          item={item}
          index={index}
          updateQuantity={(_, value) => {
            handleQuantityUpdate(index, value)
          }}
          updateReason={(_, value) => updateReason(index, 'reason_id', value)}
          updateOtherReasonText={(_, value) => {
            updateOtherReasonText(index, 'other_reason_text', value)
          }}
          updateChildQuantity={(parentIndex, childId, value) => {
            updateChildQuantity(parentIndex, childId, value)
          }}
          showReasonDropdown={showReasonDropdown}
        />
      )
    },
    [
      dataReason,
      type,
      handleQuantityUpdate,
      updateReason,
      updateOtherReasonText,
      updateChildQuantity,
      showReasonDropdown,
    ]
  )

  const renderFooter = useCallback(
    () =>
      withComment ? (
        <>
          {type === 'validate' && (
            <LetterNumberSection t={t} control={control} errors={errors} />
          )}
          <OrderCommentSection t={t} control={control} />
        </>
      ) : null,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [withComment, type, t, control]
  )

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={flexStyle}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 16}>
      <SafeAreaView className='flex-1 bg-paleGrey'>
        <FlatList
          showsVerticalScrollIndicator={false}
          data={data}
          renderItem={renderItem}
          keyExtractor={(item) => `${item.id}`}
          ListHeaderComponent={renderHeader}
          ListFooterComponent={renderFooter}
          contentContainerClassName='bg-white'
          keyboardShouldPersistTaps='handled'
          keyboardDismissMode='none'
          removeClippedSubviews={false}
          extraData={comment}
        />
        <View className='p-4 border-whiteTwo bg-white border-t'>
          <Button
            preset='filled'
            textClassName={cn(AppStyles.textMedium, 'text-white ml-2')}
            text={buttonText}
            LeftIcon={Icons.IcArrowForward}
            leftIconColor={colors.white}
            onPress={onPress}
            testID='btn-confirm-order'
          />
        </View>
        <ConfirmationDialog
          modalVisible={modalVisible}
          dismissDialog={dismissDialog}
          onCancel={onCancel}
          onConfirm={onConfirm}
          title={t('dialog.confirm_order')}
          message={t('dialog.confirm_order_subtitle')}
          cancelText={t('button.cancel')}
          cancelProps={{
            textClassName: 'text-main px-2',
            containerClassName: 'rounded-md border border-main px-3 py-2',
            ...getTestID('btn-cancel-order'),
          }}
          confirmProps={{
            textClassName: 'text-white',
            containerClassName: 'rounded-md border bg-main px-3 py-2',
            ...getTestID('btn-confirm-order'),
          }}
        />
        <LoadingDialog
          testID='loadingdialog-confirm-order'
          modalVisible={isLoading}
        />
      </SafeAreaView>
    </KeyboardAvoidingView>
  )
}
