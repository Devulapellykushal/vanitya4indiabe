// Shared constants for Vanitya frontend

export const DEFAULT_SOURCE_LANG = 'hi';
export const DEFAULT_TARGET_LANG = 'te';

export const LANGUAGE_CODES = {
  HINDI: 'hi',
  TELUGU: 'te',
  TAMIL: 'ta',
  KANNADA: 'kn',
  MALAYALAM: 'ml',
  GUJARATI: 'gu',
  MARATHI: 'mr',
  PUNJABI: 'pa',
  BENGALI: 'bn',
  ODIA: 'or',
  ASSAMESE: 'as',
  URDU: 'ur',
} as const;

export const API_ENDPOINTS = {
  SARVAM: 'https://api.sarvam.ai/v1',
  AI4BHARAT: 'https://api.ai4bharat.org',
  AKSHARAMUKHA: 'https://aksharamukha.example',
} as const;

export const STORAGE_TYPES = {
  LOCAL: 'local',
  S3: 's3',
} as const;