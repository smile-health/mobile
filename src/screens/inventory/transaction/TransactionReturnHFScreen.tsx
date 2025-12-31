import React, { useCallback, useMemo, useState } from 'react'
import { View, Text } from 'react-native'
import { FormProvider } from 'react-hook-form'
import { FlatList } from 'react-native-gesture-handler'
import { Icons } from '@/assets/icons'
import { Button } from '@/components/buttons'
import EmptyState from '@/components/EmptyState'
import ListTitle from '@/components/list/ListTitle'
import LoadingDialog from '@/components/LoadingDialog'
import { RefreshHomeAction } from '@/components/toolbar/actions/RefreshHomeAction'
import { useToolbar } from '@/components/toolbar/hooks/useToolbar'
import { useLanguage } from '@/i18n/useLanguage'
import { CreateTransaction } from '@/models/transaction/TransactionCreate'
import { AppStackScreenProps } from '@/navigators'
import { useGetRabiesSequenceQuery } from '@/services/apis/vaccine-sequence.api'
import { homeState, useAppSelector } from '@/services/store'
import AppStyles from '@/theme/AppStyles'
import colors from '@/theme/colors'
import { cn } from '@/theme/theme-config'
import { getTestID } from '@/utils/CommonUtils'
import { calculateTotalQty } from '@/utils/helpers/material/commonHelper'
import PatientDetailBottomSheet, {
  TransactionPatientDetail,
} from '../component/transaction/PatientInfo/PatientDetailBottomSheet'
import ReturnHealthFacilityFilter from '../component/transaction/ReturnHF/ReturnHealthFacilityFilter'
import ReturnHFBottomSheet from '../component/transaction/ReturnHF/ReturnHFBottomSheet'
import TransactionConsumptionItem from '../component/transaction/ReturnHF/TransactionConsumptionItem'
import useReturnHFTransaction from '../hooks/transactionCreate/useTransactionReturnHF'

interface Props extends AppStackScreenProps<'TransactionReturnHF'> {}

const TransactionConsumptionListHeader = ({
  itemCount,
}: {
  itemCount: number
}) => {
  const { t } = useLanguage()
  return (
    <React.Fragment>
      <View className='flex-row bg-lightestBlue p-2 rounded-sm border-bluePrimary border gap-2'>
        <Icons.IcInfo height={16} width={16} fill={colors.marine} />
        <Text className={cn(AppStyles.textRegularSmall, 'flex-1')}>
          {t('transaction.please_select_transaction_return')}
        </Text>
      </View>
      <ListTitle
        title={t('label.consumption_list')}
        className='px-0'
        itemCount={itemCount}
      />
    </React.Fragment>
  )
}

