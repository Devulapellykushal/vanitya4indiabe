// Test setup file for Jest/Bun
// This file is executed before all tests

// Mock environment variables if needed
process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';
process.env.SARVAM_API_KEY = process.env.SARVAM_API_KEY || 'test-sarvam-key';
process.env.AI4BHARAT_API_KEY = process.env.AI4BHARAT_API_KEY || 'test-ai4bharat-key';

// Increase timeout for async operations
jest.setTimeout(30000);

// Suppress console logs during tests (optional)
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
//   error: jest.fn(),
// };

