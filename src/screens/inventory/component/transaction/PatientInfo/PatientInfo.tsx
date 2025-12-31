import React, { useCallback, useMemo } from 'react'
import { View, Text } from 'react-native'
import { Path, useFormContext } from 'react-hook-form'
import { Icons } from '@/assets/icons'
import { Button } from '@/components/buttons'
import { InfoRow } from '@/components/list/InfoRow'
import { useLanguage } from '@/i18n/useLanguage'
import {
  CreateTransactionForm,
  SectionItemFieldName,
} from '@/models/transaction/TransactionCreate'
import { identityTypeNames } from '@/screens/inventory/constant/transaction.constant'
import { getVaccineSequenceName } from '@/screens/inventory/helpers/TransactionHelpers'
import { useAppSelector, vaccineSequenceState } from '@/services/store'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import { getTestID } from '@/utils/CommonUtils'
import PatientItem from './PatientItem'

interface Props {
  fieldName: Path<CreateTransactionForm>
  onAddPatientInfo: () => void
}

function PatientInfo({ fieldName, onAddPatientInfo }: Readonly<Props>) {
  const { t } = useLanguage()

  const { rabiesSequences } = useAppSelector(vaccineSequenceState)

  const { watch } = useFormContext<CreateTransactionForm>()
  const transactionStockData = watch(fieldName as SectionItemFieldName)

  const {
    is_need_patient,
    is_sequence,
    patients,
    vaccine_method_id,
    vaccine_type_id,
    change_qty,
    stock_quality,
  } = transactionStockData

  const patientInfoFilled = patients && patients.length > 0
  const showPatientInfoButton = is_need_patient && !patientInfoFilled

  const vaccineType = useMemo(
    () => rabiesSequences.find((rs) => rs.id === vaccine_type_id),
    [rabiesSequences, vaccine_type_id]
  )
  const vaccineMethod = useMemo(
    () => vaccineType?.methods.find((vm) => vm.id === vaccine_method_id),
    [vaccineType?.methods, vaccine_method_id]
  )

  const renderPatientItem = useCallback(
    (item) => (
      <PatientItem
        key={item.patient_id}
        identityType={t(identityTypeNames[item.identity_type])}
        patientID={item.patient_id}
        phoneNumber={item.phone_number}
        vaccineSequence={getVaccineSequenceName(
          vaccineMethod?.sequences,
          item.vaccine_sequence
        )}
        containerClassName='p-2 border border-lightGreyMinimal rounded-sm'
      />
    ),
    [vaccineMethod?.sequences, t]
  )

  if (showPatientInfoButton) {
    return (
      <Button
        preset='outlined-primary'
        text={t('button.enter_consumption')}
        onPress={onAddPatientInfo}
        containerClassName='mt-2'
        {...getTestID('btn-add-patient-consumption')}
      />
    )
  }

  return patientInfoFilled ? (
    <View className='border border-quillGrey p-2 rounded-sm gap-y-1 mt-2'>
      <View className='flex-row items-center gap-x-1'>
        <Text className={cn(AppStyles.textBold, 'flex-1')}>
          {is_sequence && vaccineType
            ? vaccineType.title
            : t('label.consumption')}
        </Text>
        <Button
          text={t('button.edit_add')}
          textClassName='text-main text-sm'
          onPress={onAddPatientInfo}
          RightIcon={Icons.IcChevronRight}
          rightIconSize={20}
          {...getTestID('btn-edit-add-patient')}
        />
      </View>
      {vaccineMethod && (
        <InfoRow
          label={t('label.method')}
          value={vaccineMethod.title}
          valueClassName='font-mainBold'
        />
      )}
      <InfoRow
        label={t('label.qty')}
        value={change_qty}
        valueClassName='font-mainBold'
      />
      {stock_quality && (
        <InfoRow
          label={t('label.material_status')}
          value={stock_quality.label}
          valueClassName='font-mainBold'
        />
      )}
      <View className='border-b border-quillGrey mt-1 mb-2' />
      <Text className={AppStyles.labelBold}>{t('label.patient_identity')}</Text>
      {patients?.map((item) => renderPatientItem(item))}
    </View>
  ) : null
}

export default React.memo(PatientInfo)
