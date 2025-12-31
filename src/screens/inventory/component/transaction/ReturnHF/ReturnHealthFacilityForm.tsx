import React, { useCallback, useMemo } from 'react'
import { Text, View } from 'react-native'
import { Path, useFormContext } from 'react-hook-form'
import { Icons } from '@/assets/icons'
import ActivityLabel from '@/components/ActivityLabel'
import { Button } from '@/components/buttons'
import { InputNumber } from '@/components/forms'
import { InfoRow } from '@/components/list/InfoRow'
import { useLanguage } from '@/i18n/useLanguage'
import { identityTypeNames } from '@/screens/inventory/constant/transaction.constant'
import { ReturnHFForm } from '@/screens/inventory/schema/ReturnHealthFacilitySchema'
import { useAppSelector, vaccineSequenceState } from '@/services/store'
import AppStyles, { flexStyle } from '@/theme/AppStyles'
import colors from '@/theme/colors'
import { getTestID, numberFormat } from '@/utils/CommonUtils'
import DiscardedSection from './DiscardedSection'
import TransactionReturnHFInfo from './TransactionReturnHFInfo'
import PatientItem from '../PatientInfo/PatientItem'

interface Props {
  index: number
  onDelete: () => void
  onPressDetailPatient: () => void
}

function ReturnHealthFacilityForm({
  index,
  onDelete,
  onPressDetailPatient,
}: Readonly<Props>) {
  const { rabiesSequences } = useAppSelector(vaccineSequenceState)
  const { t } = useLanguage()
  const formContext = useFormContext<ReturnHFForm>()
  const {
    watch,
    control,
    setValue,
    trigger,
    clearErrors,
    formState: { errors },
  } = formContext

  const fieldName: Path<ReturnHFForm> = `selectedTrx.${index}`
  const {
    batch,
    activity,
    consumption_qty,
    max_return = 0,
    created_at,
    change_qty,
    vaccine_type_id,
    vaccine_method_id,
    patients,
    transaction_id,
    is_open_vial,
    open_vial_qty,
    close_vial_qty,
  } = watch(fieldName)
  const disableReturnAmountInput = !!patients?.length

  const qtyHelperMessage = useMemo(() => {
    const finalQty = numberFormat(max_return - change_qty)
    return change_qty > 0
      ? t('transaction.helpers.stock_amount', { qty: finalQty })
      : ''
  }, [change_qty, max_return, t])

  const vaccineType = useMemo(
    () => rabiesSequences.find((rs) => rs.id === vaccine_type_id),
    [rabiesSequences, vaccine_type_id]
  )
  const vaccineMethod = useMemo(
    () => vaccineType?.methods.find((vm) => vm.id === vaccine_method_id),
    [vaccineType?.methods, vaccine_method_id]
  )

  const patient = patients?.[0]
  const showPatientSequence = !!vaccineType && !!vaccineMethod
  const showPatientNonSequence = !!patient && !showPatientSequence

  const handleChangeStock = useCallback(
    (field: string) => (value: string) => {
      const qtyFieldName = `${fieldName}.${field}` as Path<ReturnHFForm>
      setValue(qtyFieldName, Number(value), {
        shouldValidate: value !== '',
      })

      if (value === '') {
        clearErrors(qtyFieldName)
      }
      trigger([
        `${fieldName}.transaction_reason_id`,
        `${fieldName}.open_vial_qty`,
      ])
    },
    [fieldName, trigger, setValue, clearErrors]
  )

  const getFieldError = (field: string) => {
    return errors.selectedTrx?.[index]?.[field]?.message
  }

  return (
    <View className='mb-4'>
      <View className='p-3 border border-quillGrey rounded-sm gap-y-1'>
        <View className='flex-row items-center'>
          <Text className={AppStyles.textRegular} style={flexStyle}>
            {batch?.code ?? ''}
          </Text>
          <ActivityLabel name={activity?.name ?? ''} />
        </View>
        <TransactionReturnHFInfo
          createdAt={created_at ?? ''}
          consumptionQty={consumption_qty ?? 0}
          maxReturn={max_return}
          batch={batch}
        />
        {showPatientSequence && (
          <View className='p-2 border border-quillGrey gap-y-2'>
            <View className='flex-row gap-x-2'>
              <Text className={AppStyles.textBold} style={flexStyle}>
                {vaccineType.title}
              </Text>
              <Button
                text={t('label.details')}
                textClassName='text-main'
                onPress={onPressDetailPatient}
                RightIcon={Icons.IcChevronRightActive}
                rightIconColor={colors.main()}
                rightIconSize={20}
                {...getTestID(`btn-detail-patient-${transaction_id}`)}
              />
            </View>
            <InfoRow
              label={t('label.method')}
              value={vaccineMethod.title ?? ''}
            />
          </View>
        )}
        {showPatientNonSequence && (
          <View className='p-2 border border-quillGrey gap-y-2'>
            <Text className={AppStyles.textBold} style={flexStyle}>
              {t('label.patient_identity')}
            </Text>
            <PatientItem
              identityType={identityTypeNames[patient?.identity_type ?? 0]}
              patientID={patient?.patient_id ?? ''}
              phoneNumber={patient?.phone_number ?? ''}
            />
          </View>
        )}
        {is_open_vial ? (
          <React.Fragment>
            <InputNumber
              name={`${fieldName}.open_vial_qty`}
              control={control}
              label={t(`transaction.open_vial_field.return`)}
              placeholder={t(`transaction.open_vial_field.return`)}
              onChangeText={handleChangeStock('open_vial_qty')}
              value={String(open_vial_qty)}
              errors={getFieldError('open_vial_qty')}
              {...getTestID(`textfield-return-open-vial-qty`)}
            />
            <InputNumber
              name={`${fieldName}.close_vial_qty`}
              control={control}
              label={t(`transaction.close_vial_field.return`)}
              placeholder={t(`transaction.close_vial_field.return`)}
              onChangeText={handleChangeStock('close_vial_qty')}
              value={String(close_vial_qty)}
              errors={getFieldError('close_vial_qty')}
              {...getTestID(`textfield-return-close-vial-qty`)}
            />
          </React.Fragment>
        ) : (
          <InputNumber
            name={`${fieldName}.change_qty`}
            control={control}
            label={t('transaction.field.return')}
            placeholder={t('transaction.field.return')}
            onChangeText={handleChangeStock('change_qty')}
            value={String(change_qty)}
            helper={qtyHelperMessage}
            editable={!disableReturnAmountInput}
            errors={getFieldError('change_qty')}
            {...getTestID(`textfield-return-qty`)}
          />
        )}
        <DiscardedSection index={index} />
      </View>
      <Button
        text={t('button.delete')}
        onPress={onDelete}
        containerClassName='self-end mt-2 '
        textClassName='text-lavaRed'
        {...getTestID(`btn-delete-transaction-${index}`)}
      />
    </View>
  )
}

export default React.memo(ReturnHealthFacilityForm)
