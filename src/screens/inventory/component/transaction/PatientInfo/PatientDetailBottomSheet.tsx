import React, { useCallback, useMemo } from 'react'
import { View, Text, ScrollView } from 'react-native'
import { Icons } from '@/assets/icons'
import ActivityLabel from '@/components/ActivityLabel'
import {
  BottomSheet,
  BottomSheetProps,
} from '@/components/bottomsheet/BottomSheet'
import { ImageButton } from '@/components/buttons'
import { InfoRow } from '@/components/list/InfoRow'
import { useLanguage } from '@/i18n/useLanguage'
import { CreateTransaction } from '@/models/transaction/TransactionCreate'
import { identityTypeNames } from '@/screens/inventory/constant/transaction.constant'
import { getVaccineSequenceName } from '@/screens/inventory/helpers/TransactionHelpers'
import {
  useAppSelector,
  vaccineSequenceState,
  transactionTypesState,
  homeState,
} from '@/services/store'
import AppStyles, { flexStyle } from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import { DATE_TIME_FORMAT, SHORT_DATE_FORMAT } from '@/utils/Constants'
import { convertString } from '@/utils/DateFormatUtils'
import PatientItem from './PatientItem'

export interface TransactionPatientDetail {
  materialName?: string
  activityName?: string
  data?: CreateTransaction
}

interface Props extends BottomSheetProps, TransactionPatientDetail {}

function PatientDetailBottomSheet({
  data,
  materialName,
  activityName,
  toggleSheet,
  ...bottomSheetProps
}: Readonly<Props>) {
  const { transactionTypes } = useAppSelector(transactionTypesState)
  const { rabiesSequences } = useAppSelector(vaccineSequenceState)
  const { activeMenu } = useAppSelector(homeState)
  const { t } = useLanguage()

  const {
    created_at,
    vaccine_type_id,
    vaccine_method_id,
    batch,
    activity,
    stock_quality,
    patients = [],
  } = data ?? {}

  const transactionName = useMemo(() => {
    if (!transactionTypes || !activeMenu?.transactionType) return ''
    const trxType = transactionTypes.find(
      (tt) => tt.id === activeMenu.transactionType
    )

    return trxType?.title ?? ''
  }, [activeMenu?.transactionType, transactionTypes])

  const vaccineType = useMemo(
    () => rabiesSequences.find((rs) => rs.id === vaccine_type_id),
    [rabiesSequences, vaccine_type_id]
  )
  const vaccineMethod = useMemo(
    () => vaccineType?.methods.find((vm) => vm.id === vaccine_method_id),
    [vaccineType?.methods, vaccine_method_id]
  )

  const hasVaccineInfo = !!vaccineType && !!vaccineMethod

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

  return (
    <BottomSheet
      containerClassName='max-h-full'
      toggleSheet={toggleSheet}
      {...bottomSheetProps}>
      <View className='bg-white p-4 gap-y-4 flex-1'>
        <View className='flex-row items-center justify-between'>
          <Text className={AppStyles.textBold}>{t('label.details')}</Text>
          <ImageButton Icon={Icons.IcDelete} onPress={toggleSheet} size={20} />
        </View>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerClassName='flex-grow'>
          <View className='border border-quillGrey p-2 gap-y-2'>
            <View className='flex-row items-start'>
              <Text className={AppStyles.textBold} style={flexStyle}>
                {materialName ?? ''}
              </Text>
              <ActivityLabel name={activityName ?? ''} />
            </View>
            <View className='flex-row items-center'>
              <Text
                className={cn(AppStyles.textRegularSmall, 'text-main')}
                style={flexStyle}>
                {transactionName}
              </Text>
              <Text className={AppStyles.textRegularSmall}>
                {convertString(created_at, DATE_TIME_FORMAT)}
              </Text>
            </View>
            <View className='border border-quillGrey p-2 gap-y-2'>
              <View className='flex-row items-start'>
                <Text className={AppStyles.textRegular} style={flexStyle}>
                  {batch?.code ?? ''}
                </Text>
                <ActivityLabel name={activity?.name ?? ''} />
              </View>
              <View className='gap-y-1 pb-1 border-b border-quillGrey'>
                <InfoRow
                  label={t('label.expired_date')}
                  valueClassName='uppercase'
                  value={convertString(
                    batch?.expired_date ?? null,
                    SHORT_DATE_FORMAT
                  )}
                />
                <InfoRow
                  label={t('label.manufacturer')}
                  value={batch?.manufacture.name ?? ''}
                />
                <InfoRow
                  label={t('label.production_date')}
                  valueClassName='uppercase'
                  value={convertString(
                    batch?.production_date ?? null,
                    SHORT_DATE_FORMAT
                  )}
                />
              </View>
              {stock_quality && (
                <View className='border-b border-quillGrey pb-1'>
                  <InfoRow
                    label={t('label.material_status')}
                    value={stock_quality.label}
                  />
                </View>
              )}
              <View className='border border-quillGrey p-2 rounded-sm gap-y-1 mt-2'>
                {hasVaccineInfo && (
                  <React.Fragment>
                    <View className='flex-row items-center gap-x-1'>
                      <Text className={cn(AppStyles.textBold, 'flex-1')}>
                        {vaccineType.title}
                      </Text>
                    </View>
                    {vaccineMethod && (
                      <InfoRow
                        label={t('label.method')}
                        value={vaccineMethod.title}
                        valueClassName='font-mainBold'
                      />
                    )}
                    <View className='border-b border-quillGrey mt-1 mb-2' />
                  </React.Fragment>
                )}
                <Text className={AppStyles.labelBold}>
                  {t('label.patient_identity')}
                </Text>
                {patients?.map((item) => renderPatientItem(item))}
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </BottomSheet>
  )
}

export default React.memo(PatientDetailBottomSheet)
