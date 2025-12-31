import React, { useCallback, useEffect, useMemo } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  SectionList,
  View,
  Text,
  Pressable,
} from 'react-native'
import { FormProvider } from 'react-hook-form'
import { Icons } from '@/assets/icons'
import { Button } from '@/components/buttons'
import EmptyState from '@/components/EmptyState'
import HeaderMaterial from '@/components/header/HeaderMaterial'
import { AppStackScreenProps } from '@/navigators'
import AppStyles, { flexStyle } from '@/theme/AppStyles'
import colors from '@/theme/colors'
import { cn } from '@/theme/theme-config'
import { getTestID } from '@/utils/CommonUtils'
import CreateStockTakingHeader from './components/CreateStockTakingHeader'
import DetailActivityBottomSheet from './components/DetailActivityBottomSheet'
import StockTakingFormItem from './components/StockTakingFormItem'
import {
  getHeaderMaterialProps,
  getSortedStockTakingItems,
} from './helpers/StockTakingHelpers'
import { useStockTakingForm } from './hooks/useStockTakingForm'

const footerStyle = {
  borderTopWidth: 8,
  borderBottomWidth: 36,
  borderColor: colors.lightBlueGray,
}

interface Props extends AppStackScreenProps<'CreateStockTaking'> {}
export default function CreateStockTakingScreen({
  route: { params },
  navigation,
}: Props) {
  const {
    t,
    periodName,
    parentMaterial,
    detail,
    methods,
    sections,
    activityList,
    isOpen,
    toggleSheet,
    handleAddDetail,
    handleAddNewBatch,
    handleViewHistory,
    handleSave,
  } = useStockTakingForm()

  const buttonConfig = useMemo(() => {
    return {
      label: t(detail.isBatch ? 'button.new_batch' : 'label.detail'),
      onPress: detail.isBatch ? handleAddNewBatch : toggleSheet,
      testID: detail.isBatch ? 'batch' : 'detail',
    }
  }, [detail.isBatch, handleAddNewBatch, t, toggleSheet])

  const headerProps = useMemo(
    () => getHeaderMaterialProps(detail, parentMaterial),
    [detail, parentMaterial]
  )

  const renderStockTakingFormItem = useCallback(({ index }) => {
    return <StockTakingFormItem index={index} />
  }, [])

  const renderSectionHeader = useCallback(
    ({ section }) => {
      return (
        <View className='m-4'>
          {detail.isBatch && (
            <Text className={cn(AppStyles.labelBold, 'text-sm')}>
              {section.title}
            </Text>
          )}
          {section.data.length === 0 && (
            <View className='flex-1 items-center mt-14'>
              <EmptyState
                Icon={Icons.IcEmptyStateOrder}
                title={t('empty_state.no_data_available')}
                subtitle={t('empty_state.no_data_message')}
                testID='empty-state-stock-taking-stocks'
              />
            </View>
          )}
        </View>
      )
    },
    [detail.isBatch, t]
  )

  const renderHeader = useCallback(() => {
    return <CreateStockTakingHeader {...headerProps} />
  }, [headerProps])

  const renderFooter = useCallback(() => {
    return (
      <View className='bg-white px-4 py-2 gap-y-2' style={footerStyle}>
        <Text className={cn(AppStyles.labelBold, 'text-sm')}>
          {t('stock_taking.stock_taking_history')}
        </Text>
        <Pressable
          onPress={handleViewHistory}
          className='flex-row items-center gap-x-2 py-2'
          {...getTestID('btn-view-stock-taking-history')}>
          <Icons.IcClockRewind color={colors.main()} height={20} width={20} />
          <Text className={cn(AppStyles.textRegular, 'text-main')}>
            {t('stock_taking.view_stock_taking')}
          </Text>
        </Pressable>
      </View>
    )
  }, [handleViewHistory, t])

  useEffect(() => {
    if (params?.newBatch) {
      const currentItems = methods.getValues('items')
      const allItems = getSortedStockTakingItems([
        ...currentItems,
        params.newBatch,
      ])

      methods.setValue('items', allItems)
    }
  }, [detail.stocks, methods, params?.newBatch])

  useEffect(() => {
    if (params?.deleteAll) {
      methods.setValue('items', detail.stocks)
      navigation.setParams({ deleteAll: false })
    }
  }, [detail.stocks, methods, navigation, params?.deleteAll])

  return (
    <View className='flex-1 bg-lightBlueGray'>
      <HeaderMaterial
        items={[{ label: t('label.period'), value: periodName }]}
      />
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
            contentContainerClassName='bg-white'
          />
        </FormProvider>
        <View className='flex-row px-4 py-5 bg-white border-whiteTwo border-t gap-x-2'>
          <Button
            preset='outlined-primary'
            containerClassName='flex-1 gap-x-2'
            text={buttonConfig.label}
            LeftIcon={Icons.IcAdd}
            leftIconColor={colors.main()}
            leftIconSize={20}
            onPress={buttonConfig.onPress}
            {...getTestID(`btn-add-stock-taking-${buttonConfig.testID}`)}
          />
          <Button
            preset='filled'
            containerClassName='flex-1 gap-x-2'
            text={t('button.save')}
            leftIconColor={colors.mainText()}
            LeftIcon={Icons.IcCheck}
            leftIconSize={20}
            onPress={handleSave}
            {...getTestID('btn-save-stock-taking')}
          />
        </View>
      </KeyboardAvoidingView>
      <DetailActivityBottomSheet
        isOpen={isOpen}
        toggleSheet={toggleSheet}
        activities={activityList}
        onSelectActivty={handleAddDetail}
      />
    </View>
  )
}
