import React from 'react'
import { LogBox, View, StyleSheet } from 'react-native'
import * as Sentry from '@sentry/react-native'
import { useFonts } from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context'
import { Provider } from 'react-redux'
import PortalProvider from './components/portals/PortalProvider'
import { Snackbar } from './components/Snackbar'
import { DebugWrapper } from './components/view/DebugWrapper'
import { Theme } from './components/view/Theme'
import { usePushNotifications } from './hooks/usePushNotifications'
import { AppNavigator } from './navigators/AppNavigator'
import { store } from './services/store'
import './i18n'
import { snackbarRef } from './utils/CommonUtils'
import '../global.css'

// Configuration
LogBox.ignoreAllLogs(true)
SplashScreen.preventAutoHideAsync()

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  tracesSampleRate: Number.parseFloat(
    process.env.EXPO_PUBLIC_SENTRY_TRACE_SAMPLE_RATE ?? '1.0'
  ),
})

// Font configuration
const FONTS = {
  'Lato-Bold': require('./assets/fonts/Lato-Bold.ttf'),
  'Lato-Medium': require('./assets/fonts/Lato-Medium.ttf'),
  'Lato-Regular': require('./assets/fonts/Lato-Regular.ttf'),
}

// Components
const SafeAreaWrapper = ({ children }: { children: React.ReactNode }) => {
  const insets = useSafeAreaInsets()
  return (
    <View
      style={[
        styles.safeArea,
        {
          paddingBottom: insets.bottom,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        },
      ]}>
      {children}
    </View>
  )
}

function App() {
  const [loaded, error] = useFonts(FONTS)
  const { initializePushNotifications } = usePushNotifications()

  React.useEffect(() => {
    if (loaded || error) {
      initializePushNotifications()
    }
  }, [loaded, error, initializePushNotifications])

  if (!loaded && !error) {
    return null
  }

  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <Theme>
          <PortalProvider>
            <DebugWrapper>
              <SafeAreaWrapper>
                <AppNavigator />
              </SafeAreaWrapper>
            </DebugWrapper>
          </PortalProvider>
          <Snackbar ref={snackbarRef} />
        </Theme>
      </Provider>
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
})

export default Sentry.wrap(App)
