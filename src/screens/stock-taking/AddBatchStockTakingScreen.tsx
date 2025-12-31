import React, { useCallback } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  Text,
} from 'react-native'
import { yupResolver } from '@hookform/resolvers/yup'
import { SubmitHandler, useForm } from 'react-hook-form'
import { Icons } from '@/assets/icons'
import { Button } from '@/components/buttons'
import Dropdown from '@/components/dropdown/Dropdown'
import { TextField } from '@/components/forms'
import InputDate from '@/components/forms/InputDate'
import HeaderMaterial from '@/components/header/HeaderMaterial'
import { useLanguage } from '@/i18n/useLanguage'
import { CommonObject } from '@/models/Common'
import { AppStackScreenProps } from '@/navigators'
import { stockTakingState, useAppSelector } from '@/services/store'
import AppStyles, { flexStyle } from '@/theme/AppStyles'
import colors from '@/theme/colors'
import { cn } from '@/theme/theme-config'
import { getTestID, showError } from '@/utils/CommonUtils'
import { DATE_FILTER_FORMAT } from '@/utils/Constants'
import { dateToString, stringToDate } from '@/utils/DateFormatUtils'
import CreateStockTakingHeader from './components/CreateStockTakingHeader'
import { getHeaderMaterialProps } from './helpers/StockTakingHelpers'
import { StockTakingFormItem } from './schema/CreateStockTakingSchema'
import {
  NewBatchStockTakingForm,
  NewBatchStockTakingSchema,
} from './schema/NewBatchStockTakingSchema'

interface Props extends AppStackScreenProps<'AddBatchStockTaking'> {}

export default function AddBatchStockTakingScreen({
  route,
  navigation,
}: Props) {
  const { batchList } = route.params
  const { t } = useLanguage()
  const { period, detail, parentMaterial } = useAppSelector(stockTakingState)

  const headerProps = getHeaderMaterialProps(detail, parentMaterial)

  const {
    control,
    setValue,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<NewBatchStockTakingForm>({
    mode: 'onChange',
    resolver: yupResolver(NewBatchStockTakingSchema),
  })
  const { expired_date, batch_code, activity_id } = watch()

  const expiredDate = expired_date ? stringToDate(expired_date) : undefined
  const isCompletedData = [expired_date, batch_code, activity_id].every(Boolean)

  const handleChangeCode = useCallback(
    (value: string) => {
      setValue('batch_code', value.toUpperCase(), {
        shouldValidate: true,
      })
    },
    [setValue]
  )

  const handleChangeExpiredDate = useCallback(
    (val: Date) => {
      setValue('expired_date', dateToString(val, DATE_FILTER_FORMAT), {
        shouldValidate: true,
      })
    },
    [setValue]
  )

  const handleChangeActivity = useCallback(
    (value: CommonObject) => {
      setValue('activity_name', value.name, { shouldValidate: true })
    },
    [setValue]
  )

  const handleSubmitNewBatch: SubmitHandler<NewBatchStockTakingForm> = (
    data
  ) => {
    const isExistBatch = batchList.some(
      (b) => b.batch_code?.toUpperCase() === data.batch_code?.toUpperCase()
    )
    if (isExistBatch) {
      showError(t('error.code_batch_exist'))
      return
    }

    const newBatch: StockTakingFormItem = {
      stock_id: null,
      actual_qty: null,
      in_transit_qty: 0,
      recorded_qty: 0,
      ...data,
    }

    navigation.navigate('CreateStockTaking', { newBatch })
  }

  return (
    <View className='flex-1 bg-catskillWhite'>
      <HeaderMaterial
        items={[{ label: t('label.period'), value: period?.name }]}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={flexStyle}>
        <ScrollView
          contentContainerClassName='bg-white flex-grow'
          showsVerticalScrollIndicator={false}>
          <CreateStockTakingHeader {...headerProps} />
          <View className='bg-white p-3 pb-4'>
            <Text className={cn(AppStyles.labelBold, 'text-sm')}>
              {t('section.batch_detail')}
            </Text>
            <TextField
              name='batch_code'
              control={control}
              autoCapitalize='characters'
              onChangeText={handleChangeCode}
              label={t('label.code_batch')}
              placeholder={t('label.code_batch')}
              errors={errors.batch_code?.message}
              isMandatory
              {...getTestID('textfield-code-batch')}
            />
            <InputDate
              date={expiredDate}
              minimumDate={new Date()}
              label={t('label.expired_date_batch')}
              isMandatory
              onDateChange={handleChangeExpiredDate}
              className='flex-none'
              testID='inputdate-expired-date'
              errors={errors.expired_date?.message}
            />
            <Dropdown
              preset='bottom-border'
              name='activity_id'
              control={control}
              data={detail.activities}
              label={t('label.activity')}
              placeholder={t('label.activity')}
              labelField='name'
              valueField='id'
              onChangeValue={handleChangeActivity}
              errors={errors.activity_id?.message}
              isMandatory
              {...getTestID('dropdown-manufacture')}
            />
            {isCompletedData && (
              <View className='mt-2'>
                <Text className={AppStyles.labelRegular}>
                  {t('label.remaining_stock_smile')}: 0
                </Text>
                <Text className={AppStyles.labelRegular}>
                  {t('label.stock_in_transit')}: 0
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
        <View className='bg-white p-4 border-t border-quillGrey'>
          <Button
            preset='filled'
            text={t('button.save')}
            onPress={handleSubmit(handleSubmitNewBatch)}
            LeftIcon={Icons.IcCheck}
            leftIconColor={colors.mainText()}
            textClassName='ml-2'
            {...getTestID('btn-save')}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  )
}
