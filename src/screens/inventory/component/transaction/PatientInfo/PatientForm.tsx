import React, { useCallback, useMemo } from 'react'
import { Text, View } from 'react-native'
import { useFormContext } from 'react-hook-form'
import { Button } from '@/components/buttons'
import Dropdown from '@/components/dropdown/Dropdown'
import { TextField } from '@/components/forms'
import PhoneInput from '@/components/phone-input/PhoneInput'
import { useLanguage } from '@/i18n/useLanguage'
import { VaccineSequence } from '@/models/transaction/VaccineSequence'
import {
  IDENTITY_TYPE,
  identityTypeOption,
} from '@/screens/inventory/constant/transaction.constant'
import { PatientInfoForm } from '@/screens/inventory/schema/PatientInfoSchema'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import { getTestID } from '@/utils/CommonUtils'

interface Props {
  index: number
  isMultiPatient: boolean
  isSequence: boolean
  onDelete: (index: number) => void
  vaccineSequences?: VaccineSequence[]
}

function PatientForm({
  index,
  isMultiPatient,
  isSequence,
  vaccineSequences,
  onDelete,
}: Readonly<Props>) {
  const { t } = useLanguage()
  const {
    control,
    getValues,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useFormContext<PatientInfoForm>()

  const phoneNumber = useMemo(
    () => getValues(`patients.${index}.phone_number`),
    [getValues, index]
  )
  const { identity_type } = watch(`patients.${index}`)

  const patientIdKeyboardType = useMemo(() => {
    return identity_type === IDENTITY_TYPE.NIK ? 'number-pad' : undefined
  }, [identity_type])

  const handleChangeIdentityType = useCallback(() => {
    trigger(`patients.${index}.patient_id`)
  }, [index, trigger])

  const handleChangeSequence = useCallback(
    (val: VaccineSequence) => {
      setValue('min_qty_vaccine', val.min)
      setValue('max_qty_vaccine', val.max)
    },
    [setValue]
  )

  const handleDelete = useCallback(() => {
    onDelete(index)
  }, [index, onDelete])

  const getPatientError = (field: string) =>
    errors.patients?.[index]?.[field]?.message

  return (
    <View
      className={cn('mb-2', {
        'rounded-sm p-2 border border-quillGrey': isMultiPatient,
      })}>
      {isMultiPatient && (
        <Text className={AppStyles.labelBold}>
          {t('label.patient_num', { num: index + 1 })}
        </Text>
      )}
      <Dropdown
        data={identityTypeOption()}
        name={`patients.${index}.identity_type`}
        control={control}
        preset='bottom-border'
        label={t('label.identity_type')}
        placeholder={t('label.identity_type')}
        isMandatory
        onChangeValue={handleChangeIdentityType}
        errors={getPatientError('identity_type')}
        {...getTestID(`dropdown-identity-type`)}
      />
      <TextField
        name={`patients.${index}.patient_id`}
        control={control}
        label={t('label.patient_id')}
        placeholder={t('label.patient_id')}
        errors={getPatientError('patient_id')}
        isMandatory
        keyboardType={patientIdKeyboardType}
        {...getTestID('textfield-patient-id')}
      />
      <PhoneInput
        name={`patients.${index}.phone_number`}
        control={control}
        defaultValue={phoneNumber}
        placeholder={t('label.phone_number')}
        errors={getPatientError('phone_number')}
        {...getTestID('phone-input')}
      />
      {isSequence && (
        <Dropdown
          data={vaccineSequences ?? []}
          name={`patients.${index}.vaccine_sequence`}
          control={control}
          preset='bottom-border'
          label={t('label.vaccine_sequence')}
          placeholder={t('label.vaccine_sequence')}
          onChangeValue={handleChangeSequence}
          labelField='title'
          valueField='id'
          isMandatory
          errors={getPatientError('vaccine_sequence')}
          {...getTestID(`dropdown-vaccine-sequence`)}
        />
      )}
      {index > 0 && (
        <Button
          text={t('button.delete')}
          onPress={handleDelete}
          containerClassName='self-end mt-2'
          textClassName='text-lavaRed'
          {...getTestID('btn-delete-patient')}
        />
      )}
    </View>
  )
}

export default React.memo(PatientForm)
