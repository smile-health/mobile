import {
  CommonActions,
  createNavigationContainerRef,
  Route,
} from '@react-navigation/native'
import { AppStackParamList } from '@/navigators/types'

export const navigationRef = createNavigationContainerRef<AppStackParamList>()

export function navigate<T extends keyof AppStackParamList>(
  name: T,
  params?: AppStackParamList[T]
) {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(CommonActions.navigate(name, params))
  }
}

export function navigateAndReset<T extends keyof AppStackParamList>(
  routes: Omit<Route<T, AppStackParamList[T]>, 'key'>[] = [],
  index = 0
) {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(
      CommonActions.reset({
        index,
        routes,
      })
    )
  }
}

export function navigateToLogin() {
  if (
    navigationRef.isReady() &&
    navigationRef.getCurrentRoute()?.name !== 'Login'
  ) {
    navigationRef.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      })
    )
  }
}

export function navigateToHome() {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      })
    )
  }
}
