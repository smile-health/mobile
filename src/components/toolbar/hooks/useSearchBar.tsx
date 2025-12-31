import React, { Dispatch, SetStateAction, useLayoutEffect, useRef } from 'react'
import { useNavigation } from '@react-navigation/native'
import { SubmitHandler, useForm } from 'react-hook-form'
import { SearchBar, SearchBarProps } from '../SearchBar'
import { Toolbar, ToolbarProps } from '../Toolbar'

interface SearchToolbarProps
  extends Omit<
    SearchBarProps,
    'name' | 'control' | 'onSubmitEditing' | 'onResetField'
  > {
  isSearch: boolean
  setIsSearch: Dispatch<SetStateAction<boolean>>
  toolbarProps: ToolbarProps
  onSubmitSearch?: (text: string) => void
}
export function useSearchBar(props: SearchToolbarProps) {
  const navigation = useNavigation()

  const headerSetupRef = useRef<{ isSearch: boolean | null }>({
    isSearch: null,
  })

  const {
    isSearch,
    setIsSearch,
    onSubmitSearch,
    toolbarProps,
    ...searchbarProps
  } = props

  const { control, reset, handleSubmit } = useForm({
    mode: 'onSubmit',
    defaultValues: {
      search: '',
    },
  })

  const submitSearch: SubmitHandler<{ search: string }> = ({ search }) => {
    if (onSubmitSearch) {
      onSubmitSearch(search)
    }
  }

  const resetField = () => {
    reset()
    setIsSearch(false)
    if (onSubmitSearch) {
      onSubmitSearch('')
    }
  }

  useLayoutEffect(() => {
    if (headerSetupRef.current.isSearch === isSearch) {
      return
    }

    headerSetupRef.current.isSearch = isSearch

    if (isSearch) {
      navigation.setOptions({
        headerShown: true,
        header: () => (
          <SearchBar
            control={control}
            name='search'
            onResetField={resetField}
            onSubmitEditing={handleSubmit(submitSearch)}
            onPressBack={resetField}
            autoFocus
            {...searchbarProps}
          />
        ),
      })
    } else {
      navigation.setOptions({
        headerShown: true,
        header: () => <Toolbar {...toolbarProps} />,
      })
    }
  }, [
    isSearch,
    control,
    handleSubmit,
    navigation,
    searchbarProps,
    toolbarProps,
  ])
}
