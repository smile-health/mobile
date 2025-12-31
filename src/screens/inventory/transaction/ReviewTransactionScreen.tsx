import React, { useCallback, useMemo, useState } from 'react'
import { Text, View, FlatList } from 'react-native'
import { FormProvider } from 'react-hook-form'
import { Icons } from '@/assets/icons'
import InputDate from '@/components/forms/InputDate'
import EntityActivityHeader from '@/components/header/EntityActivityHeader'
import LoadingDialog from '@/components/LoadingDialog'
import ScreenFooterActions from '@/components/view/ScreenFooterActions'
import { useLanguage } from '@/i18n/useLanguage'
import { useGetRabiesSequenceQuery } from '@/services/apis/vaccine-sequence.api'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import { dateToString } from '@/utils/CommonUtils'
import { DATE_FILTER_FORMAT } from '@/utils/Constants'
import { stringToDate } from '@/utils/DateFormatUtils'
import PatientDetailBottomSheet, {
  TransactionPatientDetail,
} from '../component/transaction/PatientInfo/PatientDetailBottomSheet'
import PatientOtherSequenceBottomSheet from '../component/transaction/PatientInfo/PatientOtherSequenceBottomSheet'
import ReviewTransactionItem from '../component/transaction/ReviewTransactionItem'
import useReviewTransaction from '../hooks/useReviewTransaction'

export default function ReviewTransactionScreen() {
  const { t } = useLanguage()

  const {
    isLoading,
    activity,
    customer,
    transactionItems,
    actualDateLabel,
    actualDate,
    methods,
    isOpenCompletedSequence,
    closeCompletedSequenceSheet,
    handleSubmitOtherSequence,
    setActualDate,
    handleClearTransaction,
    handleDeleteItem,
    handleSubmitTransaction,
  } = useReviewTransaction()

  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false)
  const [isOpenPatientDetail, setIsOpenPatientDetail] = useState(false)
  const [patientDetailProps, setPatientDetailProps] =
    useState<TransactionPatientDetail>({})

  useGetRabiesSequenceQuery()

  const togglePatientDetailSheet = () => {
    setIsOpenPatientDetail((prev) => !prev)
  }

  const handleOpenPatientDetail = useCallback(
    (data: TransactionPatientDetail) => {
      setPatientDetailProps(data)
      togglePatientDetailSheet()
    },
    []
  )

  const openDeleteAllDialog = () => {
    setShowDeleteAllDialog(true)
  }

  const dismissDeleteAllDialog = () => {
    setShowDeleteAllDialog(false)
  }

  const handleDeleteTransaction = () => {
    handleClearTransaction(() => {
      dismissDeleteAllDialog()
    })
  }

  const memoizedActualDate = useMemo(() => {
    return actualDate ? stringToDate(actualDate) : undefined
  }, [actualDate])

  const handleChangeDate = useCallback(
    (val: Date) => {
      if (setActualDate) {
        setActualDate(dateToString(val, DATE_FILTER_FORMAT))
      }
    },
    [setActualDate]
  )

  const renderHeader = () => {
    return (
      <View className={cn(AppStyles.rowBetween, 'mb-2')}>
        <Text className={AppStyles.textBold}>
          {t('transaction.review_and_submit_transaction')}
        </Text>
        <Text className={AppStyles.labelRegular}>
          {t('label.total')}{' '}
          <Text className={'font-mainBold'}>
            {t('label.count_items', { count: transactionItems.length })}
          </Text>
        </Text>
      </View>
    )
  }

  const renderItem = ({ item, index }) => {
    return (
      <ReviewTransactionItem
        item={item}
        testID={`ReviewTransactionItem-${index}`}
        onDelete={handleDeleteItem}
        onPressDetailPatient={handleOpenPatientDetail}
      />
    )
  }

  return (
    <View className='flex-1 flex-col bg-lightBlueGray'>
      <EntityActivityHeader
        activityName={activity.name}
        entityName={customer?.name}
      />
      <FlatList
        data={transactionItems}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        showsVerticalScrollIndicator={false}
        contentContainerClassName='p-4'
      />
      {actualDateLabel && (
        <View className='p-4 bg-white border-y border-quillGrey'>
          <Text className={AppStyles.textBold}>{t(actualDateLabel)}</Text>
          <InputDate
            date={memoizedActualDate}
            placeholder={t('default_date_placeholder')}
            maximumDate={new Date()}
            className='flex-none'
            onDateChange={handleChangeDate}
            helper={t('transaction.helpers.selected_actual_date')}
            isMandatory
          />
        </View>
      )}
      <ScreenFooterActions
        primaryAction={{
          text: t('button.send'),
          onPress: handleSubmitTransaction,
          LeftIcon: Icons.IcArrowForward,
          testID: 'btn-submit-transaction',
        }}
        secondaryAction={{
          text: t('button.delete_all'),
          onPress: openDeleteAllDialog,
          LeftIcon: Icons.IcDelete,
          testID: 'btn-delete-all-transaction',
        }}
        confirmationDialog={{
          title: t('dialog.delete_all_item'),
          message: t('dialog.delete_all'),
          isVisible: showDeleteAllDialog,
          onCancel: dismissDeleteAllDialog,
          onConfirm: handleDeleteTransaction,
        }}
      />
      <PatientDetailBottomSheet
        name='PatientDetailBottomSheet'
        isOpen={isOpenPatientDetail}
        toggleSheet={togglePatientDetailSheet}
        {...patientDetailProps}
      />
      <FormProvider {...methods}>
        <PatientOtherSequenceBottomSheet
          name='PatientOtherSequenceBottomSheet'
          isOpen={isOpenCompletedSequence}
          toggleSheet={closeCompletedSequenceSheet}
          onApply={handleSubmitOtherSequence}
        />
      </FormProvider>
      <LoadingDialog
        modalVisible={isLoading}
        testID='Loadingdialog-submit-transaction'
      />
    </View>
  )
}
