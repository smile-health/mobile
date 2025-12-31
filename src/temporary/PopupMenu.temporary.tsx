import React, { useLayoutEffect, useMemo, useState } from 'react'
import { FlatList, Text, View } from 'react-native'
import { useForm } from 'react-hook-form'
import { Icons } from '@/assets/icons'
import { Button, ImageButton } from '@/components/buttons'
import { SearchField } from '@/components/forms'
import { PopupMenu } from '@/components/menu/PopupMenu'
import { SearchBar, Toolbar } from '@/components/toolbar'
import { AppStackScreenProps } from '@/navigators'

interface Props extends AppStackScreenProps<'Home'> {}

const languageOptions = [
  { code: 'id', label: 'Indonesia' },
  { code: 'en', label: 'English' },
]

const dummyData = Array.from({ length: 10 }).map((_, index) => ({
  id: index,
  name: `User ${index}`,
}))

export default function HomeScreen({ navigation }: Props) {
  const { control, setValue, watch } = useForm<{
    searchQuery: string
    id: number
  }>()
  const [isSearch, setIsSearch] = useState(false)
  const [users] = useState(dummyData)
  const [showMenu, setShowMenu] = useState(false)
  const searchID = watch('id')

  useLayoutEffect(() => {
    if (isSearch) {
      navigation.setOptions({
        header: () => (
          <SearchBar
            control={control}
            name='searchQuery'
            placeholder='Cari ID tapi di SearchBar'
            onResetField={() => {
              setValue('searchQuery', '')
            }}
            onPressBack={() => {
              setIsSearch(false)
              setValue('searchQuery', '')
            }}
            onSubmitEditing={() => {
              // call when submit button pressed ()
            }}
          />
        ),
      })
    } else {
      navigation.setOptions({
        header: () => (
          <Toolbar
            title='Login'
            subtitle='Login Screen'
            showBackButton={false}
            actions={
              <>
                <ImageButton
                  Icon={Icons.IcSearch}
                  onPress={() => setShowMenu(true)}
                />
              </>
            }
          />
        ),
      })
    }
  }, [isSearch, navigation, control, setValue, showMenu])

  const filteredUser = useMemo(() => {
    if (!users) return []
    return users.filter((user) => {
      if (searchID && user.id !== Number(searchID)) {
        return false
      }
      return true
    })
  }, [users, searchID])

  const renderItem = ({ item }) => (
    <View className='px-3 py-3 bg-white pb-2 border-b border-b-slate-300'>
      <Text className='font-mainBold text-marine'>{item.id}</Text>
      <Text className='font-mainBold text-marine'>{item.name}</Text>
    </View>
  )
  return (
    <View className='flex-1'>
      <SearchField
        control={control}
        name='id'
        placeholder='Pencarian berdasarkan ID'
        keyboardType='numeric'
        containerClassName='bg-white px-4 py-2 border-b border-b-whiteTwo'
      />
      <PopupMenu
        data={languageOptions}
        labelField='label'
        modalVisible={showMenu}
        containerClassName='right-4'
        dismissDialog={() => {
          setShowMenu(false)
        }}>
        <Button
          preset='filled'
          text='Language'
          onPress={() => setShowMenu(true)}
        />
      </PopupMenu>
      <FlatList data={filteredUser} renderItem={renderItem} />
    </View>
  )
}
