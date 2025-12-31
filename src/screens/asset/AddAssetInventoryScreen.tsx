import React from 'react'
import { View, ScrollView } from 'react-native'
import { Icons } from '@/assets/icons'
import { Button } from '@/components/buttons/Button'
import LoadingDialog from '@/components/LoadingDialog'
import { useToolbar } from '@/components/toolbar/hooks/useToolbar'
import { useLanguage } from '@/i18n/useLanguage'
import { IOptions } from '@/models/Common'
import { AppStackScreenProps } from '@/navigators'
import AssetSpecificationForm from './component/form/AssetSpecificationForm'
import BudgetForm from './component/form/BudgetForm'
import CalibrationForm from './component/form/CalibrationForm'
import ElectricityForm from './component/form/ElectricityForm'
import EntityForm from './component/form/EntityForm'
import MaintenanceForm from './component/form/MaintenanceForm'
import OwnershipForm from './component/form/OwnershipForm'
import WarrantyForm from './component/form/WarrantyForm'
import WorkingStatusForm from './component/form/WorkingStatusForm'
import { useAddInventoryAsset } from './hooks/useAddInventoryAsset'
import { useAssetBudgetSourceList } from './hooks/useAssetBudgetSourceList'
import { useAssetModelList } from './hooks/useAssetModelList'
import { useAssetOptions } from './hooks/useAssetOptions'
import { useAssetTypeList } from './hooks/useAssetTypeList'
import { useManufactureList } from './hooks/useManufactureList'

interface Props extends AppStackScreenProps<'AddAssetInventory'> {}

export default function AddAssetInventoryScreen({ route }: Props) {
  const { isEdit, data } = route.params ?? {}

  const { t } = useLanguage()

  const anotherOption: IOptions = {
    value: 0,
    label: t('asset.add_another_option'),
  }

  useToolbar({
    title: t(
      isEdit ? 'asset.edit_asset_inventory' : 'asset.add_asset_inventory'
    ),
  })

  const {
    yearOptions,
    workingStatusOptions,
    calibrationScheduleOptions,
    maintenanceScheduleOptions,
    vendorOptions,
    electricityAvailabilityOptions,
    borrowedFromOptions,
    shouldShowLoading,
  } = useAssetOptions()

  const {
    assetTypeOptions,
    loadMore: loadMoreAssetType,
    handleSearch: handleSearchAssetType,
  } = useAssetTypeList({ anotherOption })

  const {
    assetModelOptions,
    loadMore: loadMoreAssetModel,
    handleSearch: handleSearchAssetModel,
  } = useAssetModelList({ anotherOption })

  const {
    manufacturerOptions,
    loadMore: loadMoreManufacturer,
    handleSearch: handleSearchManufacturer,
  } = useManufactureList({ anotherOption })

  const {
    budgetSourceOptions,
    loadMore: loadMoreBudgetSource,
    handleSearch: handleSearchBudgetSource,
  } = useAssetBudgetSourceList({ anotherOption })

  const {
    control,
    handleSubmit,
    trigger,
    errors,
    form,
    handleSelect,
    handleDateChange,
    onSubmit,
    isLoading,
  } = useAddInventoryAsset({ data, isEdit })

  return (
    <View className='flex-1 bg-lightBlueGray'>
      <ScrollView
        className='flex-1 bg-lightBlueGray'
        contentContainerClassName='gap-2 pb-2'>
        {/* Asset Specification Section */}
        <AssetSpecificationForm
          control={control}
          trigger={trigger}
          errors={errors}
          form={form}
          handleSelect={handleSelect}
          assetTypeOptions={assetTypeOptions}
          assetModelOptions={assetModelOptions}
          manufacturerOptions={manufacturerOptions}
          loadMoreManufacturer={loadMoreManufacturer}
          handleSearchManufacturer={handleSearchManufacturer}
          loadMoreAssetType={loadMoreAssetType}
          handleSearchAssetType={handleSearchAssetType}
          loadMoreAssetModel={loadMoreAssetModel}
          handleSearchAssetModel={handleSearchAssetModel}
        />

        {/* Working Status Section */}
        <WorkingStatusForm
          errors={errors}
          form={form}
          handleSelect={handleSelect}
          workingStatusOptions={workingStatusOptions}
        />

        {/* Entity Section */}
        <EntityForm control={control} errors={errors} form={form} />

        {/* Ownership Section */}
        <OwnershipForm
          control={control}
          errors={errors}
          form={form}
          handleSelect={handleSelect}
          borrowedFromOptions={borrowedFromOptions}
        />

        {/* Budget Section */}
        <BudgetForm
          errors={errors}
          form={form}
          control={control}
          handleSelect={handleSelect}
          productionYearOptions={yearOptions}
          budgetYearOptions={yearOptions}
          budgetSourceOptions={budgetSourceOptions}
          loadMoreBudgetSource={loadMoreBudgetSource}
          handleSearchBudgetSource={handleSearchBudgetSource}
        />

        {/* Electricity Section */}
        <ElectricityForm
          errors={errors}
          form={form}
          handleSelect={handleSelect}
          electricityAvailabilityOptions={electricityAvailabilityOptions}
        />

        {/* Warranty Section */}
        <WarrantyForm
          errors={errors}
          form={form}
          trigger={trigger}
          handleSelect={handleSelect}
          handleDateChange={handleDateChange}
          vendorOptions={vendorOptions}
        />

        {/* Calibration Section */}
        <CalibrationForm
          errors={errors}
          form={form}
          trigger={trigger}
          handleSelect={handleSelect}
          handleDateChange={handleDateChange}
          scheduleOptions={calibrationScheduleOptions}
          vendorOptions={vendorOptions}
        />

        {/* Maintenance Section */}
        <MaintenanceForm
          errors={errors}
          form={form}
          trigger={trigger}
          handleSelect={handleSelect}
          handleDateChange={handleDateChange}
          scheduleOptions={maintenanceScheduleOptions}
          vendorOptions={vendorOptions}
        />
      </ScrollView>

      <LoadingDialog
        testID='loading-dialog-add-asset-inventory'
        modalVisible={shouldShowLoading}
      />

      {/* Save Button - Sticky */}
      <View className='bg-white p-4 shadow-md'>
        <Button
          preset='filled'
          text={t('button.save')}
          textClassName={'ml-2'}
          LeftIcon={Icons.IcCheck}
          leftIconSize={20}
          onPress={handleSubmit(onSubmit)}
          disabled={isLoading}
          isLoading={isLoading}
          testID='button-save-asset'
        />
      </View>
    </View>
  )
}
