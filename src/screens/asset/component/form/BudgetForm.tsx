import React from 'react'
import { View, Text } from 'react-native'
import { Control } from 'react-hook-form'
import PickerSelect from '@/components/filter/PickerSelect'
import { TextField } from '@/components/forms'
import { useLanguage } from '@/i18n/useLanguage'
import { IOptions } from '@/models/Common'
import AppStyles from '@/theme/AppStyles'
import colors from '@/theme/colors'
import { cn } from '@/theme/theme-config'
import { getTestID } from '@/utils/CommonUtils'
import { AssetFormData } from '../../schema/AssetInventorySchema'

type BudgetFormProps = {
  control: Control<AssetFormData>
  errors: Record<string, any>
  form: AssetFormData
  handleSelect: (fieldName: keyof AssetFormData) => (item: IOptions) => void
  productionYearOptions: IOptions[]
  budgetYearOptions: IOptions[]
  budgetSourceOptions: IOptions[]
  loadMoreBudgetSource?: () => void
  handleSearchBudgetSource?: (text: string) => void
}

const BudgetForm: React.FC<BudgetFormProps> = ({
  control,
  errors,
  form,
  handleSelect,
  productionYearOptions,
  budgetYearOptions,
  budgetSourceOptions,
  loadMoreBudgetSource,
  handleSearchBudgetSource,
}) => {
  const { t } = useLanguage()

  return (
    <View className='bg-white p-4'>
      <Text className={cn(AppStyles.textBold, 'text-midnightBlue mb-1')}>
        {t('asset.budget')}
      </Text>

      <PickerSelect
        value={form.production_year}
        name='ProductionYearSelect'
        data={productionYearOptions}
        title={t('asset.production_year')}
        label={t('asset.production_year')}
        placeholder={t('asset.production_year')}
        onSelect={handleSelect('production_year')}
        radioButtonColor={colors.main()}
        search
        testID='pickerselect-production-year'
        errors={errors.production_year?.message}
        isMandatory
      />

      <PickerSelect
        value={form.budget_year}
        name='BudgetYearSelect'
        data={budgetYearOptions}
        title={t('asset.budget_year')}
        label={t('asset.budget_year')}
        placeholder={t('asset.budget_year')}
        onSelect={handleSelect('budget_year')}
        radioButtonColor={colors.main()}
        search
        testID='pickerselect-budget-year'
        errors={errors.budget_year?.message}
        isMandatory
      />

      <PickerSelect
        value={form.budget_source_id}
        name='BudgetSourceSelect'
        data={budgetSourceOptions}
        title={t('asset.budget_source')}
        label={t('asset.budget_source')}
        placeholder={t('asset.budget_source')}
        onSelect={handleSelect('budget_source_id')}
        radioButtonColor={colors.main()}
        search
        testID='pickerselect-budget-source'
        errors={errors.budget_source_id?.message}
        isMandatory
        onEndReached={loadMoreBudgetSource}
        onSearch={handleSearchBudgetSource}
        useApiSearch
      />

      {form.budget_source_id === 0 && (
        <View className='mt-2 border border-quillGrey rounded p-2'>
          <TextField
            name='other_budget_source_name'
            control={control}
            label={t('asset.budget_source_name')}
            placeholder={t('asset.budget_source_name')}
            isMandatory
            errors={errors.other_budget_source_name?.message}
            {...getTestID('textfield-other-budget-source-name')}
          />
        </View>
      )}
    </View>
  )
}

export default BudgetForm
