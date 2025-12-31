import AsyncStorage from '@react-native-async-storage/async-storage'
import Reactotron, { asyncStorage, openInEditor } from 'reactotron-react-native'

const reactotron = Reactotron.setAsyncStorageHandler(AsyncStorage)
  .configure({
    name: 'Smile Platform',
  })
  .useReactNative({
    networking: {
      ignoreContentTypes: /^(image)\/.*$/i,
      ignoreUrls: /\/(logs|symbolicate)$/,
    },
  })
  .use(asyncStorage())
  .use(openInEditor())
  .connect()
  .clear()

export default reactotron
