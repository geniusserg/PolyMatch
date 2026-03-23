/**
 * Jest Test Setup
 */

// Mock expo modules
jest.mock('expo-clipboard', () => ({
  getStringAsync: jest.fn(),
  setStringAsync: jest.fn(),
}));

// Mock fetch globally
global.fetch = jest.fn();

// Silence console.warn during tests
beforeEach(() => {
  jest.clearAllMocks();
  (global.fetch as jest.Mock).mockClear();
});
