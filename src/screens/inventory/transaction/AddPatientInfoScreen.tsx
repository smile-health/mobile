import React, { useCallback, useMemo } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from 'react-native'
import { yupResolver } from '@hookform/resolvers/yup'
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form'
import { Icons } from '@/assets/icons'
import { Button } from '@/components/buttons'
import { InputNumber } from '@/components/forms'
import EntityActivityHeader from '@/components/header/EntityActivityHeader'
import { useLanguage } from '@/i18n/useLanguage'
import { AppStackScreenProps } from '@/navigators'
import {
  trxState,
  useAppSelector,
  vaccineSequenceState,
} from '@/services/store'
import AppStyles, { flexStyle } from '@/theme/AppStyles'
import colors from '@/theme/colors'
import { getTestID } from '@/utils/CommonUtils'
import PatientForm from '../component/transaction/PatientInfo/PatientForm'
import PatientHeaderForm from '../component/transaction/PatientInfo/PatientHeaderForm'
import { PatientInfoForm, PatientInfoSchema } from '../schema/PatientInfoSchema'

interface Props extends AppStackScreenProps<'AddPatientInfo'> {}

const checkIsDisableAddPatient = (patients) => {
  return patients?.some(
    (p) => !p.identity_type || !p.patient_id || !p.vaccine_sequence
  )
}

const checkIsDisableChangeQtyInput = (item) => {
  return (
    !item?.available_qty ||
    // condition for rabies need sequence
    (item.is_need_patient &&
      item.is_sequence &&
      !item.patients?.[0]?.vaccine_sequence) ||
    // condition for rabies non sequence
    (item.is_need_patient &&
      !item.is_sequence &&
      !item.patients?.[0]?.patient_id)
  )
}

