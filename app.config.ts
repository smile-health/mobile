import { ExpoConfig, ConfigContext } from 'expo/config'

interface CustomExpoConfig extends ExpoConfig {
  hooks?: {
    postPublish?: Array<{
      file: string
      config: {
        organization: string
        project: string
      }
    }>
  }
}

export default ({ config }: ConfigContext): CustomExpoConfig => {
  const defaultConfig: CustomExpoConfig = {
    ...config,
    name: 'SMILE Health',
    slug: 'smile-platform-via-smile-monitor',
    version: '5.0.13',
    newArchEnabled: true,
    orientation: 'portrait',
    icon: './src/assets/images/img_smile_logo_rectangle.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './src/assets/images/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.smilemonitor',
      googleServicesFile: './GoogleService-Info.plist',
      infoPlist: {
        UIBackgroundModes: ['remote-notification'],
        ITSAppUsesNonExemptEncryption: false,
      },
      buildNumber: '28',
      entitlements: {
        'aps-environment': 'production',
      },
    },
    android: {
      edgeToEdgeEnabled: true,
      versionCode: 28,
      icon: './src/assets/images/img_smile_logo_rectangle.png',
      package: 'com.smilemonitor',
      allowBackup: false,
      googleServicesFile: './google-services.json',
      blockedPermissions: [
        'android.permission.RECORD_AUDIO',
        'android.permission.READ_EXTERNAL_STORAGE',
        'android.permission.WRITE_EXTERNAL_STORAGE',
        'android.permission.SYSTEM_ALERT_WINDOW',
        'android.permission.USE_BIOMETRIC',
        'android.permission.USE_FINGERPRINT',
        'android.permission.BROADCAST_CLOSE_SYSTEM_DIALOGS',
        'android.permission.WAKE_LOCK',
        'android.permission.RECEIVE_BOOT_COMPLETED',
        'android.permission.FOREGROUND_SERVICE',
        'android.permission.USE_FULL_SCREEN_INTENT',
        'android.permission.SCHEDULE_EXACT_ALARM',
      ],
    },
    extra: {
      eas: {
        projectId: '92dcbd5b-7287-493c-9300-4afe661da4a4',
      },
    },
    owner: 'smile-platform',
    plugins: [
      [
        'expo-font',
        {
          fonts: [
            './src/assets/fonts/Lato-Bold.ttf',
            './src/assets/fonts/Lato-Medium.ttf',
            './src/assets/fonts/Lato-Regular.ttf',
          ],
        },
      ],
      '@react-native-firebase/app',
      '@react-native-firebase/messaging',
      [
        'expo-build-properties',
        {
          ios: {
            useFrameworks: 'static',
          },
        },
      ],
      'expo-localization',
      [
        '@sentry/react-native/expo',
        {
          url: 'https://sentry.io/',
          project: 'smile-v5-mobile',
          organization: 'smile-platform-mobile',
        },
      ],
    ],
    runtimeVersion: '5.0.13',
    updates: {
      url: 'https://u.expo.dev/92dcbd5b-7287-493c-9300-4afe661da4a4',
    },
    hooks: {
      postPublish: [
        {
          file: 'sentry-expo/upload-sourcemaps',
          config: {
            organization: 'smile-platform-mobile',
            project: 'smile-v5-mobile',
          },
        },
      ],
    },
  }

  if (process.env.APP_ENVIRONMENT === 'production') {
    return defaultConfig
  } else if (process.env.APP_ENVIRONMENT === 'staging') {
    return {
      ...defaultConfig,
      name: 'Smile Platform Stg',
      android: {
        ...defaultConfig.android,
        package: 'com.smilemonitor.stg',
      },
      ios: {
        ...defaultConfig.ios,
        bundleIdentifier: 'com.smilemonitor.stg',
      },
    }
  } else {
    return {
      ...defaultConfig,
      name: 'Smile Platform Dev',
      android: {
        ...defaultConfig.android,
        package: 'com.smilemonitor.dev',
      },
      ios: {
        ...defaultConfig.ios,
        bundleIdentifier: 'com.smilemonitor.dev',
      },
      plugins: [
        ...(defaultConfig.plugins as [string, any][]),
        [
          'expo-build-properties',
          {
            android: {
              usesCleartextTraffic: true,
            },
          },
        ],
      ],
    }
  }
}
