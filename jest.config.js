module.exports = {
  // RN 0.81+ moved the Jest preset out of the react-native package.
  preset: '@react-native/jest-preset',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '\\.svg$': '<rootDir>/src/__mocks__/svgMock.js',
    '^react-native-reanimated$':
      '<rootDir>/src/__mocks__/react-native-reanimated.js',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/mocks/(.*)$': '<rootDir>/src/__mocks__/$1', // Map to the new mocks directory under src
  },
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native|expo|expo-localization|expo-modules-core|@expo|@unimodules|unimodules|nativewind|react-native-css-interop|immer|@reduxjs/toolkit|react-native-worklets|@react-navigation)',
  ],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['lcov', 'text'], // Include lcov for SonarQube
}
