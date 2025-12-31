import React, { useCallback, useEffect } from 'react'
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  SectionList,
  Pressable,
} from 'react-native'
import { FormProvider } from 'react-hook-form'
import { Icons } from '@/assets/icons'
import { Button } from '@/components/buttons'
import EmptyState from '@/components/EmptyState'
import { ActivityHeader } from '@/components/header/ActivityHeader'
import LoadingDialog from '@/components/LoadingDialog'
import { AppStackScreenProps } from '@/navigators'
import AppStyles, { flexStyle } from '@/theme/AppStyles'
import colors from '@/theme/colors'
import { cn } from '@/theme/theme-config'
import { getTestID } from '@/utils/CommonUtils'
import CreateReconciliationHeader from './components/CreateReconciliationHeader'
import ReconciliationFormItem from './components/ReconciliationFormItem'
import { useReconciliationForm } from './hooks/useReconciliationForm'

interface Props extends AppStackScreenProps<'CreateReconciliation'> {}
export default function CreateReconciliationScreen({ route }: Props) {
  const {
    t,
    activityName,
    materialName,
    start_date,
    end_date,
    methods,
    sections,
    shouldShowLoading,
    shouldShowData,
    handleSave,
    handleSelectPeriod,
    handleViewHistory,
  } = useReconciliationForm()

  const renderStockTakingFormItem = useCallback(({ index }) => {
    return <ReconciliationFormItem index={index} />
  }, [])

  const renderSectionHeader = useCallback(
    ({ section }) => (
      <View className='m-4'>
        <Text className={cn(AppStyles.labelBold, 'text-sm')}>
          {section.title}
        </Text>
        {section.data.length === 0 && (
          <View className='flex-1 items-center mt-14'>
            <EmptyState
              Icon={Icons.IcEmptyStateOrder}
              title={t('empty_state.no_data_available')}
              subtitle={t('empty_state.no_data_message')}
              testID='empty-state-generated-reconciliation'
            />
          </View>
        )}
      </View>
    ),
    [t]
  )

  const renderHeader = useCallback(() => {
    return (
      <CreateReconciliationHeader
        materialName={materialName}
        startDate={start_date}
        endDate={end_date}
        onSelectDate={handleSelectPeriod}
      />
    )
  }, [end_date, handleSelectPeriod, materialName, start_date])

  const renderEmpty = useCallback(() => {
    return (
      <View className='flex-1 items-center mt-14'>
        <EmptyState
          Icon={Icons.IcEmptyStateOrder}
          title={t('empty_state.no_data_available')}
          subtitle={t('reconciliation.no_period_message')}
          testID='empty-state-generated-reconciliation'
        />
      </View>
    )
  }, [t])

  const renderFooter = useCallback(() => {
    return (
      <View className='bg-white py-2 px-4 gap-y-2'>
        <Text className={cn(AppStyles.textBold, 'text-mediumGray')}>
          {t('reconciliation.history')}
        </Text>
        <Pressable
          onPress={handleViewHistory}
          className='flex-row items-center py-2 gap-x-2'
          {...getTestID('btn-view-reconciliation-history')}>
          <Icons.IcClockRewind height={20} width={20} color={colors.main()} />
          <Text className={cn(AppStyles.textRegular, 'text-main')}>
            {t('reconciliation.view_history')}
          </Text>
        </Pressable>
      </View>
    )
  }, [handleViewHistory, t])

  useEffect(() => {
    if (route.params.formUpdate) {
      const { path, values } = route.params.formUpdate
      methods.setValue(path, values)
    }
  }, [methods, route.params.formUpdate])

  return (
    <View className='flex-1 bg-lightBlueGray'>
      <ActivityHeader name={activityName} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={flexStyle}>
        <FormProvider {...methods}>
          <SectionList
            sections={sections}
            stickySectionHeadersEnabled={false}
            showsVerticalScrollIndicator={false}
            renderItem={renderStockTakingFormItem}
            renderSectionHeader={renderSectionHeader}
            ListHeaderComponent={renderHeader}
            ListFooterComponent={renderFooter}
            ListEmptyComponent={renderEmpty}
            contentContainerClassName='bg-white flex-grow'
          />
        </FormProvider>
        {shouldShowData && (
          <View className='flex-row px-4 py-5 bg-white border-whiteTwo border-t'>
            <Button
              preset='filled'
              containerClassName='flex-1 gap-x-2'
              text={t('button.save')}
              leftIconColor={colors.mainText()}
              LeftIcon={Icons.IcCheck}
              leftIconSize={20}
              onPress={handleSave}
              {...getTestID('btn-save-reconciliation')}
            />
          </View>
        )}
      </KeyboardAvoidingView>
      <LoadingDialog
        modalVisible={shouldShowLoading}
        testID='Loadingdialog-generate-reconciliation'
      />
    </View>
  )
}
