import React, { useCallback } from 'react'
import { SectionList, Text, View, KeyboardAvoidingView } from 'react-native'
import { FormProvider } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Icons } from '@/assets/icons'
import { Button } from '@/components/buttons/Button'
import { AppStackScreenProps } from '@/navigators/types'
import DisposalInputItem from '@/screens/disposal/components/DisposalInputItem'
import useAddDisposalForm from '@/screens/disposal/hooks/useAddDisposalForm'
import AppStyles, { flexStyle } from '@/theme/AppStyles'
import colors from '@/theme/colors'
import { cn } from '@/theme/theme-config'
import { isIOS } from '@/utils/CommonUtils'
import AddDisposalMaterialInfo from '../components/AddDisposalMaterialInfo'
import DisposalShipmentHeader from '../components/DisposalShipmentHeader'

interface Props extends AppStackScreenProps<'AddDisposal'> {}

export default function AddDisposalScreen({ route }: Props) {
  const { t } = useTranslation()
  const { disposalStock, type } = route.params

  const {
    activity,
    material,
    methods,
    errors,
    isSaveEnabled,
    sections,
    handleSave,
  } = useAddDisposalForm({ disposalStock, type })

  const renderHeader = useCallback(
    () => (
      <AddDisposalMaterialInfo
        material={material}
        batch={disposalStock}
        activity={activity.name}
      />
    ),
    [activity.name, disposalStock, material]
  )

  const renderItem = useCallback(
    ({ item, index, section }) => {
      const fieldName = `${section.key}.${index}.disposal_qty`

      return (
        <DisposalInputItem
          type={type}
          name={fieldName}
          item={item}
          qtyType={section.key}
          control={methods.control}
          errors={errors?.[section.key]?.[index]?.disposal_qty?.message}
        />
      )
    },
    [methods.control, type, errors]
  )

  const renderSectionHeader = useCallback(
    ({ section }) => (
      <React.Fragment>
        <View className='h-2 bg-lightBlueGray' />
        <View className='bg-white p-4'>
          <Text className={cn(AppStyles.textBold, 'text-mediumGray')}>
            {section.title}
          </Text>
        </View>
      </React.Fragment>
    ),
    []
  )

  return (
    <View className='flex-1 bg-paleGreyTwo'>
      <KeyboardAvoidingView
        behavior={isIOS ? 'padding' : 'height'}
        style={flexStyle}>
        <DisposalShipmentHeader t={t} />
        <FormProvider {...methods}>
          <SectionList
            sections={sections}
            keyExtractor={(_, index) => String(index)}
            renderItem={renderItem}
            renderSectionHeader={renderSectionHeader}
            ListHeaderComponent={renderHeader}
            contentContainerClassName='bg-white pb-7'
            stickySectionHeadersEnabled={false}
          />
        </FormProvider>

        <View className='p-4 bg-white border-t border-paleGreyTwo'>
          <Button
            text={t('button.save')}
            LeftIcon={Icons.IcCheck}
            leftIconColor={colors.mainText()}
            containerClassName='gap-x-2'
            onPress={handleSave}
            preset='filled'
            disabled={!isSaveEnabled}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  )
}
