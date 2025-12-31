/* eslint-disable unicorn/prefer-spread */
import { configureStore } from '@reduxjs/toolkit'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import api from './api'
import {
  allocateReducer,
  authReducer,
  cvaReducer,
  disposalReducer,
  materialsReducer,
  notifReducer,
  ordersReducer,
  transactionTypesReducer,
  vendorReducer,
} from './features'
import { activityReducer } from './features/activity.slice'
import { homeReducer } from './features/home.slice'
import { orderReducer } from './features/order.slice'
import { reasonOrderReducer } from './features/reason-order.slice'
import { reconciliationReducer } from './features/reconciliation.slice'
import { relocationReducer } from './features/relocation.slice'
import { reviewReducer } from './features/review.slice'
import { settingReducer } from './features/setting.slice'
import { stockTakingReducer } from './features/stock-taking.slice'
import { stockReducer } from './features/stock.slice'
import ticketReducer from './features/ticket.slice'
import { ticketReasonReducer } from './features/ticketReason.slice'
import { transactionReducer } from './features/transaction.slice'
import { vaccineSequenceReducer } from './features/vaccine-sequence.slice'
import { workspacesReducer } from './features/workspace.slice'

// ✅ CRITICAL: Performance-optimized middleware configuration
const createMiddleware = (getDefaultMiddleware: any) => {
  return getDefaultMiddleware({
    // ✅ CRITICAL: Completely disable SerializableStateInvariantMiddleware in ALL environments
    // This middleware causes 30-90ms delay per action in ALL builds, not just development
    serializableCheck: false,

    // ✅ CRITICAL: Completely disable ImmutableStateInvariantMiddleware in ALL environments
    // This middleware also causes significant performance overhead in ALL environments
    immutableCheck: false,

    // ✅ Keep thunk middleware enabled (needed for async actions)
    thunk: {
      extraArgument: {
        // Add any extra arguments for thunks if needed
      },
    },
  }).concat(api.middleware)
}

export const store = configureStore({
  reducer: {
    auth: authReducer,
    setting: settingReducer,
    workspace: workspacesReducer,
    home: homeReducer,
    order: orderReducer,
    review: reviewReducer,
    activity: activityReducer,
    disposal: disposalReducer,
    notif: notifReducer,
    stock: stockReducer,
    transaction: transactionReducer,
    cva: cvaReducer,
    transactionTypes: transactionTypesReducer,
    materials: materialsReducer,
    vaccineSequence: vaccineSequenceReducer,
    vendor: vendorReducer,
    orders: ordersReducer,
    stockTaking: stockTakingReducer,
    ticketReason: ticketReasonReducer,
    reconciliation: reconciliationReducer,
    ticket: ticketReducer,
    relocation: relocationReducer,
    allocate: allocateReducer,
    reasonOrder: reasonOrderReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: createMiddleware,
  // ✅ DevTools should only be enabled in development
  devTools: __DEV__,
  // ✅ Enable state preloading if needed
  preloadedState: undefined,
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// ✅ Optimized typed hooks with proper typing
export const useAppDispatch = (): AppDispatch => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

export const settingState = (state: RootState) => state.setting
export const authState = (state: RootState) => state.auth
export const workspaceState = (state: RootState) => state.workspace
export const homeState = (state: RootState) => state.home
export const orderState = (state: RootState) => state.order
export const reviewState = (state: RootState) => state.review
export const activityState = (state: RootState) => state.activity
export const notifState = (state: RootState) => state.notif
export const trxState = (state: RootState) => state.transaction
export const stockState = (state: RootState) => state.stock
export const cvaState = (state: RootState) => state.cva
export const transactionTypesState = (state: RootState) =>
  state.transactionTypes
export const materialsState = (state: RootState) => state.materials
export const vaccineSequenceState = (state: RootState) => state.vaccineSequence
export const vendorState = (state: RootState) => state.vendor
export const ordersState = (state: RootState) => state.orders
export const stockTakingState = (state: RootState) => state.stockTaking
export const reconciliationState = (state: RootState) => state.reconciliation
export const ticketState = (state: RootState) => state.ticket
export const relocationState = (state: RootState) => state.relocation
export const disposalState = (state: RootState) => state.disposal
export const allocateState = (state: RootState) => state.allocate
export const reasonOrderState = (state: RootState) => state.reasonOrder
