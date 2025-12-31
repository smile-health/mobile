import React, { useCallback } from 'react'
import { ScrollView, View } from 'react-native'
import { Icons } from '@/assets/icons'
import { useLanguage } from '@/i18n/useLanguage'
import { CONTACTS } from '@/utils/Constants'
import ContactItem from './components/ContactItem'
import HelpDeskQRCode from './components/HelpDeskQRCode'

export default function HelpCenterScreen() {
  const { t } = useLanguage()

  const renderItem = useCallback(
    (item) => {
      const { icon, label, ...contactProps } = item
      return (
        <ContactItem
          key={item.type}
          Icon={Icons[icon]}
          label={t(label)}
          {...contactProps}
        />
      )
    },
    [t]
  )

  return (
    <View className='flex-1 bg-white'>
      <ScrollView contentContainerClassName='p-4 gap-y-4'>
        {CONTACTS.map((item) => renderItem(item))}
        <HelpDeskQRCode />
      </ScrollView>
    </View>
  )
}
