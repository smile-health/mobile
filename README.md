# SMILE PLATFORM MOBILE

## About
This document aims to provide information on the installation and development of the SMILE mobile applications.

## 1. Folder Structure

```text
project-root
├── .expo
├── .husky
├── .vscode
├── android
├── ios
├── node_modules
├── src
│   ├── assets
│   ├── components
│   ├── config
│   ├── i18n
│   ├── models
│   ├── navigators
│   ├── screens
│   ├── services
│   ├── storage
│   ├── temporary
│   ├── theme
│   ├── utils
│   └── App.tsx
├── types
├── .eslintignore
├── .eslintrc.json
├── .gitattributes
├── .gitignore
├── .gitlab-ci.yml
├── .prettierrc.js
├── app.json
├── babel.config.js
├── global.css
├── index.js
├── metro.config.js
├── nativewind-env.d.ts
├── package-lock.json
├── package.json
├── README.md
├── tailwind.config.js
└── tsconfig.json
```

- `src`: This folder is the main container of all the code inside your application.
  - `assets`: Asset folder to store all images, vectors, etc.
  - `components`: Folder to store any common component that you use through your app (such as a generic button)
  - `config`: Folder to store any kind of config constant that you have.
  - `i18n`: Folder to store the languages files.
  - `navigation`: Folder to store the navigators.
    - `AppNavigator.tsx`: File to put all screen
    - `types.ts`: File to define app screen and params. First place to register your screen.
  - `screens`: Folder that contains all your application screens/features.
    - `Auth`: Each screen should be stored inside its folder and inside it a file for its code.
      - `LoginScreen.tsx`
  - `selectors`: Folder to store your selectors for each reducer.
  - `storage`: Folder that contains the application storage logic using AsyncStorage.
    - `index.ts`: Storage helper function.
    - `types.ts`: File to put all app storage type to create storage.
  - `service`: Folder to put all rtk slices and rtk-query api services.
    - `apis`: Folder to put all api services.
    - `features`: Folder to put all feature-related rtk slice.
    - `api.ts`: File to define axios instance and api-related setting.
    - `store.ts`: File to put all app reducer rtk store-related setting.
  - `utils`: Folder to store utilities-related function.
  - `theme`: Folder to store all the styling concerns related to the application theme.
  - `App.js`: Main component that starts your whole app.
- `.gitlab-ci.yaml`: Gitlab CI setting file.
- `app.json`: Expo app configuration file.
- `index.js`: Entry point of your application as per React-Native standards.
- `tailwind.config.js`: tailwind configuration file e.g colors, font, etc.

## 2. Conventions

- Use TypeScript for type-safe code
- Follow ESLint and Prettier rules for code formatting
- Utilize the `src` directory for all application code
- Keep components in the `src/components` directory
- Store screen components in the `src/screens` directory with Suffix 'Screen' e.g LoginScreen.tsx
- Use the `src/navigators` directory for navigation setup and define screen param type to `src/navigators/types.ts` first
- Place utility functions in the `src/utils` directory
- Store theme-related files in the `src/theme` directory
- Use `src/services` for API calls and other services
- Keep configuration files in the `src/config` directory
- Use `src/models` for data models and types
- Store localization files in the `src/i18n` directory
- Use `src/storage` for local storage related code and define storage type to `src/storage/types.ts` first
- Naming convention
  - [Naming convention guideline](https://gitlab.badr.co.id/smile-platform/guideline/-/blob/main/rules/naming-cheatsheet.md)
  - [Naming convention reference](https://charlypoly.com/publications/react-components-naming-convention)
  - [On vs handle prefix on function](https://medium.com/@master_43681/understanding-and-proper-usage-of-on-and-handle-prefixes-in-react-function-naming-119f0beea400#:~:text=Generally%2C%20function%20names%20starting%20with,when%20a%20click%20event%20occurs.)

## 3. Setup

### Prerequisites

- Node.js (recommended : using nvm)
- npm
- Expo CLI

### Install

1. Clone the repository:

   ```bash
   git clone https://gitlab.badr.co.id/smile-platform/mobile-react-native.git
   ```

2. Navigate to the project directory:

   ```bash
   cd mobile-react-native
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

### Run

To start the development server:

```bash
npx expo start
```

This will open the Expo DevTools in your browser. You can then run the app on:

- iOS Simulator
- Android Emulator
- Your physical device using the Expo Go app

### Build EAS

- iOS build (.app) for simulator iOS:

```bash
eas build --profile ios_simulator_dev --platform ios
```

- iOS build (.ipa) for physical device:

```bash
eas build --profile preview --platform ios
```

- android build (.apk) for physical device:

```bash
eas build --profile preview --platform android
```

#### Build Locally (add: "--locally")

##### Add Android SDK path for Android Build Locally

Add android SDK into "preview" block at eas.json:

```json
  "preview": {
        "env": {
          "ANDROID_SDK_ROOT": "/Users/ridhofh/Library/Android/sdk"
        },
        ...
      },
```

and then, build .apk locally:

```bash
eas build --profile preview --platform android --local
```

## Additional Information

For more detailed information about Expo and React Native, refer to their official documentation:

- [Guideline](https://gitlab.badr.co.id/smile-platform/guideline)
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [Nativewind Documentation](https://www.nativewind.dev/v4/overview/)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/introduction/getting-started)
