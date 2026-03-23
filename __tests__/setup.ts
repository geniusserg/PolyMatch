/**
 * Jest Test Setup
 */

// Mock expo modules
jest.mock('expo-clipboard', () => ({
  getStringAsync: jest.fn(),
  setStringAsync: jest.fn(),
}));

jest.mock('expo-camera', () => ({
  Camera: {
    useCameraPermissions: jest.fn(() => [true, { request: jest.fn() }]),
  },
}));

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock fetch globally
global.fetch = jest.fn();

// Silence console.warn during tests
beforeEach(() => {
  jest.clearAllMocks();
  (global.fetch as jest.Mock).mockClear();
});
