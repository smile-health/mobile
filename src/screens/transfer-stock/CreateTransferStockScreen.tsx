import React, { useCallback, useState } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  SectionList,
  View,
  Text,
} from 'react-native'
import { FormProvider } from 'react-hook-form'
import { Icons } from '@/assets/icons'
import { Button } from '@/components/buttons'
import EmptyState from '@/components/EmptyState'
import PickerSelect from '@/components/filter/PickerSelect'
import HeaderMaterial from '@/components/header/HeaderMaterial'
import LoadingDialog from '@/components/LoadingDialog'
import { RefreshHomeAction } from '@/components/toolbar/actions/RefreshHomeAction'
import { useToolbar } from '@/components/toolbar/hooks/useToolbar'
import { AppStackScreenProps } from '@/navigators'
import AppStyles, { flexStyle } from '@/theme/AppStyles'
import colors from '@/theme/colors'
import { cn } from '@/theme/theme-config'
import { getTestID } from '@/utils/CommonUtils'
import TransferStockFormItem from './components/TransferStockFormItem'
import { getHeaderMaterialProps } from './helpers/TransferStockHelpers'
import useTransferStockForm from './hooks/useTransferStockForm'
import MaterialCard from '../inventory/component/MaterialCard'

interface Props extends AppStackScreenProps<'CreateTransferStock'> {}
export default function CreateTransferStockScreen({ route }: Props) {
  const { material, materials } = route.params
  const {
    t,
    title,
    program,
    methods,
    isBatch,
    sections,
    activities,
    errors,
    destination_activity_id,
    hasNextMaterial,
    isLoadingActivities,
    handleChangeActivity,
    handleNextMaterial,
    handleSaveTransferStock,
    handleRefreshActivities,
  } = useTransferStockForm(materials, material)

  const [selectedStock, setSelectedStock] = useState<number | null>(null)

  const toggleTransferStockBatchItem = useCallback(
    (stockId: number) => {
      if (!isBatch) return
      setSelectedStock(selectedStock === stockId ? null : stockId)
    },
    [isBatch, selectedStock]
  )

  const renderHeader = () => {
    return <MaterialCard {...getHeaderMaterialProps(material)} />
  }

  const renderTransferStockSectionHeader = ({ section }) => {
    return isBatch && section.data.length > 0 ? (
      <Text className={cn(AppStyles.labelBold, 'text-sm m-4 mb-2')}>
        {t(section.title)}
      </Text>
    ) : (
      <View className='px-4 py-2' />
    )
  }

  const renderEmptyTransferStock = () => (
    <View className='flex-1 items-center'>
      <EmptyState
        testID='empty-state-material'
        Icon={Icons.IcEmptyStateOrder}
        title={t('empty_state.no_data_available')}
        subtitle={t('empty_state.no_data_message')}
      />
    </View>
  )

  const renderTransferStockItem = useCallback(
    ({ item, index, section }) => {
      const isSelected = selectedStock === item.stock_id
      return (
        <TransferStockFormItem
          index={index}
          isSelected={isSelected}
          batchType={section.fieldname}
          disableCollapse={!isBatch}
          onToggleDetail={() => toggleTransferStockBatchItem(item.stock_id)}
        />
      )
    },
    [isBatch, selectedStock, toggleTransferStockBatchItem]
  )

  useToolbar({
    title,
    actions: <RefreshHomeAction onRefresh={handleRefreshActivities} />,
  })

  return (
    <FormProvider {...methods}>
      <View className='bg-lightBlueGray flex-1'>
        <HeaderMaterial
          items={[
            {
              label: t('transfer_stock.destination_program'),
              value: program?.name,
            },
          ]}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={flexStyle}>
          <SectionList
            sections={sections}
            stickySectionHeadersEnabled={false}
            ListHeaderComponent={renderHeader}
            ListEmptyComponent={renderEmptyTransferStock}
            renderSectionHeader={renderTransferStockSectionHeader}
            renderItem={renderTransferStockItem}
            contentContainerClassName='pb-6 bg-white flex-grow'
          />
          <View className='bg-white border-whiteTwo border-y p-4 gap-y-2'>
            <Text className={AppStyles.textBold}>
              {t('transfer_stock.select_destination_activity')}
            </Text>
            <PickerSelect
              value={destination_activity_id}
              name='destination_activity_id'
              className='flex-none'
              data={activities}
              title={t('transfer_stock.select_destination_activity')}
              label={t('transfer_stock.destination_activity')}
              placeholder={t('transfer_stock.destination_activity')}
              onSelect={handleChangeActivity}
              radioButtonColor={colors.main()}
              errors={errors.destination_activity_id?.message}
              testID='pickerselect-destination-activity'
            />
          </View>
          <View className='flex-row px-4 py-5 bg-white gap-x-2'>
            {hasNextMaterial && (
              <Button
                preset='outlined-primary'
                containerClassName='flex-1 gap-x-2'
                text={t('button.next_material')}
                LeftIcon={Icons.IcArrowRight}
                leftIconColor={colors.main()}
                leftIconSize={20}
                onPress={handleNextMaterial}
                {...getTestID('btn-next-material-tranfer-stock')}
              />
            )}
            <Button
              preset='filled'
              containerClassName='flex-1 gap-x-2'
              text={t('button.save')}
              LeftIcon={Icons.IcCheck}
              leftIconColor={colors.mainText()}
              leftIconSize={20}
              onPress={handleSaveTransferStock}
              {...getTestID('btn-save-transfer-stock')}
            />
          </View>
        </KeyboardAvoidingView>
        <LoadingDialog
          testID='loadingdialog-transfer-stock-activities'
          modalVisible={isLoadingActivities}
        />
      </View>
    </FormProvider>
  )
}
