import React, { useCallback } from 'react'
import {
  View,
  ScrollView,
  Text,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { yupResolver } from '@hookform/resolvers/yup'
import { SubmitHandler, useForm } from 'react-hook-form'
import { Icons } from '@/assets/icons'
import { Button } from '@/components/buttons'
import Dropdown from '@/components/dropdown/Dropdown'
import { TextField } from '@/components/forms'
import InputDate from '@/components/forms/InputDate'
import { ActivityHeader } from '@/components/header/ActivityHeader'
import MaterialItem, { MaterialItemProps } from '@/components/list/MaterialItem'
import { useLanguage } from '@/i18n/useLanguage'
import { AppStackScreenProps } from '@/navigators'
import { getMaterialManufacturer } from '@/services/features'
import { trxState, useAppSelector } from '@/services/store'
import AppStyles, { flexStyle } from '@/theme/AppStyles'
import colors from '@/theme/colors'
import { cn } from '@/theme/theme-config'
import {
  dateToString,
  getTestID,
  showError,
  showSuccess,
} from '@/utils/CommonUtils'
import { DATE_FILTER_FORMAT } from '@/utils/Constants'
import { stringToDate } from '@/utils/DateFormatUtils'
import { BATCH_TYPE } from '../constant/transaction.constant'
import { createNewBatchTrx } from '../helpers/AddStockHelpers'
import {
  AddNewBatchFormField,
  AddNewBatchSchema,
} from '../schema/AddNewBatchSchema'

interface Props extends AppStackScreenProps<'AddNewBatch'> {}

export default function AddNewBatchScreen({ route, navigation }: Props) {
  const { batchList } = route.params
  const { trxMaterial, activity } = useAppSelector(trxState)
  const manufactures = useAppSelector((state) =>
    getMaterialManufacturer(state, trxMaterial.material.id)
  )

  const { t } = useLanguage()

  const {
    control,
    watch,
    setValue,
    formState: { errors },
    handleSubmit,
  } = useForm<AddNewBatchFormField>({
    resolver: yupResolver(AddNewBatchSchema()),
    mode: 'onChange',
    defaultValues: { production_date: null },
  })
  const isDisabledSave = Object.keys(errors).length > 0

  const { production_date, expired_date } = watch()
  const productionDate = production_date
    ? stringToDate(production_date)
    : undefined
  const expiredDate = expired_date ? stringToDate(expired_date) : undefined
  const { material, max, min, total_qty, updated_at } = trxMaterial

  const materialProps: MaterialItemProps = {
    name: material.name,
    qty: total_qty,
    min,
    max,
    updatedAt: updated_at,
  }

  const handleChangeCode = useCallback(
    (value: string) => {
      setValue('code', value.toUpperCase(), {
        shouldValidate: true,
      })
    },
    [setValue]
  )

  const handleDateChange = useCallback(
    (field: 'production_date' | 'expired_date') => (val: Date) => {
      setValue(field, dateToString(val, DATE_FILTER_FORMAT), {
        shouldValidate: true,
      })
    },
    [setValue]
  )

  const handleChangeManufacture = useCallback(
    (value: { id: number; name: string; address: string }) => {
      setValue('manufacture', value, { shouldValidate: true })
    },
    [setValue]
  )

  const onSubmit: SubmitHandler<AddNewBatchFormField> = (data) => {
    const newBatchTrx = createNewBatchTrx(activity, material, {
      ...data,
      production_date: data.production_date,
    })
    const isExistBatchCode = batchList.find(
      (t) =>
        t.material_id === newBatchTrx.material_id &&
        t.batch?.code?.toUpperCase() ===
          newBatchTrx.batch?.code?.toUpperCase() &&
        t.batch?.manufacture.id === newBatchTrx.batch?.manufacture.id
    )
    if (isExistBatchCode) {
      showError(t('error.code_batch_exist'))
      return
    }
    showSuccess(t('order.success_add_batch'), 'snackbar-success-add-batch')
    navigation.navigate('TransactionAddStockBatch', {
      stock: trxMaterial,
      formUpdate: {
        path: BATCH_TYPE.ACTIVE,
        values: newBatchTrx,
        isNewBatch: true,
      },
    })
  }

  return (
    <View className='flex-1 bg-catskillWhite'>
      <ActivityHeader />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={flexStyle}>
        <ScrollView contentContainerClassName='bg-white flex-grow'>
          <View className={'bg-lightGrey p-4 gap-y-1'}>
            <Text className={AppStyles.textBold}>{t('label.material')}</Text>
            <MaterialItem {...materialProps} />
          </View>
          <View className='bg-white p-3 pb-4'>
            <Text className={cn(AppStyles.labelBold, 'text-sm')}>
              {t('section.batch_detail')}
            </Text>
            <TextField
              name='code'
              control={control}
              autoCapitalize='characters'
              label={t('label.code_batch')}
              placeholder={t('label.code_batch')}
              onChangeText={handleChangeCode}
              errors={errors.code?.message}
              isMandatory
              {...getTestID('textfield-code-batch')}
            />
            <InputDate
              date={productionDate}
              maximumDate={new Date()}
              label={t('label.production_date')}
              className='flex-none'
              onDateChange={handleDateChange('production_date')}
              testID='inputdate-production-date'
            />
            <Dropdown
              preset='bottom-border'
              name='manufacture_id'
              control={control}
              data={manufactures}
              label={t('label.manufacturer_name')}
              placeholder={t('label.manufacturer_name')}
              labelField='name'
              valueField='id'
              onChangeValue={handleChangeManufacture}
              errors={errors.manufacture_id?.message}
              isMandatory
              {...getTestID('dropdown-manufacture')}
            />
            <InputDate
              date={expiredDate}
              minimumDate={new Date()}
              label={t('label.expired_date_batch')}
              className='flex-none'
              onDateChange={handleDateChange('expired_date')}
              errors={errors.expired_date?.message}
              isMandatory
              testID='inputdate-expired-date'
            />
          </View>
        </ScrollView>
        <View className='bg-white border-t border-quillGrey p-4'>
          <Button
            preset='filled'
            text={t('button.save')}
            onPress={handleSubmit(onSubmit)}
            leftIconColor={colors.mainText()}
            LeftIcon={Icons.IcCheck}
            textClassName='ml-2'
            disabled={isDisabledSave}
            {...getTestID('btn-save')}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  )
}
