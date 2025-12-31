import { registerRootComponent } from 'expo'
import { startNetworkLogging } from 'react-native-network-logger'
import App from '@/App'
import 'intl-pluralrules'
import { canShowNetworkLogger } from '@/utils/CommonUtils'

// Import background handler before app registration
import './backgroundHandler'

if (__DEV__) {
  require('./ReactotronConfig')
}

if (canShowNetworkLogger) {
  startNetworkLogging()
}
registerRootComponent(App)
