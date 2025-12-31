import React, { useMemo } from 'react'
import { View, Text } from 'react-native'
import { Control, UseFormTrigger } from 'react-hook-form'
import PickerSelect from '@/components/filter/PickerSelect'
import { TextField } from '@/components/forms'
import { useLanguage } from '@/i18n/useLanguage'
import { IOptions } from '@/models/Common'
import AppStyles from '@/theme/AppStyles'
import colors from '@/theme/colors'
import { cn } from '@/theme/theme-config'
import { getTestID } from '@/utils/CommonUtils'
import AssetModelFields from './AssetModelFields'
import AssetTypeFields from './AssetTypeFields'
import ManufacturerFields from './ManufacturerFields'
import { AssetFormData } from '../../schema/AssetInventorySchema'

type PickerConfig = {
  key: keyof AssetFormData
  value: number
  data: IOptions[]
  name: string
  testID: string
  titleKey: string
  position: 'before' | 'after'
  onEndReached?: () => void
  onSearch?: (text: string) => void
  useApiSearch?: boolean
}

type AssetSpecificationFormProps = {
  control: Control<AssetFormData>
  trigger: UseFormTrigger<AssetFormData>
  errors: Record<string, any>
  form: AssetFormData
  handleSelect: (fieldName: keyof AssetFormData) => (item: IOptions) => void
  assetTypeOptions: IOptions[]
  assetModelOptions: IOptions[]
  manufacturerOptions: IOptions[]
  loadMoreManufacturer?: () => void
  handleSearchManufacturer?: (text: string) => void
  loadMoreAssetType?: () => void
  handleSearchAssetType?: (text: string) => void
  loadMoreAssetModel?: () => void
  handleSearchAssetModel?: (text: string) => void
}

const AssetSpecificationForm: React.FC<AssetSpecificationFormProps> = ({
  control,
  trigger,
  errors,
  form,
  handleSelect,
  assetTypeOptions,
  assetModelOptions,
  manufacturerOptions,
  loadMoreManufacturer,
  handleSearchManufacturer,
  loadMoreAssetType,
  handleSearchAssetType,
  loadMoreAssetModel,
  handleSearchAssetModel,
}) => {
  const { t } = useLanguage()

  // Memoize picker configurations to avoid recreating objects on each render
  const pickerConfigs = useMemo<PickerConfig[]>(
    () => [
      {
        key: 'asset_type_id',
        value: form.asset_type_id,
        data: assetTypeOptions,
        name: 'AssetTypeSelect',
        testID: 'pickerselect-asset-type',
        titleKey: 'asset.asset_type',
        position: 'before',
        onEndReached: loadMoreAssetType,
        onSearch: handleSearchAssetType,
        useApiSearch: !!handleSearchAssetType,
      },
      {
        key: 'asset_model_id',
        value: form.asset_model_id,
        data: assetModelOptions,
        name: 'AssetModelSelect',
        testID: 'pickerselect-asset-model',
        titleKey: 'asset.asset_model',
        position: 'after',
        onEndReached: loadMoreAssetModel,
        onSearch: handleSearchAssetModel,
        useApiSearch: !!handleSearchAssetModel,
      },
      {
        key: 'manufacture_id',
        value: form.manufacture_id,
        data: manufacturerOptions,
        name: 'ManufacturerSelect',
        testID: 'pickerselect-manufacturer',
        titleKey: 'asset.manufacturer',
        position: 'after',
        onEndReached: loadMoreManufacturer,
        onSearch: handleSearchManufacturer,
        useApiSearch: !!handleSearchManufacturer,
      },
    ],
    [
      form,
      assetTypeOptions,
      assetModelOptions,
      manufacturerOptions,
      loadMoreAssetType,
      handleSearchAssetType,
      loadMoreAssetModel,
      handleSearchAssetModel,
      loadMoreManufacturer,
      handleSearchManufacturer,
    ]
  )

  const beforeConfigs = useMemo(
    () => pickerConfigs.filter((config) => config.position === 'before'),
    [pickerConfigs]
  )

  const afterConfigs = useMemo(
    () => pickerConfigs.filter((config) => config.position === 'after'),
    [pickerConfigs]
  )

  const showAssetTypeFields = form.asset_type_id === 0
  const showAssetModelFields = form.asset_model_id === 0
  const showManufacturerFields = form.manufacture_id === 0

  const renderPickerSelect = (config: PickerConfig) => {
    const title = t(config.titleKey as any)
    return (
      <PickerSelect
        key={config.key}
        value={config.value}
        name={config.name}
        data={config.data}
        title={title}
        label={title}
        placeholder={title}
        onSelect={handleSelect(config.key)}
        radioButtonColor={colors.main()}
        search
        testID={config.testID}
        errors={errors[config.key]?.message as string}
        isMandatory
        onEndReached={config.onEndReached}
        onSearch={config.onSearch}
        useApiSearch={config.useApiSearch}
      />
    )
  }

  return (
    <View className='bg-white p-4'>
      <Text className={cn(AppStyles.textBold, 'text-midnightBlue mb-1')}>
        {t('asset.asset_specification')}
      </Text>

      {beforeConfigs.map((config) => renderPickerSelect(config))}

      {showAssetTypeFields && (
        <AssetTypeFields
          form={form}
          control={control}
          trigger={trigger}
          errors={errors}
          t={t}
        />
      )}

      <TextField
        name='serial_number'
        control={control}
        label={t('asset.serial_number')}
        placeholder={t('asset.serial_number')}
        isMandatory
        errors={errors.serial_number?.message}
        {...getTestID('textfield-serial-number')}
      />

      {afterConfigs.map((config) => {
        const element = renderPickerSelect(config)

        if (config.key === 'asset_model_id' && showAssetModelFields) {
          return (
            <React.Fragment key={`${config.key}-fragment`}>
              {element}
              <AssetModelFields
                form={form}
                control={control}
                trigger={trigger}
                errors={errors}
                t={t}
              />
            </React.Fragment>
          )
        }

        if (config.key === 'manufacture_id' && showManufacturerFields) {
          return (
            <React.Fragment key={`${config.key}-fragment`}>
              {element}
              <ManufacturerFields control={control} errors={errors} t={t} />
            </React.Fragment>
          )
        }

        return element
      })}
    </View>
  )
}

export default AssetSpecificationForm
