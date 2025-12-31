import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { TxCode } from '@/i18n'
import { saveLocalData } from '@/storage'
import { ThemeStyle, themeVariant, ThemeVariant } from '@/theme/theme-config'
import { getReadableTextColor } from '@/utils/CommonUtils'
import { STORAGE_KEY } from '@/utils/Constants'
import { setApiLanguage } from '../api'
import { settingApi } from '../apis/setting.api'

interface SettingState {
  language: TxCode
  appTheme: ThemeStyle
  themeVariant: ThemeVariant
  selectedTheme: string
  programColor?: string
  programTextColor?: string
}
const initialState: SettingState = {
  language: 'id',
  appTheme: themeVariant.app,
  themeVariant,
  selectedTheme: 'app',
  programTextColor: 'white',
}

export const settingSlice = createSlice({
  name: 'setting',
  initialState,
  reducers: {
    setLanguage(state, action: PayloadAction<TxCode>) {
      setApiLanguage(action.payload)
      state.language = action.payload
      saveLocalData(STORAGE_KEY.SETTINGS, { language: action.payload })
    },
    setAppTheme(state, action: PayloadAction<string>) {
      const isHasProperty = themeVariant.hasOwnProperty(action.payload)
      state.selectedTheme = isHasProperty ? action.payload : 'app'
    },
    setProgramColor(state, action: PayloadAction<string>) {
      const textColor = getReadableTextColor(action.payload)
      state.programColor = action.payload
      state.programTextColor = textColor === 'light' ? '#ffffff' : '#073b4c'
    },
    clearTheme(state) {
      state.programColor = state.appTheme.color
      state.programTextColor = 'white'
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      settingApi.endpoints.getColorSetting.matchFulfilled,
      (state, { payload }) => {
        const theme = payload
        state.appTheme = theme.app
        state.themeVariant = theme
      }
    )
  },
})

export const { setLanguage, setAppTheme, setProgramColor, clearTheme } =
  settingSlice.actions
export const settingReducer = settingSlice.reducer