function TransactionReturnHFScreen({ route }: Props) {
  const { stock: stockMaterial } = route.params
  const { activeMenu } = useAppSelector(homeState)
  const { t } = useLanguage()
  useGetRabiesSequenceQuery()

  const {
    methods,
    filter,
    activity,
    shouldShowLoading,
    transactionList,
    savedTrxIds,
    currentTrxIds,
    isDisableSave,
    handleApplyFilter,
    handleRefreshList,
    handleLoadMore,
    checkIsSelected,
    handleSelectItem,
    handleDeleteItem,
    handleSubmit,
  } = useReturnHFTransaction()

  const [isOpenReturnHFForm, setIsOpenReturnHFForm] = useState(false)
  const [isOpenPatientDetail, setIsOpenPatientDetail] = useState(false)
  const [patientDetailProps, setPatientDetailProps] =
    useState<TransactionPatientDetail>({
      materialName: stockMaterial.material.name,
      activityName: activity.name,
    })

  const { selectedTrx } = methods.watch()

  const hasSavedTransaction = savedTrxIds.length > 0
  const showNewSelected = hasSavedTransaction && currentTrxIds.length > 0

  const transactionQty = useMemo(
    () => calculateTotalQty(selectedTrx, 'change_qty'),
    [selectedTrx]
  )

  useToolbar({
    title: t(activeMenu?.name ?? '', activeMenu?.key ?? ''),
    actions: <RefreshHomeAction onRefresh={handleRefreshList} />,
  })

  const toggleReturnHFFormSheet = () => {
    setIsOpenReturnHFForm((prev) => !prev)
  }

  const togglePatientDetailSheet = () => {
    setIsOpenPatientDetail((prev) => !prev)
  }

  const handleOpenPatientDetail = useCallback((data: CreateTransaction) => {
    setPatientDetailProps((prev) => ({ ...prev, data }))
    togglePatientDetailSheet()
  }, [])

  const renderItem = useCallback(
    ({ item }) => {
      return savedTrxIds.includes(item.id) ? null : (
        <TransactionConsumptionItem
          item={item}
          selected={checkIsSelected(item.id)}
          onPress={handleSelectItem}
          onPressDetailPatient={handleOpenPatientDetail}
          testID={`TransactionConsumptionItem-${item.id}`}
        />
      )
    },
    [checkIsSelected, handleOpenPatientDetail, handleSelectItem, savedTrxIds]
  )

  const renderEmpty = () => (
    <View className='flex-1 h-full items-center'>
      <EmptyState
        Icon={Icons.IcEmptyStateOrder}
        title={t('empty_state.no_data_available')}
        subtitle={t('empty_state.no_data_message')}
        testID='empty-state-transaction-consumption'
      />
    </View>
  )

  return (
    <FormProvider {...methods}>
      <ReturnHealthFacilityFilter filter={filter} onApply={handleApplyFilter} />
      <FlatList
        data={transactionList}
        showsHorizontalScrollIndicator={false}
        contentContainerClassName='flex-grow p-4'
        initialNumToRender={5}
        onEndReachedThreshold={0.5}
        onEndReached={handleLoadMore}
        renderItem={renderItem}
        ListEmptyComponent={renderEmpty}
        ListHeaderComponent={
          <TransactionConsumptionListHeader
            itemCount={transactionList.length}
          />
        }
      />
      <ReturnHFBottomSheet
        name='ReturnHFBottomSheet'
        isOpen={isOpenReturnHFForm}
        toggleSheet={toggleReturnHFFormSheet}
        onDeleteItem={handleDeleteItem}
        onSubmit={handleSubmit}
        onPressDetailPatient={handleOpenPatientDetail}
        transactionCount={selectedTrx.length}
        transactionQty={transactionQty}
        isDisableSave={isDisableSave}
      />
      <PatientDetailBottomSheet
        name='PatientDetailBottomSheet'
        isOpen={isOpenPatientDetail}
        toggleSheet={togglePatientDetailSheet}
        {...patientDetailProps}
      />
      {selectedTrx.length > 0 && (
        <View className='flex-row p-4 bg-white gap-x-1 border-t border-quillGrey'>
          <Icons.IcFlag height={16} width={16} />
          <View className='flex-1'>
            <Text className={cn(AppStyles.labelRegular, 'text-scienceBlue')}>
              {t('label.num_transaction_selected', {
                num: hasSavedTransaction
                  ? savedTrxIds.length
                  : currentTrxIds.length,
              })}
            </Text>
            {showNewSelected && (
              <Text className={AppStyles.textBoldSmall}>
                {t('label.num_new_transaction_selected', {
                  num: currentTrxIds.length,
                })}
              </Text>
            )}
          </View>
          <Button
            text={t('label.enter_return')}
            textClassName='text-main font-mainBold'
            onPress={toggleReturnHFFormSheet}
            {...getTestID('btn-enter-return')}
          />
        </View>
      )}
      <LoadingDialog
        testID='loadingdialog-transaction-consumption'
        modalVisible={shouldShowLoading}
      />
    </FormProvider>
  )
}

export default TransactionReturnHFScreen
