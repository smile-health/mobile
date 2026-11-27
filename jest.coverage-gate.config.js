const base = require('./jest.config')

// Gerbang target: statements/branches/functions/lines >= 80% untuk layar,
// hook, dan service. Jalankan: npm run test:coverage:gate
const target = { statements: 80, branches: 80, functions: 80, lines: 80 }

module.exports = {
  ...base,
  coverageThreshold: {
    './src/screens/': target,
    './src/hooks/': target,
    './src/services/': target,
  },
}
