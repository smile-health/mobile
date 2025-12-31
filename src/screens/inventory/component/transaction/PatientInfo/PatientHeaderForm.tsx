import React, { useCallback, useMemo } from 'react'
import { Text, View } from 'react-native'
import { useFormContext } from 'react-hook-form'
import ActivityLabel from '@/components/ActivityLabel'
import Dropdown from '@/components/dropdown/Dropdown'
import { InfoRow } from '@/components/list/InfoRow'
import { useLanguage } from '@/i18n/useLanguage'
import { IOptions } from '@/models/Common'
import { VaccineType } from '@/models/transaction/VaccineSequence'
import { PatientInfoForm } from '@/screens/inventory/schema/PatientInfoSchema'
import { useAppSelector, vaccineSequenceState } from '@/services/store'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import { getTestID, numberFormat } from '@/utils/CommonUtils'
import { materialStatuses } from '@/utils/Constants'

interface Props {
  materialName: string
  stockOnHand: number
  availableStock: number
  batchName: string
  activityName: string
  isTemperatureSensitive?: boolean
  isSequence?: boolean
  vaccineType?: VaccineType
}
function PatientHeaderForm({
  materialName,
  stockOnHand,
  availableStock,
  batchName,
  activityName,
  vaccineType,
  isSequence,
  isTemperatureSensitive,
}: Readonly<Props>) {
  const { t } = useLanguage()

  const { rabiesSequences } = useAppSelector(vaccineSequenceState)

  const {
    control,
    setValue,
    clearErrors,
    formState: { errors },
  } = useFormContext<PatientInfoForm>()

  const vaccineMethods = useMemo(
    () => vaccineType?.methods ?? [],
    [vaccineType]
  )

  const handleChangeType = useCallback(() => {
    setValue('vaccine_method_id', undefined, {
      shouldValidate: true,
    })
  }, [setValue])

  const handleChangeMethod = useCallback(() => {
    setValue('patients', [
      {
        identity_type: undefined,
        patient_id: undefined,
        vaccine_sequence: undefined,
      },
    ])
    setValue('change_qty', 0)
    clearErrors('change_qty')
  }, [setValue, clearErrors])

  const handleChangeStatus = useCallback(
    (value: IOptions) => {
      setValue('stock_quality', value, {
        shouldValidate: true,
      })
    },
    [setValue]
  )

  return (
    <View className='bg-white p-4 mb-2'>
      <Text className={AppStyles.textBold}>{materialName}</Text>
      <View className='p-2 rounded-sm border border-quillGrey gap-y-1 mt-2'>
        <View className='flex-row items-center'>
          <Text className={cn(AppStyles.textRegular, 'flex-1')}>
            {batchName}
          </Text>
          <ActivityLabel name={activityName} />
        </View>
        <InfoRow
          label={t('label.stock_on_hand')}
          value={numberFormat(stockOnHand)}
        />
        <InfoRow
          label={t('label.available_stock')}
          value={numberFormat(availableStock)}
        />
      </View>
      {isSequence && (
        <React.Fragment>
          <Dropdown
            data={rabiesSequences}
            name='vaccine_type_id'
            control={control}
            preset='bottom-border'
            label={t('label.vaccination_type')}
            placeholder={t('label.vaccination_type')}
            valueField='id'
            labelField='title'
            onChangeValue={handleChangeType}
            isMandatory
            errors={errors.vaccine_type_id?.message}
            {...getTestID(`dropdown-vaccination-type`)}
          />
          <Dropdown
            data={vaccineMethods}
            name='vaccine_method_id'
            control={control}
            preset='bottom-border'
            label={t('label.method')}
            placeholder={t('label.method')}
            valueField='id'
            labelField='title'
            onChangeValue={handleChangeMethod}
            disable={!vaccineType}
            isMandatory
            errors={errors.vaccine_method_id?.message}
            {...getTestID(`dropdown-vaccination-method`)}
          />
        </React.Fragment>
      )}
      {isTemperatureSensitive && (
        <Dropdown
          data={materialStatuses}
          preset='bottom-border'
          name={'stock_quality_id'}
          control={control}
          label={t('label.material_status')}
          placeholder={t('label.material_status')}
          onChangeValue={handleChangeStatus}
          isMandatory
          errors={errors.stock_quality_id?.message}
          {...getTestID(`dropdown-stock-quality`)}
        />
      )}
    </View>
  )
}

export default React.memo(PatientHeaderForm)
