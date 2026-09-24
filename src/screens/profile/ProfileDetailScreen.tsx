import React from 'react'
import {
  ActivityIndicator,
  SectionList,
  SectionListData,
  SectionListRenderItem,
  Text,
  View,
} from 'react-native'
import { ParseKeys } from 'i18next'
import { Button } from '@/components/buttons'
import { FieldValue } from '@/components/list/FieldValue'
import { ItemSeparator } from '@/components/list/ItemSeparator'
import { useLanguage } from '@/i18n/useLanguage'
import { AppStackScreenProps } from '@/navigators'
import { useFetchProfileQuery } from '@/services/apis'
import AppStyles from '@/theme/AppStyles'
import colors from '@/theme/colors'
import { cn } from '@/theme/theme-config'
import { getInitials, getTestID } from '@/utils/CommonUtils'
import { WorkspaceItem } from './component/WorkspaceItem'
import { getDetailSection } from './constant/profile.constant'

type SectionData = { label: string; value?: string | number | null; id: string }
type Section = { title: ParseKeys; data: SectionData[]; id: string }
type SectionHeader = (info: {
  section: SectionListData<SectionData, Section>
}) => React.ReactElement

interface Props extends AppStackScreenProps<'ProfileDetail'> {}

const itemSeparator = () => <ItemSeparator className='h-4' />

export default function ProfileDetailScreen({ navigation }: Props) {
  const { t } = useLanguage()
  const { data, isError, isLoading } = useFetchProfileQuery()

  const navigateToEditProfile = () => {
    navigation.navigate('EditProfile')
  }

  const navigateToEditPassword = () => {
    navigation.navigate('EditPassword')
  }

  if (isLoading) {
    return (
      <ActivityIndicator
        size='large'
        color={colors.app()}
        className='flex-1 justify-center items-center bg-white'
      />
    )
  }

  if (isError || !data) {
    return null
  }

  const { firstname, lastname, programs } = data
  const SECTION_DATA = getDetailSection(data, t)

  const renderListHeader = () => (
    <View className='h-16 w-16 rounded-full bg-aquaHaze items-center justify-center self-center mb-4'>
      <Text className='font-mainMedium text-2xl text-deepBlue'>
        {getInitials(`${firstname} ${lastname}`)}
      </Text>
    </View>
  )

  const renderSectionHeader: SectionHeader = ({ section: { title, id } }) => {
    const isWorkspace = title === 'section.workspace_entity_info'
    return (
      <View className='px-4'>
        <Text className={cn(AppStyles.textBold, 'mb-4')} {...getTestID(id)}>
          {t(title)}
        </Text>
        {isWorkspace && (
          <View className='gap-y-2 mb-4'>
            {programs.map((item) =>
              item.status ? (
                <WorkspaceItem
                  key={item.id}
                  item={item}
                  activeOpacity={1}
                  {...getTestID(`workspace-item-${item.key}`)}
                />
              ) : null
            )}
          </View>
        )}
      </View>
    )
  }

  const renderItem: SectionListRenderItem<SectionData> = ({ item }) => {
    return (
      <FieldValue
        label={item.label}
        value={item.value}
        containerClassName='px-4'
        {...getTestID(item.id)}
      />
    )
  }

  const renderSectionSeparator = ({ leadingItem, trailingSection }) =>
    leadingItem && trailingSection ? (
      <View className='bg-lightBlueGray py-1 my-4' />
    ) : null

  return (
    <View className='flex-1 bg-white'>
      <SectionList
        sections={SECTION_DATA}
        keyExtractor={({ label }) => label}
        contentContainerClassName='py-4'
        stickySectionHeadersEnabled={false}
        renderItem={renderItem}
        ItemSeparatorComponent={itemSeparator}
        ListHeaderComponent={renderListHeader}
        SectionSeparatorComponent={renderSectionSeparator}
        renderSectionHeader={renderSectionHeader}
      />
      <View className='flex-row bg-white p-4 shadow-sm gap-x-2'>
        <Button
          text={t('button.change_password')}
          preset='outlined-primary'
          containerClassName='flex-1 border-bluePrimary'
          textClassName='text-bluePrimary'
          onPress={navigateToEditPassword}
          {...getTestID('btn-nav-edit-password')}
        />
        <Button
          text={t('button.change_profile')}
          preset='outlined-primary'
          containerClassName='flex-1 border-bluePrimary'
          textClassName='text-bluePrimary'
          onPress={navigateToEditProfile}
          {...getTestID('btn-nav-edit-profile')}
        />
      </View>
    </View>
  )
}
