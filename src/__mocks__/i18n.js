module.exports = {
  t: (key) => key, // Mock translation function to return the key itself
  i18n: {
    use: jest.fn().mockReturnThis(), // Mock 'use' chain function
    init: jest.fn().mockResolvedValue({}), // Mock 'init' as a no-op
    changeLanguage: jest.fn(), // Optional: mock any additional methods as needed
  },
}
