import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { Icons } from '@/assets/icons'
import ActivityLabel from '@/components/ActivityLabel'
import { Button } from '@/components/buttons'
import { CheckBox } from '@/components/buttons/CheckBox'
import { InfoRow } from '@/components/list/InfoRow'
import { useLanguage } from '@/i18n/useLanguage'
import { TransactionConsumption } from '@/models/transaction/Transaction'
import { CreateTransaction } from '@/models/transaction/TransactionCreate'
import { identityTypeNames } from '@/screens/inventory/constant/transaction.constant'
import { trxConsumptionToCreateTransaction } from '@/screens/inventory/helpers/ReturnHFHelpers'
import AppStyles, { flexStyle } from '@/theme/AppStyles'
import colors from '@/theme/colors'
import { getTestID } from '@/utils/CommonUtils'
import TransactionReturnHFInfo from './TransactionReturnHFInfo'
import PatientItem from '../PatientInfo/PatientItem'

interface Props {
  item: TransactionConsumption
  selected: boolean
  testID: string
  onPress: (item: TransactionConsumption) => void
  onPressDetailPatient: (data: CreateTransaction) => void
}

function TransactionConsumptionItem({
  item,
  selected,
  testID,
  onPress,
  onPressDetailPatient,
}: Readonly<Props>) {
  const { t } = useLanguage()

  const {
    activity,
    created_at,
    change_qty,
    max_return,
    stock: { batch },
    patients,
  } = item

  const patient = patients?.[0]
  const vaccineType = patient?.vaccine_type
  const vaccineMethod = patient?.vaccine_method

  const showPatientSequence = !!vaccineType?.id && !!vaccineMethod?.id
  const showPatientNonSequence = !!patient && !showPatientSequence

  const handlePressItem = () => onPress(item)

  const handlePressDetailPatient = () => {
    onPressDetailPatient(trxConsumptionToCreateTransaction(item, false))
  }

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      className='gap-y-2 bg-white mb-4'
      onPress={handlePressItem}
      {...getTestID(testID)}>
      <View className='p-3 border border-quillGrey rounded-sm gap-y-1'>
        <View className='flex-row items-center  gap-x-2'>
          <Text className={AppStyles.textRegular} style={flexStyle}>
            {batch?.code ?? ''}
          </Text>
          <ActivityLabel name={activity?.name ?? ''} />
          <CheckBox
            checked={selected}
            onPress={handlePressItem}
            containerClassName='gap-x-0'
          />
        </View>
        <TransactionReturnHFInfo
          batch={batch}
          consumptionQty={change_qty}
          maxReturn={max_return}
          createdAt={created_at}
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
                onPress={handlePressDetailPatient}
                RightIcon={Icons.IcChevronRightActive}
                rightIconColor={colors.main()}
                rightIconSize={20}
                {...getTestID(`btn-detail-patient-${item.id}`)}
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
              identityType={identityTypeNames[patient?.identity_type]}
              patientID={patient?.identity_number ?? ''}
              phoneNumber={patient?.phone_number ?? ''}
            />
          </View>
        )}
      </View>
    </TouchableOpacity>
  )
}

export default React.memo(TransactionConsumptionItem)
