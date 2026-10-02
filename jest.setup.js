jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

jest.mock("expo-sqlite", () => ({
  openDatabaseSync: jest.fn(() => ({
    execSync: jest.fn(),
    runSync: jest.fn(),
    getAllSync: jest.fn(() => []),
    getFirstSync: jest.fn(() => null),
  })),
}));

jest.mock("expo-local-authentication", () => ({
  hasHardwareAsync: jest.fn(() => Promise.resolve(true)),
  isEnrolledAsync: jest.fn(() => Promise.resolve(true)),
  authenticateAsync: jest.fn(() => Promise.resolve({ success: true })),
}));

jest.mock("expo-location", () => ({
  requestForegroundPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: "granted" })
  ),
  getCurrentPositionAsync: jest.fn(() =>
    Promise.resolve({
      coords: { latitude: -22.9068, longitude: -43.1729 },
    })
  ),
  Accuracy: { Balanced: 3 },
}));

jest.mock("expo-crypto", () => ({
  getRandomBytes: jest.fn((len) => new Uint8Array(len).fill(42)),
  digestStringAsync: jest.fn(() => Promise.resolve("fakehash123")),
  CryptoDigestAlgorithm: { SHA256: "SHA-256", SHA512: "SHA-512" },
}));