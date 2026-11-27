/** Modul react-redux yang memakai store asli. jest.mock('react-redux', () => require('@/test-utils/misc-store').reduxModule) */
export const reduxModule = {
  Provider: ({ children }: any) => children,
  useSelector: (sel: any) => sel(require('@/services/store').store.getState()),
  useDispatch: () => require('@/services/store').store.dispatch,
  useStore: () => require('@/services/store').store,
}
