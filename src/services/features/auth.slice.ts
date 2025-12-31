import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { AuthDetail, ProfileResponse, RequestLoginV2Response } from '@/models'
import { saveLocalData, removeLocalData } from '@/storage'
import { STORAGE_KEY } from '@/utils/Constants'
import { setAuthToken, removeAuthToken, resetApiState } from '../api'
import { authApi, profileApi } from '../apis'

interface AuthState {
  user: ProfileResponse | null
  authDetails: AuthDetail | null
  isLoading: boolean
}

const initialState: AuthState = {
  user: null,
  authDetails: null,
  isLoading: false,
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoginData(state, action: PayloadAction<RequestLoginV2Response>) {
      state.authDetails = action.payload.authDetails
      setAuthToken(action.payload.authDetails.access_token)
    },
    setUserData(state, action: PayloadAction<ProfileResponse>) {
      state.user = action.payload
    },
    removeLoginData(state) {
      state.user = null
      state.authDetails = null
      removeAuthToken()
      removeLocalData(STORAGE_KEY.USER_LOGIN)
      removeLocalData(STORAGE_KEY.ACCESS_TOKEN)
      removeLocalData(STORAGE_KEY.REFRESH_TOKEN)
      resetApiState()
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      authApi.endpoints.loginUser.matchFulfilled,
      (state, { payload }) => {
        state.authDetails = payload.authDetails

        setAuthToken(payload.authDetails.access_token)
        saveLocalData(
          STORAGE_KEY.REFRESH_TOKEN,
          payload.authDetails.refresh_token
        )
        saveLocalData(
          STORAGE_KEY.ACCESS_TOKEN,
          payload.authDetails.access_token
        )
      }
    )
    builder.addMatcher(
      profileApi.endpoints.fetchProfile.matchFulfilled,
      (state, { payload }) => {
        state.user = { ...state.user, ...payload }
        saveLocalData(STORAGE_KEY.USER_LOGIN, payload)
      }
    )
  },
})

export const { setLoginData, setUserData, removeLoginData } = authSlice.actions
export const authReducer = authSlice.reducer
