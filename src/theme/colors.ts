import { store } from '@/services/store'
import palette from './palette'

const selectAppThemeColor = () => store.getState().setting.appTheme.color
const selectMainColor = () => {
  const state = store.getState().setting
  return state.programColor
}
const selectMainTextColor = () => {
  const state = store.getState().setting
  return state.programTextColor
}

export default {
  ...palette,
  app: selectAppThemeColor,
  main: selectMainColor,
  mainText: selectMainTextColor,
}
