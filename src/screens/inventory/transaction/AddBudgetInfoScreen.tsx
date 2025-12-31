import React, { useCallback, useMemo } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from 'react-native'
import { yupResolver } from '@hookform/resolvers/yup'
import { SubmitHandler, useForm } from 'react-hook-form'
import { Icons } from '@/assets/icons'
import { Button } from '@/components/buttons'
import Dropdown from '@/components/dropdown/Dropdown'
import { InputNumber } from '@/components/forms'
import { ActivityHeader } from '@/components/header/ActivityHeader'
import { FieldValue } from '@/components/list/FieldValue'
import LoadingDialog from '@/components/LoadingDialog'
import { RefreshHomeAction } from '@/components/toolbar/actions/RefreshHomeAction'
import { useToolbar } from '@/components/toolbar/hooks/useToolbar'
import { useLanguage } from '@/i18n/useLanguage'
import { IOptions } from '@/models/Common'
import { AppStackScreenProps } from '@/navigators'
import { trxState, useAppSelector } from '@/services/store'
import AppStyles, { flexStyle } from '@/theme/AppStyles'
import colors from '@/theme/colors'
import { getTestID, numberFormat } from '@/utils/CommonUtils'
import { listYear, MAX_PRICE_LENGTH } from '@/utils/Constants'
import SaveTransactionButton from '../component/button/SaveTransactionButton'
import useBudgetSourceOption from '../hooks/useBudgetSourceOption'
import {
  BudgetSourceForm,
  BudgetSourceSchema,
} from '../schema/BudgetSourceSchema'

interface Props extends AppStackScreenProps<'AddBudgetInfo'> {}
function AddBudgetInfoScreen({ route, navigation }: Props) {
  const { data, path, isPurchase } = route.params
  const { activity, trxMaterial } = useAppSelector(trxState)
  const { t } = useLanguage()

  const { budgetSourceOption, isLoading, handleRefreshList } =
    useBudgetSourceOption(t)

  const {
    control,
    watch,
    reset,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<BudgetSourceForm>({
    resolver: yupResolver(BudgetSourceSchema()),
    mode: 'onChange',
    defaultValues: {
      ...data,
      is_purchase: isPurchase,
      price: data?.price ?? 0,
      year: data?.year,
      budget_source_id: data?.budget_source_id,
      budget_source: data?.budget_source,
    },
  })

  const form = watch()

  const pricePerUnit = useMemo(() => {
    const price = form.price ?? 0
    const qty = form.change_qty ?? 0
    return numberFormat(price / (qty ?? 1))
  }, [form.price, form.change_qty])

  const saveBudgetInfo: SubmitHandler<BudgetSourceForm> = (formData) => {
    const isBatch = !!trxMaterial.material.is_managed_in_batch
    const destination = isBatch
      ? 'TransactionAddStockBatch'
      : 'TransactionAddStock'
    navigation.navigate(destination, {
      stock: trxMaterial,
      formUpdate: {
        path,
        values: {
          year: formData.year ?? null,
          change_qty: formData.change_qty,
          budget_source_id: formData.budget_source_id ?? null,
          budget_source: formData.budget_source ?? null,
          price: formData.year ? formData.price : null,
        },
      },
    })
  }

  const handleChangePrice = useCallback(
    (value: string) => {
      setValue('price', value ? Number(value) : null, { shouldValidate: true })
    },
    [setValue]
  )

  const handleChangeBudgetSource = useCallback(
    (value: IOptions) => {
      reset({
        ...form,
        budget_source_id: value.value,
        budget_source: value,
        year: undefined,
        price: 0,
      })
    },
    [reset, form]
  )

  const handleChangeYear = useCallback(
    (value: IOptions) => {
      reset({
        ...form,
        year: value.value,
        price: 0,
      })
    },
    [form, reset]
  )

  const handleResetDropdown = useCallback(
    (field: 'budget_source' | 'year') => () => {
      reset({
        ...form,
        budget_source_id: field === 'year' ? form.budget_source_id : null,
        budget_source: field === 'year' ? form.budget_source : null,
        year: null,
        price: 0,
      })
    },
    [form, reset]
  )

  useToolbar({
    title: t('title.add_budget_info'),
    actions: <RefreshHomeAction onRefresh={handleRefreshList} />,
  })

  return (
    <View className='bg-white flex-1'>
      <ActivityHeader name={activity.name} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={flexStyle}>
        <ScrollView
          contentContainerClassName='p-4 flex-grow'
          keyboardShouldPersistTaps='handled'>
          <FieldValue label={t('label.unit')} value={form.unit} />
          <Dropdown
            preset='bottom-border'
            name='budget_source_id'
            control={control}
            data={budgetSourceOption}
            label={t('label.budget_source')}
            placeholder={t('label.budget_source')}
            onChangeValue={handleChangeBudgetSource}
            errors={errors?.budget_source_id?.message}
            isMandatory={isPurchase}
            withReset
            onResetField={handleResetDropdown('budget_source')}
            {...getTestID('dropdown-budget-source')}
          />
          <Dropdown
            preset='bottom-border'
            name='year'
            control={control}
            data={listYear()}
            label={t('label.budget_year')}
            placeholder={t('label.budget_year')}
            onChangeValue={handleChangeYear}
            errors={errors.year?.message}
            isMandatory={isPurchase}
            disable={!form.budget_source_id}
            withReset
            onResetField={handleResetDropdown('year')}
            {...getTestID('dropdown-budget-year')}
          />
          <InputNumber
            name='price'
            control={control}
            label={t('label.total_price')}
            placeholder={t('label.total_price')}
            onChangeText={handleChangePrice}
            value={String(form.price ?? '')}
            errors={errors.price?.message}
            isMandatory={isPurchase}
            maxLength={MAX_PRICE_LENGTH}
            editable={!!form.year && !!form.budget_source_id}
            {...getTestID(`textfield-total_price`)}
          />
          <FieldValue
            className='mt-4'
            label={t('label.price')}
            value={pricePerUnit}
          />
          <Text className={AppStyles.labelRegular}>
            {t('transaction.helpers.price_info')}
          </Text>
        </ScrollView>
        <View className='flex-row px-4 py-5  border-whiteTwo border-t gap-x-2'>
          <Button
            preset='outlined'
            textClassName='text-main font-mainMedium text-sm ml-s1'
            containerClassName='flex-1 text-center border-main'
            text={t('button.cancel')}
            LeftIcon={Icons.IcDelete}
            leftIconColor={colors.main()}
            leftIconSize={20}
            onPress={navigation.goBack}
            {...getTestID('btn-add-batch')}
          />
          <SaveTransactionButton onSubmit={handleSubmit(saveBudgetInfo)} />
        </View>
      </KeyboardAvoidingView>
      <LoadingDialog
        modalVisible={isLoading}
        testID='Loadingdialog-load-budget-source'
      />
    </View>
  )
}

export default AddBudgetInfoScreen