function AddPatientInfoScreen({ route, navigation }: Props) {
  const { t } = useLanguage()
  const { rabiesSequences } = useAppSelector(vaccineSequenceState)
  const { activity, customer, trxMaterial } = useAppSelector(trxState)
  const { material, protocol } = trxMaterial
  const isSequence = !!protocol.is_sequence

  const { data, path, patientIds } = route.params
  const { activity: stockActivity, available_qty, batch, qty } = data

  const methods = useForm<PatientInfoForm>({
    resolver: yupResolver(PatientInfoSchema(t)),
    mode: 'all',
    defaultValues: {
      ...data,
      patients: data.patients ?? (isSequence ? [] : [{}]),
      patient_ids: patientIds,
    },
  })

  const {
    watch,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = methods
  const formInput = watch()

  const { vaccine_type_id, vaccine_method_id, patients, change_qty } = formInput

  const vaccineType = useMemo(
    () => rabiesSequences.find((rs) => rs.id === vaccine_type_id),
    [rabiesSequences, vaccine_type_id]
  )

  const vaccineMethod = useMemo(() => {
    return vaccineType?.methods.find((vm) => vm.id === vaccine_method_id)
  }, [vaccineType?.methods, vaccine_method_id])

  const handleChangeQty = useCallback(
    (value: string) => {
      setValue('change_qty', Number(value), {
        shouldValidate: true,
      })
    },
    [setValue]
  )

  const handleAddPatient = useCallback(() => {
    setValue('patients', [...patients, {}])
  }, [setValue, patients])

  const handleDeletePatient = useCallback(
    (index: number) => {
      if (patients.length === 1) {
        setValue('patients', [
          {
            identity_type: undefined,
            patient_id: undefined,
            vaccine_sequence: undefined,
          },
        ])
      } else {
        const updatedPatients = [...patients]
        updatedPatients.splice(index, 1)
        setValue('patients', updatedPatients)
      }
    },
    [patients, setValue]
  )

  const handleSubmitPatient: SubmitHandler<PatientInfoForm> = (data) => {
    navigation.navigate('TransactionConsumptionBatch', {
      stock: trxMaterial,
      formUpdate: {
        path,
        values: {
          change_qty: data.change_qty,
          min_qty_vaccine: data.min_qty_vaccine,
          max_qty_vaccine: data.max_qty_vaccine,
          vaccine_type_id: data.vaccine_type_id,
          vaccine_method_id: data.vaccine_method_id,
          patients: data.patients,
        },
      },
    })
  }

  const renderPatientHeaderForm = useCallback(() => {
    return (
      <PatientHeaderForm
        activityName={stockActivity?.name ?? ''}
        availableStock={available_qty}
        batchName={batch?.code ?? ''}
        materialName={material.name}
        stockOnHand={qty}
        vaccineType={vaccineType}
        isSequence={isSequence}
        isTemperatureSensitive={!!material.is_temperature_sensitive}
      />
    )
  }, [
    stockActivity?.name,
    available_qty,
    batch?.code,
    material.name,
    material.is_temperature_sensitive,
    qty,
    vaccineType,
    isSequence,
  ])

  const renderPatientItem = useCallback(
    (index: number) => {
      return (
        <PatientForm
          key={index}
          index={index}
          vaccineSequences={vaccineMethod?.sequences}
          isMultiPatient={!!vaccineMethod?.is_multi_patient}
          isSequence={isSequence}
          onDelete={handleDeletePatient}
        />
      )
    },
    [
      handleDeletePatient,
      isSequence,
      vaccineMethod?.is_multi_patient,
      vaccineMethod?.sequences,
    ]
  )

  const renderSectionFooter = useCallback(() => {
    const shouldShowAddPatient =
      vaccineMethod?.is_multi_patient && patients.length <= 5
    return shouldShowAddPatient ? (
      <View className='bg-white pb-4 w-full'>
        <Button
          LeftIcon={Icons.IcAdd}
          leftIconSize={20}
          leftIconColor={colors.main()}
          containerClassName='gap-x-2 self-start'
          text={t('button.add_patient')}
          textClassName='text-main'
          onPress={handleAddPatient}
          disabled={checkIsDisableAddPatient(patients)}
          {...getTestID('btn-add-patient')}
        />
      </View>
    ) : null
  }, [handleAddPatient, patients, t, vaccineMethod?.is_multi_patient])

  return (
    <View className='bg-lightBlueGray flex-1'>
      <EntityActivityHeader
        activityName={activity.name}
        entityName={customer?.name}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={flexStyle}>
        <FormProvider {...methods}>
          <ScrollView contentContainerClassName='flex-grow'>
            {renderPatientHeaderForm()}
            {patients.length > 0 && (
              <View className='flex-grow bg-white p-4 gap-y-2'>
                <Text className={AppStyles.textBold}>
                  {t('label.patient_identity')}
                </Text>
                {patients.map((_, index) => renderPatientItem(index))}
                {renderSectionFooter()}
              </View>
            )}
          </ScrollView>
          <View className='p-4 bg-white border-y border-quillGrey'>
            <Text className={AppStyles.textBold}>
              {t('transaction.enter_consumption_quantity')}
            </Text>
            <InputNumber
              isMandatory
              name='change_qty'
              control={control}
              value={String(change_qty)}
              label={t('transaction.field.consumption')}
              placeholder={t('transaction.field.consumption')}
              errors={errors?.change_qty?.message}
              onChangeText={handleChangeQty}
              editable={!checkIsDisableChangeQtyInput(formInput)}
              {...getTestID('textfield-order-quantity')}
            />
          </View>
          <View className='bg-white p-4 border-whiteTwo border-t'>
            <Button
              preset='filled'
              text={t('button.save')}
              LeftIcon={Icons.IcCheck}
              leftIconColor={colors.mainText()}
              onPress={handleSubmit(handleSubmitPatient)}
              textClassName='ml-2'
              {...getTestID('btn-save')}
            />
          </View>
        </FormProvider>
      </KeyboardAvoidingView>
    </View>
  )
}

export default AddPatientInfoScreen
