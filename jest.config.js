module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '\\.svg$': '<rootDir>/src/test-utils/svgMock.js',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/mocks/(.*)$': '<rootDir>/src/__mocks__/$1', // Map to the new mocks directory under src
  },
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native|expo|expo-localization|expo-modules-core|@expo|@unimodules|unimodules|nativewind|react-native-css-interop)',
  ],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  // Konvensi nama: *.readonly.test.ts(x) = render/util/selector murni baca;
  // *.write.test.ts(x) = mengubah state store / mock API.
  // npm run test:readonly | test:write | test (keduanya)
  testMatch: ['**/*.(readonly|write).test.(ts|tsx|js)'],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/screens/**/*.{ts,tsx}',
    'src/hooks/**/*.{ts,tsx}',
    'src/services/**/*.{ts,tsx}',
    '!**/__tests__/**',
    '!**/__test__/**',
    '!**/*.d.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['lcov', 'text', 'text-summary'], // lcov untuk SonarQube
  // Lantai (ratchet) saat ini; naikkan tiap menambah test. Target akhir 80%
  // ada di jest.coverage-gate.config.js (npm run test:coverage:gate).
  coverageThreshold: {
    global: { statements: 60, branches: 44, functions: 53, lines: 61 },
  },
}
